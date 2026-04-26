import { App, cert, getApps, initializeApp } from "firebase-admin/app"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

let _app: App | null = null
let _initError: string | null = null

function stripWrappingQuotes(value: string): string {
    const trimmed = value.trim()

    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1)
    }

    return trimmed
}

function decodeBase64Pem(value: string): string {
    const normalized = value.replace(/\s+/g, "")

    if (!normalized || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/=]+$/.test(normalized)) {
        return value
    }

    const decoded = Buffer.from(normalized, "base64").toString("utf-8").trim()

    return decoded.includes("-----BEGIN PRIVATE KEY-----") ? decoded : value
}

function normalizePrivateKey(value: string | undefined): string | undefined {
    if (!value) {
        return value
    }

    let normalized = stripWrappingQuotes(value)

    // Support envs copied from JSON or Vercel, which often escape newlines.
    normalized = normalized.replace(/\r\n/g, "\n").replace(/\\n/g, "\n").trim()

    if (!normalized.startsWith("-----BEGIN PRIVATE KEY-----")) {
        normalized = decodeBase64Pem(normalized)
    }

    return stripWrappingQuotes(normalized).replace(/\r\n/g, "\n").replace(/\\n/g, "\n").trim()
}

function getFirebaseAdminApp(): App {
    // Return cached app if already initialised
    if (_app) return _app

    // If we already know it will fail, throw immediately with the cached message
    if (_initError) throw new Error(_initError)

    // Reuse an already-initialised app (e.g. hot-reload)
    if (getApps().length > 0) {
        _app = getApps()[0]!
        return _app
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        const msg =
            "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET in your environment."
        _initError = msg
        console.error("[firebase-admin]", msg)
        throw new Error(msg)
    }

    try {
        _app = initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket,
        })
        return _app
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        _initError = msg
        console.error("[firebase-admin] initializeApp failed:", msg)
        throw new Error(msg)
    }
}

/** Returns true when all required Firebase env vars are present. */
export function isFirebaseConfigured(): boolean {
    return !!(
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_STORAGE_BUCKET
    )
}

export function getFirebaseFirestore() {
    return getFirestore(getFirebaseAdminApp())
}

export function getFirebaseStorage() {
    return getStorage(getFirebaseAdminApp())
}

export const admin = {
    firestore: {
        FieldValue,
    },
}
