"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function AdminLogoutButton() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)

        try {
            await fetch("/api/admin/logout", {
                method: "POST",
            })
        } finally {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
    )
}
