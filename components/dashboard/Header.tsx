"use client"

import { useState } from "react"
import { Bell, Search, CheckCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"

const INITIAL_NOTIFICATIONS = [
    { id: 1, title: "🚨 Critical fraud detected", desc: "INV-2024-001 · MV Pacific Dawn · $12,225 overcharge", time: "2h ago", read: false, severity: "critical" },
    { id: 2, title: "⚡ Dispute accepted", desc: "DSP-991 · Maersk Line agreed to $4,800 credit", time: "5h ago", read: false, severity: "success" },
    { id: 3, title: "📥 Invoice processed", desc: "INV-2024-004 · CMA CGM · 98% extraction accuracy", time: "8h ago", read: false, severity: "info" },
    { id: 4, title: "⚠️ High-risk arrival", desc: "MV Baltic Star arriving Singapore in 2 days", time: "1d ago", read: true, severity: "warning" },
]

export function Header() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
    const [notifOpen, setNotifOpen] = useState(false)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const markRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    return (
        <header className="h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 w-full max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search vessels, invoices, or containers..."
                        className="pl-9 bg-slate-900/50 border-white/10 focus:border-ocean w-full text-sm text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications dropdown */}
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 rounded-full ring-2 ring-slate-950 text-[9px] flex items-center justify-center text-white font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-80 bg-slate-950 border-white/10 text-white p-0 overflow-hidden"
                        align="end"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <span className="text-sm font-semibold text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                            {notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => markRead(notif.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 hover:bg-white/5 transition-colors",
                                        !notif.read && "bg-white/[0.02]"
                                    )}
                                >
                                    <div className="flex items-start gap-2">
                                        {!notif.read && (
                                            <span className={cn(
                                                "mt-1.5 h-2 w-2 rounded-full shrink-0",
                                                notif.severity === "critical" && "bg-red-500",
                                                notif.severity === "success" && "bg-green-500",
                                                notif.severity === "warning" && "bg-yellow-500",
                                                notif.severity === "info" && "bg-sky-500",
                                            )} />
                                        )}
                                        <div className={cn(!notif.read ? "" : "ml-4")}>
                                            <p className="text-sm font-medium text-white leading-tight">{notif.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{notif.desc}</p>
                                            <p className="text-xs text-slate-600 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-white/10 px-4 py-2">
                            <Link
                                href="/dashboard/alerts"
                                onClick={() => setNotifOpen(false)}
                                className="text-xs text-sky-400 hover:text-sky-300"
                            >
                                View all alerts →
                            </Link>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-white/10" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt="User" />
                                <AvatarFallback className="bg-ocean text-white">SC</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-950 border-white/10 text-white" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session?.user?.name || "Operator"}</p>
                                <p className="text-xs leading-none text-slate-400">{session?.user?.email || "No email"}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                            <Link href="/dashboard/settings">Profile & Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                            <Link href="/dashboard/settings">Billing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            className="text-red-400 focus:bg-red-900/10 focus:text-red-400 cursor-pointer"
                            onSelect={(event) => {
                                event.preventDefault()
                                void signOut({ callbackUrl: "/" })
                            }}
                        >
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
