import "server-only"

import { getFirebaseFirestore } from "@/lib/firebase-admin"

const PORT_TARIFFS = {
    NLRTM: {
        portName: "Port of Rotterdam",
        country: "Netherlands",
        currency: "EUR",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 10000, rate: 780 },
                    { gtMin: 10001, gtMax: 25000, rate: 1240 },
                    { gtMin: 25001, gtMax: 50000, rate: 1890 },
                    { gtMin: 50001, gtMax: 999999, rate: 2650 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 420, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.042 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.18 },
            MOORING: { unit: "PER_OPERATION", rate: 380 },
        },
        sourceUrl: "https://www.portofrotterdam.com/en/shipping/port-dues",
    },
    SGSIN: {
        portName: "Port of Singapore",
        country: "Singapore",
        currency: "SGD",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 3000, rate: 175 },
                    { gtMin: 3001, gtMax: 10000, rate: 290 },
                    { gtMin: 10001, gtMax: 30000, rate: 520 },
                    { gtMin: 30001, gtMax: 999999, rate: 890 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 380, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.031 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.15 },
            MOORING: { unit: "PER_OPERATION", rate: 290 },
        },
        sourceUrl: "https://www.mpa.gov.sg/port-marine-ops/port-dues-and-charges",
    },
    AEDXB: {
        portName: "Jebel Ali Port",
        country: "UAE",
        currency: "AED",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 15000, rate: 1200 },
                    { gtMin: 15001, gtMax: 40000, rate: 2100 },
                    { gtMin: 40001, gtMax: 999999, rate: 3400 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 950, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.08 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.22 },
            MOORING: { unit: "PER_OPERATION", rate: 650 },
        },
        sourceUrl: "https://www.dpworld.com/jebel-ali",
    },
    CNSHA: {
        portName: "Port of Shanghai",
        country: "China",
        currency: "CNY",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 5000, rate: 2400 },
                    { gtMin: 5001, gtMax: 20000, rate: 4200 },
                    { gtMin: 20001, gtMax: 50000, rate: 7800 },
                    { gtMin: 50001, gtMax: 999999, rate: 12000 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 1800, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.12 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.31 },
            MOORING: { unit: "PER_OPERATION", rate: 1200 },
        },
        sourceUrl: "https://www.spia.com.cn/en",
    },
    DEHAM: {
        portName: "Port of Hamburg",
        country: "Germany",
        currency: "EUR",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 10000, rate: 720 },
                    { gtMin: 10001, gtMax: 25000, rate: 1180 },
                    { gtMin: 25001, gtMax: 50000, rate: 1820 },
                    { gtMin: 50001, gtMax: 999999, rate: 2490 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 390, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.038 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.16 },
            MOORING: { unit: "PER_OPERATION", rate: 340 },
        },
        sourceUrl: "https://www.hamburg-port-authority.de",
    },
    INBOM: {
        portName: "Jawaharlal Nehru Port (JNPT)",
        country: "India",
        currency: "INR",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 5000, rate: 18000 },
                    { gtMin: 5001, gtMax: 20000, rate: 32000 },
                    { gtMin: 20001, gtMax: 50000, rate: 58000 },
                    { gtMin: 50001, gtMax: 999999, rate: 95000 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 22000, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 1.8 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 4.2 },
            MOORING: { unit: "PER_OPERATION", rate: 15000 },
        },
        sourceUrl: "https://www.jnpa.gov.in/Content/scale-of-rates.aspx",
    },
    HKHKG: {
        portName: "Port of Hong Kong",
        country: "Hong Kong",
        currency: "HKD",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 5000, rate: 1800 },
                    { gtMin: 5001, gtMax: 20000, rate: 3200 },
                    { gtMin: 20001, gtMax: 50000, rate: 5800 },
                    { gtMin: 50001, gtMax: 999999, rate: 9200 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 3200, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.28 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.95 },
            MOORING: { unit: "PER_OPERATION", rate: 2800 },
        },
        sourceUrl: "https://www.mardep.gov.hk/en/pub_services/charges.html",
    },
    GRPIR: {
        portName: "Port of Piraeus",
        country: "Greece",
        currency: "EUR",
        services: {
            PILOTAGE: {
                unit: "PER_PASSAGE",
                rates: [
                    { gtMin: 0, gtMax: 8000, rate: 650 },
                    { gtMin: 8001, gtMax: 20000, rate: 1050 },
                    { gtMin: 20001, gtMax: 999999, rate: 1680 },
                ],
            },
            TOWAGE: { unit: "PER_TUG_PER_HOUR", rate: 360, minHours: 2 },
            BERTH: { unit: "PER_GT_PER_DAY", rate: 0.035 },
            PORT_DUES: { unit: "PER_GT_PER_CALL", rate: 0.14 },
            MOORING: { unit: "PER_OPERATION", rate: 310 },
        },
        sourceUrl: "https://www.olp.gr/en/port-tariffs",
    },
} as const

export async function getPortTariff(portLocode: string): Promise<any | null> {
    try {
        const firestore = getFirebaseFirestore()
        const doc = await firestore.collection("portTariffs").doc(portLocode.toUpperCase()).get()
        return doc.exists ? doc.data() ?? null : null
    } catch (error) {
        console.warn("Failed to fetch port tariff:", error)
        return null
    }
}

export async function seedPortTariffs(): Promise<void> {
    try {
        const firestore = getFirebaseFirestore()

        await Promise.all(
            Object.entries(PORT_TARIFFS).map(([locode, tariff]) =>
                firestore.collection("portTariffs").doc(locode).set(tariff, { merge: false })
            )
        )
    } catch (error) {
        console.warn("Failed to seed port tariffs:", error)
    }
}

export async function createSeedRoute(): Promise<void> {
    await seedPortTariffs()
}
