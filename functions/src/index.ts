import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as turf from "@turf/turf";

admin.initializeApp();
const db = admin.firestore();

/**
 * FATHOM: Real-Time Fleet Ingestion Pipeline (Step 2)
 * 
 * This Scheduled Cloud Function acts as an ETL (Extract, Transform, Load) worker.
 * It wakes up every 5 minutes, fetches the latest GPS coordinates from our AIS data provider 
 * (currently pointing to the mock API until the Datalastic API is purchased), 
 * and securely `UPSERT`s the coordinates into the FATHOM Firestore database for real-time tracking.
 */
export const ingestFleetData = onSchedule("every 5 minutes", async (event) => {
    try {
        console.log("[FATHOM Ingestion] Waking up to fetch latest AIS fleet data...");

        // 1. EXTRACT: Fetch the data
        // Currently pointing to localhost mock. For production, change to:
        // const AIS_API_URL = "https://api.datalastic.com/api/v0/vessels?...";
        // Ensure you set the Datalastic API key in Firebase Secrets when transitioning.

        // *NOTE: Cloud functions cannot easily call localhost. In production this will be your vercel host URL, 
        // e.g. "https://fathom.vercel.app/api/mock/fleet". For MVP demo, you could run emulator or use ngrok.
        const AIS_API_URL = process.env.NEXTAUTH_URL
            ? `${process.env.NEXTAUTH_URL}/api/mock/fleet`
            : "http://127.0.0.1:3000/api/mock/fleet";

        const response = await fetch(AIS_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch AIS data: ${response.statusText}`);
        }

        const data = await response.json();
        const vessels = data.vessels || [];
        console.log(`[FATHOM Ingestion] Successfully extracted ${vessels.length} vessel records.`);

        if (vessels.length === 0) return;

        // 2. TRANSFORM & LOAD: Batch write to Firestore
        const batch = db.batch();

        // 3. THE GEOFENCING RULES ENGINE
        // Define a mock "Sanctioned Zone" polygon (e.g., a High-Risk box near the Suez Canal where EVER GIVEN starts)
        const highRiskZone = turf.polygon([[
            [32.0, 29.5], // bottom-left (lng, lat)
            [33.0, 29.5], // bottom-right
            [33.0, 30.5], // top-right
            [32.0, 30.5], // top-left
            [32.0, 29.5]  // close polygon
        ]]);

        for (const vessel of vessels) {
            // A. Update Vessel Location
            // Using batch.set() with { merge: true } performs an "UPSERT". 
            // If the ship already exists, only its coordinates update. If it's a new ship, it is created.
            const vesselRef = db.collection("vessels").doc(vessel.id);

            batch.set(vesselRef, {
                ...vessel,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // B. Execute Geofencing Rule
            // Check if the vessel has entered the Sanctioned Zone
            const shipPoint = turf.point([vessel.lng, vessel.lat]);
            const isInsideZone = turf.booleanPointInPolygon(shipPoint, highRiskZone);

            if (isInsideZone) {
                // Generate a real-time Fraud/Risk Alert
                // We use a unique ID combining the breach type, vessel ID, and current time
                const alertRef = db.collection("alerts").doc(`zone_breach_${vessel.id}_${Date.now()}`);
                batch.set(alertRef, {
                    type: "Sanctioned Zone Breach",
                    vesselId: vessel.id,
                    vesselName: vessel.name,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    location: { lat: vessel.lat, lng: vessel.lng },
                    severity: "high",
                    status: "active",
                    description: `${vessel.name} (IMO: ${vessel.imo}) has entered a designated High-Risk Sanctioned Zone.`
                });
                console.warn(`[ALERT] Generated zone breach alert for ${vessel.name}`);
            }
        }

        await batch.commit();
        console.log(`[FATHOM Ingestion] Successfully synced ${vessels.length} vessels and generated alerts into Firestore.`);

    } catch (error) {
        console.error("[FATHOM Ingestion] Pipeline Error:", error);
    }
});
