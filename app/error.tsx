"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[GlobalError]", error)
    }, [error])

    const isFirebaseError =
        error.message?.includes("Firebase") ||
        error.message?.includes("FIREBASE")

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        {isFirebaseError ? "Service Unavailable" : "Something went wrong"}
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {isFirebaseError
                            ? "The database connection could not be established. Please ensure all required environment variables are configured in your Vercel project settings."
                            : "A server-side error occurred. Our team has been notified."}
                    </p>
                </div>

                {error.digest && (
                    <p className="text-xs text-slate-600 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                {isFirebaseError && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-left space-y-2">
                        <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Required env vars</p>
                        <ul className="space-y-1">
                            {[
                                "FIREBASE_PROJECT_ID",
                                "FIREBASE_CLIENT_EMAIL",
                                "FIREBASE_PRIVATE_KEY",
                                "FIREBASE_STORAGE_BUCKET",
                                "NEXTAUTH_SECRET",
                                "NEXTAUTH_URL",
                            ].map((v) => (
                                <li key={v} className="font-mono text-xs text-slate-400">
                                    {v}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </button>
            </div>
        </div>
    )
}
