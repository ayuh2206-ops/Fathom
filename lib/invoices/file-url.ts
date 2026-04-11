import "server-only"

import { getFirebaseStorage } from "@/lib/firebase-admin"

const DEFAULT_SIGNED_URL_TTL_MS = 15 * 60 * 1000

export async function getSignedInvoiceFileUrl(
    filePath?: string | null,
    expiresInMs = DEFAULT_SIGNED_URL_TTL_MS
): Promise<string | null> {
    if (!filePath) {
        return null
    }

    try {
        const [signedUrl] = await getFirebaseStorage().bucket().file(filePath).getSignedUrl({
            action: "read",
            expires: Date.now() + expiresInMs,
        })

        return signedUrl
    } catch (error) {
        console.error("Failed to generate signed invoice URL:", error)
        return null
    }
}
