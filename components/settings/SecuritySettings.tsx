"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Smartphone, MonitorSmartphone, LogOut } from "lucide-react"

const SESSIONS = [
    { device: "Chrome on macOS", location: "Mumbai, India", lastActive: "Now", current: true, icon: MonitorSmartphone },
    { device: "Safari on iPhone 15", location: "Mumbai, India", lastActive: "2h ago", current: false, icon: Smartphone },
    { device: "Chrome on Windows", location: "Singapore", lastActive: "3 days ago", current: false, icon: MonitorSmartphone },
]

export function SecuritySettings() {
    const [twoFa, setTwoFa] = useState(false)
    const [pw, setPw] = useState({ current: "", next: "", confirm: "" })

    return (
        <div className="space-y-5">
            {/* Change Password */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-sky-400" /> Change Password
                    </CardTitle>
                    <CardDescription className="text-slate-400">Use a strong, unique password for your FATHOM account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-sm">
                    {[
                        { id: "current", label: "Current Password", key: "current" as const },
                        { id: "next", label: "New Password", key: "next" as const },
                        { id: "confirm", label: "Confirm New Password", key: "confirm" as const },
                    ].map(({ id, label, key }) => (
                        <div key={id} className="space-y-1.5">
                            <Label htmlFor={id} className="text-slate-300 text-sm">{label}</Label>
                            <Input
                                id={id}
                                type="password"
                                value={pw[key]}
                                onChange={e => setPw(prev => ({ ...prev, [key]: e.target.value }))}
                                className="bg-slate-800 border-white/10 text-white"
                            />
                        </div>
                    ))}
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">Update Password</Button>
                </CardContent>
            </Card>

            {/* 2FA */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-sky-400" /> Two-Factor Authentication
                        </CardTitle>
                        <CardDescription className="text-slate-400">Add an extra layer of security to your account.</CardDescription>
                    </div>
                    <Badge className={twoFa
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-slate-700/50 text-slate-400 border border-white/10"}
                    >
                        {twoFa ? "ENABLED" : "DISABLED"}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <Button
                        size="sm"
                        onClick={() => setTwoFa(!twoFa)}
                        className={twoFa
                            ? "border border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10"
                            : "bg-sky-600 hover:bg-sky-500 text-white"}
                    >
                        {twoFa ? "Disable 2FA" : "Enable 2FA via Authenticator App"}
                    </Button>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base">Active Sessions</CardTitle>
                    <CardDescription className="text-slate-400">Devices currently signed into your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {SESSIONS.map(session => (
                        <div key={session.device} className="flex items-center justify-between rounded-lg bg-slate-800/50 border border-white/10 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <session.icon className="h-5 w-5 text-slate-400" />
                                <div>
                                    <div className="text-sm text-white font-medium flex items-center gap-2">
                                        {session.device}
                                        {session.current && <Badge className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20">THIS DEVICE</Badge>}
                                    </div>
                                    <div className="text-xs text-slate-500">{session.location} · {session.lastActive}</div>
                                </div>
                            </div>
                            {!session.current && (
                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs gap-1">
                                    <LogOut className="h-3.5 w-3.5" /> Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 mt-2">
                        Sign Out All Other Devices
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
