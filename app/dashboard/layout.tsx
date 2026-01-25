"use client"

import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
// In a real app, we would check session here. 
// Since we are using client-side components for layout, we might rely on middleware or a client-side auth check.
// For now, we assume middleware handles protection or we add a simple check.

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block">
                <Sidebar className="" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto bg-slate-950/50 p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
