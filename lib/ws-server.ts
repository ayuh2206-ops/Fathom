import "server-only"

let webSocketConstructorPromise: Promise<typeof import("ws").default> | null = null

export async function getNodeWebSocket() {
    process.env.WS_NO_BUFFER_UTIL = "1"
    process.env.WS_NO_UTF_8_VALIDATE = "1"

    webSocketConstructorPromise ??= import("ws").then((module) => module.default)

    return webSocketConstructorPromise
}
