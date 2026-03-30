type RateLimitEntry = {
    count: number
    resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
let lastPruneAt = 0

function pruneExpiredEntries(now: number) {
    if (now - lastPruneAt < 60_000) {
        return
    }

    for (const [key, entry] of Array.from(rateLimitStore.entries())) {
        if (entry.resetAt <= now) {
            rateLimitStore.delete(key)
        }
    }

    lastPruneAt = now
}

// MVP-only in-memory limiter. Counts reset on cold starts or process restarts.
export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    pruneExpiredEntries(now)

    const existingEntry = rateLimitStore.get(identifier)

    if (!existingEntry || existingEntry.resetAt <= now) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetAt: now + windowMs,
        })
        return true
    }

    if (existingEntry.count >= limit) {
        return false
    }

    existingEntry.count += 1
    rateLimitStore.set(identifier, existingEntry)

    return true
}

export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) {
        const [firstIp] = forwardedFor.split(",")
        if (firstIp?.trim()) {
            return firstIp.trim()
        }
    }

    const realIp = request.headers.get("x-real-ip")
    if (realIp?.trim()) {
        return realIp.trim()
    }

    return "unknown"
}
