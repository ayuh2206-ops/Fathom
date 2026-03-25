import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000';

async function testFleetAPI() {
    console.log("🚢 Testing Fleet Mock API...");

    // 1. GET existing fleet
    let res = await fetch(`${API_BASE}/api/mock/fleet`);
    if (!res.ok) throw new Error(`GET /api/mock/fleet failed with ${res.status}`);
    let data = await res.json();
    console.log(`✅ Fetched initial fleet. Count: ${data.count}`);
    const initialCount = data.count;

    // 2. POST new custom vessel
    console.log("➕ Adding a new custom vessel...");
    const newVessel = {
        id: 'test-vessel-123',
        name: 'TEST FATHOM',
        imo: '1234567',
        type: 'container',
        lat: 35.0,
        lng: -40.0,
        heading: 90,
        speed: 15.5,
        status: 'moving',
        nextPort: 'New York',
        eta: '2024-05-01 10:00'
    };

    res = await fetch(`${API_BASE}/api/mock/fleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVessel)
    });

    if (!res.ok) throw new Error(`POST /api/mock/fleet failed with ${res.status}`);
    data = await res.json();
    console.log(`✅ Successfully added vessel. New mock count: ${data.count}`);

    if (data.count !== initialCount + 1) {
        throw new Error("Ship count did not increase after POST");
    }
}

async function testInvoiceAPI() {
    console.log("\n📄 Testing Invoice Upload API...");

    // Create a dummy file
    const dummyContent = "MOCK INVOICE PDF CONTENT";
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    let rawData = `--${boundary}\r\n`;
    rawData += `Content-Disposition: form-data; name="file"; filename="mock_invoice.pdf"\r\n`;
    rawData += `Content-Type: application/pdf\r\n\r\n`;
    rawData += `${dummyContent}\r\n`;
    rawData += `--${boundary}\r\n`;
    rawData += `Content-Disposition: form-data; name="vendor"\r\n\r\n`;
    rawData += `Maersk Logistics\r\n`;
    rawData += `--${boundary}\r\n`;
    rawData += `Content-Disposition: form-data; name="amount"\r\n\r\n`;
    rawData += `15000\r\n`;
    rawData += `--${boundary}--`;

    const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: rawData
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`POST /api/invoices failed with ${res.status}: ${err}`);
    }

    const payload = await res.json();
    console.log(`✅ Successfully uploaded duplicate invoice logic. Invoice ID: ${payload.invoice.id}`);
    console.log(`✅ Saved to Storage: ${payload.invoice.filePath}`);
    console.log(`✅ Saved to Firestore with Invoice Number: ${payload.invoice.invoiceNumber}`);
}

async function runTests() {
    console.log("🧪 Starting Local Integration Tests...\n");
    try {
        await testFleetAPI();
        await testInvoiceAPI();
        console.log("\n🎉 ALL LOCAL MOCK TESTS PASSED PERFECTLY!");
    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
        process.exit(1);
    }
}

runTests();
