"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncVessels = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ws_1 = require("ws");
const AIS_STATUS_MAP = {
    0: 'underway', 1: 'at_anchor', 5: 'moored',
    6: 'aground', 7: 'fishing', 8: 'underway_sailing', 15: 'unknown'
};
exports.syncVessels = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async () => {
    const db = admin.firestore();
    const vessels = await fetchVesselSnapshot();
    const batch = db.batch();
    for (const msg of vessels) {
        const { MMSI, ShipName, latitude, longitude } = msg.MetaData;
        const pos = msg.Message.PositionReport;
        const ref = db.collection('vessels').doc(String(MMSI));
        batch.set(ref, {
            id: String(MMSI),
            name: ShipName.trim() || `MMSI ${MMSI}`,
            lat: latitude,
            lng: longitude,
            heading: pos?.TrueHeading ?? 0,
            speed: pos?.Sog ?? 0,
            status: AIS_STATUS_MAP[pos?.NavigationalStatus ?? 15] ?? 'unknown',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
    console.log(`Synced ${vessels.length} vessels`);
});
function fetchVesselSnapshot() {
    return new Promise((resolve, reject) => {
        const ws = new ws_1.default('wss://stream.aisstream.io/v0/stream');
        const collected = [];
        let timeout;
        ws.on('open', () => {
            ws.send(JSON.stringify({
                APIKey: process.env.AISSTREAM_API_KEY,
                BoundingBoxes: [
                    [[-5, 20], [30, 40]], // Mediterranean / Suez
                    [[50, 10], [80, 30]], // Arabian Sea / Indian Ocean
                    [[95, -5], [130, 25]], // Strait of Malacca / South China Sea
                ],
                FilterMessageTypes: ['PositionReport'],
            }));
            // Collect for 30 seconds then close
            timeout = setTimeout(() => { ws.close(); resolve(collected); }, 30_000);
        });
        ws.on('message', (data) => {
            try {
                collected.push(JSON.parse(data.toString()));
            }
            catch { }
        });
        ws.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
}
//# sourceMappingURL=vesselSync.js.map