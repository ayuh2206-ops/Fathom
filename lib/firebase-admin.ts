import { App, cert, getApps, initializeApp } from "firebase-admin/app"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

let _app: App | null = null
let _initError: string | null = null

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
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    // If the key doesn't start with the PEM header, assume it's base64 encoded
    if (privateKey && !privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        try {
            privateKey = Buffer.from(privateKey, "base64").toString("utf-8")
        } catch {
            console.warn("Failed to decode base64 FIREBASE_PRIVATE_KEY")
        }
    }

    // Replace escaped newlines from env var string formats
    privateKey = privateKey?.replace(/\\n/g, "\n")

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
