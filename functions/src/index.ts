import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as turf from "@turf/turf";

export * from "./vesselSync";

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

type AlertSeverity = "low" | "medium" | "high" | "critical";
type AlertStatus = "open" | "reviewed" | "resolved";

interface FleetVessel {
    id: string;
    name?: string;
    imo?: string;
    lat?: number;
    lng?: number;
    heading?: number;
    speed?: number;
    status?: string;
    nextPort?: string;
    eta?: string;
    type?: string;
    organizationId?: string | null;
    orgId?: string | null;
}

interface RiskZoneDefinition {
    id: string;
    name: string;
    polygon: Array<[number, number]>;
    riskType: string;
    severity: AlertSeverity;
}

interface CompiledRiskZone extends RiskZoneDefinition {
    feature: ReturnType<typeof turf.polygon>;
}

interface AlertCandidate {
    type: string;
    vesselId: string;
    vesselName: string;
    severity: AlertSeverity;
    status: AlertStatus;
    description: string;
    zoneId: string | null;
    organizationId: string | null;
    location: {
        lat: number;
        lng: number;
    };
    dedupScopeId: string;
}

const HOURS_TO_MS = 60 * 60 * 1000;
const ALERT_DEDUP_WINDOW_HOURS = 6;
const ALERT_DEDUP_WINDOW_MS = ALERT_DEDUP_WINDOW_HOURS * HOURS_TO_MS;
const MAX_BATCH_OPERATIONS = 400;
const STOPPED_VESSEL_THRESHOLD_KNOTS = 0.5;
const STOPPED_VESSEL_DEDUP_SCOPE = "vessel_stopped";
const PORT_LIKE_STATUSES = new Set([
    "anchored",
    "at anchor",
    "at_anchor",
    "berthed",
    "docked",
    "in port",
    "in_port",
    "moored",
]);

// These polygons are operational geofences inferred from published geographic extents
// for each chokepoint or basin. Coordinates are [lng, lat].
const HIGH_RISK_ZONES: RiskZoneDefinition[] = [
    {
        id: "suez_canal",
        name: "Suez Canal Transit Zone",
        polygon: [
            [32.16, 31.36],
            [32.70, 31.36],
            [32.74, 30.70],
            [32.69, 29.86],
            [32.38, 29.86],
            [32.16, 31.36],
        ],
        riskType: "HIGH_TRAFFIC_ZONE",
        severity: "medium",
    },
    {
        id: "strait_of_hormuz",
        name: "Strait of Hormuz",
        polygon: [
            [55.00, 26.95],
            [56.00, 27.35],
            [57.25, 26.85],
            [57.15, 25.70],
            [56.10, 25.45],
            [55.05, 25.85],
            [55.00, 26.95],
        ],
        riskType: "HIGH_TRAFFIC_ZONE",
        severity: "high",
    },
    {
        id: "gulf_of_aden",
        name: "Gulf of Aden Piracy Zone",
        polygon: [
            [43.00, 10.75],
            [44.70, 14.70],
            [48.20, 14.85],
            [51.27, 12.20],
            [51.27, 10.75],
            [43.00, 10.75],
        ],
        riskType: "PIRACY_RISK",
        severity: "high",
    },
    {
        id: "malacca_strait",
        name: "Strait of Malacca",
        polygon: [
            [95.00, 5.95],
            [97.80, 6.20],
            [100.90, 5.70],
            [103.70, 2.35],
            [104.30, 1.00],
            [103.35, 0.85],
            [100.20, 1.85],
            [97.20, 3.65],
            [95.00, 5.95],
        ],
        riskType: "HIGH_TRAFFIC_ZONE",
        severity: "medium",
    },
    {
        id: "bab_el_mandeb",
        name: "Bab-el-Mandeb Strait",
        polygon: [
            [42.20, 13.80],
            [43.85, 13.80],
            [43.95, 12.85],
            [43.45, 12.10],
            [42.35, 12.10],
            [42.20, 13.80],
        ],
        riskType: "CONFLICT_ZONE",
        severity: "critical",
    },
];

const COMPILED_HIGH_RISK_ZONES: CompiledRiskZone[] = HIGH_RISK_ZONES.map((zone) => ({
    ...zone,
    feature: turf.polygon([closePolygon(zone.polygon)]),
}));

/**
 * FATHOM: Real-Time Fleet Ingestion Pipeline (Phase 4)
 *
 * Every five minutes this function:
 * 1. pulls the latest vessel snapshot,
 * 2. upserts vessel locations,
 * 3. evaluates multi-zone geofences and stopped-vessel anomalies,
 * 4. writes deduplicated alerts plus TTL-backed dedup markers.
 */
export const ingestFleetData = onSchedule("every 5 minutes", async () => {
    try {
        console.log("[FATHOM Ingestion] Starting fleet risk evaluation from Firestore.");

        const vesselSnapshot = await db.collection("vessels").get();
        const vessels = vesselSnapshot.docs.map((doc) => ({
            ...(doc.data() as FleetVessel),
            id: doc.id,
        }))
        console.log(`[FATHOM Ingestion] Loaded ${vessels.length} vessel records from Firestore.`);

        if (vessels.length === 0) {
            return;
        }

        const nowMs = Date.now();
        const nowTimestamp = admin.firestore.Timestamp.fromMillis(nowMs);
        const expiresAt = admin.firestore.Timestamp.fromMillis(nowMs + ALERT_DEDUP_WINDOW_MS);
        const currentHourBucket = getHourBucket(nowMs);
        const relevantHourBuckets = getRecentHourBuckets(currentHourBucket, ALERT_DEDUP_WINDOW_HOURS);

        const vesselRefs = vessels.map((vessel) => db.collection("vessels").doc(String(vessel.id)));
        const existingVesselSnapshots = vesselRefs.length > 0 ? await db.getAll(...vesselRefs) : [];
        const existingVesselById = new Map<string, FirebaseFirestore.DocumentData>(
            existingVesselSnapshots.map((snapshot) => [snapshot.id, snapshot.data() ?? {}])
        );

        let batch = db.batch();
        let batchOperationCount = 0;
        const commitPromises: Array<Promise<FirebaseFirestore.WriteResult[]>> = [];

        const queueSet = (
            ref: FirebaseFirestore.DocumentReference,
            data: FirebaseFirestore.DocumentData,
            options?: FirebaseFirestore.SetOptions
        ) => {
            if (options) {
                batch.set(ref, data, options);
            } else {
                batch.set(ref, data);
            }

            batchOperationCount += 1;

            if (batchOperationCount >= MAX_BATCH_OPERATIONS) {
                commitPromises.push(batch.commit());
                batch = db.batch();
                batchOperationCount = 0;
            }
        };

        const candidateAlertsByScope = new Map<string, AlertCandidate>();

        for (const vessel of vessels) {
            const vesselId = String(vessel.id);
            const existingVessel = existingVesselById.get(vesselId) ?? {};
            const organizationId = getOrganizationId(vessel, existingVessel);
            const vesselName = getVesselName(vessel, existingVessel);
            const lat = getNumber(vessel.lat, existingVessel.lat);
            const lng = getNumber(vessel.lng, existingVessel.lng);
            const speed = getNumber(vessel.speed, existingVessel.speed) ?? 0;
            const status = getString(vessel.status, existingVessel.status)?.toLowerCase() ?? "unknown";
            const vesselDocument = omitUndefined({
                ...existingVessel,
                ...vessel,
                id: vesselId,
                name: vesselName,
                organizationId,
                lat,
                lng,
                speed,
                status,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });

            queueSet(
                db.collection("vessels").doc(vesselId),
                vesselDocument,
                { merge: true }
            );

            if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) {
                console.warn(`[FATHOM Ingestion] Skipping risk evaluation for vessel ${vesselId}: invalid coordinates.`);
                continue;
            }

            const vesselPoint = turf.point([lng, lat]);

            for (const zone of COMPILED_HIGH_RISK_ZONES) {
                if (!turf.booleanPointInPolygon(vesselPoint, zone.feature)) {
                    continue;
                }

                const candidate = buildZoneAlertCandidate({
                    vessel,
                    vesselId,
                    vesselName,
                    organizationId,
                    lat,
                    lng,
                    zone,
                });

                candidateAlertsByScope.set(`${candidate.vesselId}:${candidate.dedupScopeId}`, candidate);
            }

            if (isStoppedInOpenWater(vessel, existingVessel, speed, status)) {
                const candidate = buildStoppedAlertCandidate({
                    vesselId,
                    vesselName,
                    organizationId,
                    lat,
                    lng,
                });

                candidateAlertsByScope.set(`${candidate.vesselId}:${candidate.dedupScopeId}`, candidate);
            }
        }

        const dedupRefs: FirebaseFirestore.DocumentReference[] = [];
        const dedupRefIds = new Set<string>();

        for (const candidate of Array.from(candidateAlertsByScope.values())) {
            for (const hourBucket of relevantHourBuckets) {
                const dedupRef = db.collection("alertDedup").doc(
                    buildDedupDocId(candidate.vesselId, candidate.dedupScopeId, hourBucket)
                );

                if (dedupRefIds.has(dedupRef.id)) {
                    continue;
                }

                dedupRefs.push(dedupRef);
                dedupRefIds.add(dedupRef.id);
            }
        }

        const dedupSnapshots = dedupRefs.length > 0 ? await db.getAll(...dedupRefs) : [];
        const activeDedupIds = new Set<string>();

        for (const snapshot of dedupSnapshots) {
            if (!snapshot.exists) {
                continue;
            }

            const expiresAtValue = snapshot.get("expiresAt");
            const expiresAtMs =
                expiresAtValue instanceof admin.firestore.Timestamp
                    ? expiresAtValue.toMillis()
                    : expiresAtValue?.toMillis?.() ?? 0;

            if (expiresAtMs > nowMs) {
                activeDedupIds.add(snapshot.id);
            }
        }

        let createdAlertCount = 0;
        let skippedAlertCount = 0;

        for (const candidate of Array.from(candidateAlertsByScope.values())) {
            const hasRecentDuplicate = relevantHourBuckets.some((hourBucket) =>
                activeDedupIds.has(buildDedupDocId(candidate.vesselId, candidate.dedupScopeId, hourBucket))
            );

            if (hasRecentDuplicate) {
                skippedAlertCount += 1;
                continue;
            }

            const alertRef = db.collection("alerts").doc();
            const dedupDocId = buildDedupDocId(candidate.vesselId, candidate.dedupScopeId, currentHourBucket);

            queueSet(alertRef, {
                type: candidate.type,
                vesselId: candidate.vesselId,
                vesselName: candidate.vesselName,
                timestamp: nowTimestamp,
                location: candidate.location,
                severity: candidate.severity,
                status: candidate.status,
                description: candidate.description,
                zoneId: candidate.zoneId,
                organizationId: candidate.organizationId,
            });

            queueSet(db.collection("alertDedup").doc(dedupDocId), {
                vesselId: candidate.vesselId,
                zoneId: candidate.zoneId,
                dedupScopeId: candidate.dedupScopeId,
                type: candidate.type,
                createdAt: nowTimestamp,
                expiresAt,
            });

            activeDedupIds.add(dedupDocId);
            createdAlertCount += 1;
        }

        if (batchOperationCount > 0) {
            commitPromises.push(batch.commit());
        }

        await Promise.all(commitPromises);

        console.log(
            `[FATHOM Ingestion] Synced ${vessels.length} vessels, created ${createdAlertCount} alerts, skipped ${skippedAlertCount} duplicates.`
        );
    } catch (error) {
        console.error("[FATHOM Ingestion] Pipeline Error:", error);
    }
});

function buildZoneAlertCandidate(params: {
    vessel: FleetVessel;
    vesselId: string;
    vesselName: string;
    organizationId: string | null;
    lat: number;
    lng: number;
    zone: RiskZoneDefinition;
}): AlertCandidate {
    const { vessel, vesselId, vesselName, organizationId, lat, lng, zone } = params;
    const imoSuffix = getString(vessel.imo) ? ` (IMO: ${vessel.imo})` : "";

    return {
        type: zone.riskType,
        vesselId,
        vesselName,
        severity: zone.severity,
        status: "open",
        description: `${vesselName}${imoSuffix} entered ${zone.name}.`,
        zoneId: zone.id,
        organizationId,
        location: { lat, lng },
        dedupScopeId: zone.id,
    };
}

function buildStoppedAlertCandidate(params: {
    vesselId: string;
    vesselName: string;
    organizationId: string | null;
    lat: number;
    lng: number;
}): AlertCandidate {
    const { vesselId, vesselName, organizationId, lat, lng } = params;

    return {
        type: "VESSEL_STOPPED",
        vesselId,
        vesselName,
        severity: "high",
        status: "open",
        description: `${vesselName} appears stopped in open water with speed below ${STOPPED_VESSEL_THRESHOLD_KNOTS} knots.`,
        zoneId: null,
        organizationId,
        location: { lat, lng },
        dedupScopeId: STOPPED_VESSEL_DEDUP_SCOPE,
    };
}

function buildDedupDocId(vesselId: string, scopeId: string, hourBucket: number): string {
    return `${vesselId}_${scopeId}_${hourBucket}`;
}

function closePolygon(polygon: Array<[number, number]>): Array<[number, number]> {
    if (polygon.length === 0) {
        return polygon;
    }

    const [firstLng, firstLat] = polygon[0];
    const [lastLng, lastLat] = polygon[polygon.length - 1];

    if (firstLng === lastLng && firstLat === lastLat) {
        return polygon;
    }

    return [...polygon, polygon[0]];
}

function getHourBucket(timestampMs: number): number {
    return Math.floor(timestampMs / HOURS_TO_MS);
}

function getRecentHourBuckets(currentHourBucket: number, hours: number): number[] {
    const buckets: number[] = [];

    for (let offset = 0; offset < hours; offset += 1) {
        buckets.push(currentHourBucket - offset);
    }

    return buckets;
}

function getOrganizationId(
    vessel: FleetVessel,
    existingVessel: FirebaseFirestore.DocumentData
): string | null {
    return (
        getString(vessel.organizationId) ??
        getString(vessel.orgId) ??
        getString(existingVessel.organizationId) ??
        getString(existingVessel.orgId) ??
        null
    );
}

function getVesselName(vessel: FleetVessel, existingVessel: FirebaseFirestore.DocumentData): string {
    return getString(vessel.name, existingVessel.name) ?? `Vessel ${vessel.id}`;
}

function getString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }

    return null;
}

function getNumber(...values: unknown[]): number | undefined {
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
    }

    return undefined;
}

function omitUndefined(data: FirebaseFirestore.DocumentData): FirebaseFirestore.DocumentData {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function isFiniteCoordinate(value: number | undefined): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isStoppedInOpenWater(
    vessel: FleetVessel,
    existingVessel: FirebaseFirestore.DocumentData,
    speed: number,
    normalizedStatus: string
): boolean {
    if (speed >= STOPPED_VESSEL_THRESHOLD_KNOTS) {
        return false;
    }

    if (PORT_LIKE_STATUSES.has(normalizedStatus)) {
        return false;
    }

    const eta = getString(vessel.eta, existingVessel.eta)?.toLowerCase();
    if (eta === "arrived") {
        return false;
    }

    return true;
}
