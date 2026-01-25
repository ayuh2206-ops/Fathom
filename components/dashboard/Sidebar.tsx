"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Ship,
    FileText,
    AlertTriangle,
    Scale,
    BarChart3,
    Settings,
    LogOut,
    Anchor
} from "lucide-react"

const sidebarItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fleet", href: "/dashboard/fleet", icon: Ship },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "Fraud Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
    { name: "Disputes", href: "/dashboard/disputes", icon: Scale },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("flex flex-col h-screen w-64 bg-slate-950 border-r border-white/10", className)}>
            {/* Brand */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-white">
                    <div className="bg-ocean rounded-lg p-1.5">
                        <Anchor className="h-6 w-6" />
                    </div>
                    <span className="font-serif text-xl font-bold tracking-wider">FATHOM</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-ocean/10 text-ocean"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Profile stub */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-md transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
