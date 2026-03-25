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

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    badge?: number
    badgeColor?: string
}

const sidebarItems: NavItem[] = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fleet", href: "/dashboard/fleet", icon: Ship },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText, badge: 24, badgeColor: "bg-sky-500/20 text-sky-400" },
    { name: "Fraud Alerts", href: "/dashboard/alerts", icon: AlertTriangle, badge: 5, badgeColor: "bg-red-500/20 text-red-400" },
    { name: "Disputes", href: "/dashboard/disputes", icon: Scale, badge: 2, badgeColor: "bg-yellow-500/20 text-yellow-400" },
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
                <p className="text-slate-600 text-xs mt-1 pl-0.5">Maritime Fraud Intelligence</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                                isActive
                                    ? "bg-ocean/10 text-ocean border-l-2 border-ocean"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-sky-400" : "text-slate-600 group-hover:text-slate-300")} />
                                {item.name}
                            </div>
                            {item.badge && (
                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", item.badgeColor ?? "bg-slate-700 text-slate-300")}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Usage bar */}
            <div className="mx-4 mb-3 rounded-lg border border-white/10 bg-slate-900/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Invoices this month</span>
                    <span className="text-xs font-mono text-white">412 / 500</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: "82%" }} />
                </div>
                <p className="text-[10px] text-slate-600">82% of quota used</p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-md transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}

