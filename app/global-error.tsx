"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

/**
 * global-error.tsx replaces the ROOT LAYOUT when a crash occurs.
 * It must render its own <html> and <body>.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[GlobalError boundary]", error)
    }, [error])

    const isFirebaseError =
        error?.message?.includes("Firebase") ||
        error?.message?.includes("FIREBASE")

    const isAuthError =
        error?.message?.includes("NEXTAUTH") ||
        error?.message?.includes("secret")

    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased">
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-red-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-mono text-sky-400 tracking-widest uppercase">
                            ⚓ FATHOM — System Error
                        </p>
                        <h1 className="text-3xl font-bold text-white">
                            {isFirebaseError
                                ? "Database Unavailable"
                                : isAuthError
                                ? "Auth Not Configured"
                                : "Server Error"}
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {isFirebaseError
                                ? "Firebase Admin cannot initialize. Ensure all environment variables are set in Vercel → Project Settings → Environment Variables."
                                : isAuthError
                                ? "NEXTAUTH_SECRET is missing. Set it in your Vercel project settings."
                                : "An unexpected server-side error occurred. The digest below can help trace it in Vercel function logs."}
                        </p>
                    </div>

                    {error?.digest && (
                        <p className="text-xs text-slate-500 font-mono bg-slate-900 rounded-lg px-4 py-2 inline-block">
                            Digest: {error.digest}
                        </p>
                    )}

                    {(isFirebaseError || isAuthError) && (
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-left space-y-3">
                            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">
                                Required Vercel Environment Variables
                            </p>
                            <ul className="space-y-1.5">
                                {[
                                    "FIREBASE_PROJECT_ID",
                                    "FIREBASE_CLIENT_EMAIL",
                                    "FIREBASE_PRIVATE_KEY",
                                    "FIREBASE_STORAGE_BUCKET",
                                    "NEXTAUTH_SECRET",
                                    "NEXTAUTH_URL",
                                ].map((v) => (
                                    <li
                                        key={v}
                                        className="font-mono text-xs text-slate-400 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60 shrink-0" />
                                        {v}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 rounded-full bg-sky-600 hover:bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 hover:bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors"
                        >
                            ← Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    )
}
