import { App, cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0]!
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

    // Still perform the standard \n replacement for literal string formats
    privateKey = privateKey?.replace(/\\n/g, "\n")

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        throw new Error(
            "Missing Firebase Admin env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET."
        )
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
        storageBucket,
    })
}

export function getFirebaseFirestore() {
    return getFirestore(getFirebaseAdminApp())
}

export function getFirebaseStorage() {
    return getStorage(getFirebaseAdminApp())
}
