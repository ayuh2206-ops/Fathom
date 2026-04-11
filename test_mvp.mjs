import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const API_BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const SERVER_START_TIMEOUT_MS = 60_000;
const PROJECT_ROOT = process.cwd();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(pathname, init) {
    const response = await fetch(`${API_BASE}${pathname}`, init);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    return { response, body };
}

async function waitForServer() {
    const startedAt = Date.now();

    while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
        try {
            const response = await fetch(`${API_BASE}/api/health`);
            if (response.ok) {
                return;
            }
        } catch {}

        await delay(1_000);
    }

    throw new Error(`Server did not become ready within ${SERVER_START_TIMEOUT_MS}ms`);
}

function runCommand(command, args, label) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: PROJECT_ROOT,
            stdio: "inherit",
            env: process.env
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
        });
    });
}

async function testPublicPages() {
    console.log("🌐 Testing public pages...");

    const home = await fetch(`${API_BASE}/`);
    if (!home.ok) {
        throw new Error(`GET / failed with ${home.status}`);
    }

    const register = await fetch(`${API_BASE}/register`);
    if (!register.ok) {
        throw new Error(`GET /register failed with ${register.status}`);
    }

    const dashboard = await fetch(`${API_BASE}/dashboard`, { redirect: "manual" });
    if (![307, 302].includes(dashboard.status)) {
        throw new Error(`GET /dashboard expected redirect, received ${dashboard.status}`);
    }

    const admin = await fetch(`${API_BASE}/admin`, { redirect: "manual" });
    if (![307, 302].includes(admin.status)) {
        throw new Error(`GET /admin expected redirect, received ${admin.status}`);
    }

    console.log("✅ Public page and middleware checks passed");
}

async function testHealthApi() {
    console.log("💓 Testing health API...");

    const { response, body } = await fetchJson("/api/health");
    if (!response.ok) {
        throw new Error(`GET /api/health failed with ${response.status}`);
    }

    if (!body || body.status !== "ok") {
        throw new Error("GET /api/health returned an unexpected payload");
    }

    console.log("✅ Health API passed");
}

async function testFleetApi() {
    console.log("🚢 Testing fleet mock API...");

    let { response, body } = await fetchJson("/api/mock/fleet");
    if (!response.ok) {
        throw new Error(`GET /api/mock/fleet failed with ${response.status}`);
    }

    if (!body.success || !Array.isArray(body.vessels)) {
        throw new Error("GET /api/mock/fleet returned an unexpected payload");
    }

    const initialCount = body.count;
    const newVessel = {
        id: "test-vessel-123",
        name: "TEST FATHOM",
        imo: "1234567",
        type: "container",
        lat: 35.0,
        lng: -40.0,
        heading: 90,
        speed: 15.5,
        status: "moving",
        nextPort: "New York",
        eta: "2024-05-01 10:00"
    };

    ({ response, body } = await fetchJson("/api/mock/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVessel)
    }));

    if (!response.ok) {
        throw new Error(`POST /api/mock/fleet failed with ${response.status}`);
    }

    if (!body.success || body.count !== initialCount + 1) {
        throw new Error("POST /api/mock/fleet did not increment the fleet count");
    }

    console.log("✅ Fleet API passed");
}

async function testUnauthenticatedApis() {
    console.log("🔐 Testing protected route behavior...");

    const invoices = await fetch(`${API_BASE}/api/invoices`);
    if (invoices.status !== 401) {
        throw new Error(`GET /api/invoices expected 401, received ${invoices.status}`);
    }

    const adminLogin = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "missing", password: "missing" })
    });
    if (![401, 503].includes(adminLogin.status)) {
        throw new Error(`POST /api/admin/login expected 401 or 503, received ${adminLogin.status}`);
    }

    const invalidRegistration = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid" })
    });
    if (invalidRegistration.status !== 400) {
        throw new Error(`POST /api/auth/register expected 400, received ${invalidRegistration.status}`);
    }

    console.log("✅ Protected route behavior passed");
}

async function testOptionalIntegrationFallbacks() {
    console.log("🛰️ Testing optional integration fallbacks...");

    const ais = await fetch(`${API_BASE}/api/ais`);
    if (!ais.ok) {
        throw new Error(`GET /api/ais failed with ${ais.status}`);
    }

    const webhook = await fetch(`${API_BASE}/api/webhooks/razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });
    if (![400, 503].includes(webhook.status)) {
        throw new Error(`POST /api/webhooks/razorpay expected 400 or 503, received ${webhook.status}`);
    }

    console.log("✅ Optional integration fallbacks passed");
}

async function runTests() {
    console.log("🧪 Starting local smoke tests...\n");

    await testPublicPages();
    await testHealthApi();
    await testFleetApi();
    await testUnauthenticatedApis();
    await testOptionalIntegrationFallbacks();

    console.log("\n🎉 All local smoke tests passed");
}

async function main() {
    const ownServer = !process.env.TEST_BASE_URL;
    let serverProcess = null;

    try {
        if (ownServer) {
            const buildIdPath = path.join(PROJECT_ROOT, ".next", "BUILD_ID");
            if (!fs.existsSync(buildIdPath)) {
                console.log("🏗️ Building the app before smoke tests...\n");
                await runCommand("npm", ["run", "build"], "next build");
                console.log("");
            }

            console.log("🚀 Starting local production server...\n");
            serverProcess = spawn("npm", ["run", "start", "--", "-H", "127.0.0.1", "-p", "3000"], {
                cwd: PROJECT_ROOT,
                stdio: ["ignore", "pipe", "pipe"],
                env: {
                    ...process.env,
                    HOSTNAME: "127.0.0.1",
                    PORT: "3000"
                }
            });

            serverProcess.stdout.on("data", (chunk) => {
                process.stdout.write(chunk);
            });
            serverProcess.stderr.on("data", (chunk) => {
                process.stderr.write(chunk);
            });

            await waitForServer();
            console.log("");
        }

        await runTests();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ TEST FAILED: ${message}`);
        process.exitCode = 1;
    } finally {
        if (serverProcess) {
            serverProcess.kill("SIGTERM");
            await delay(500);
        }
    }
}

await main();
