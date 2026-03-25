"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Toggle {
    id: string
    label: string
    desc: string
    channels: { email: boolean; inApp: boolean; slack: boolean }
}

const CATEGORIES: Toggle[] = [
    { id: "fraud", label: "Fraud Alerts", desc: "Critical anomalies flagged by the AI engine", channels: { email: true, inApp: true, slack: true } },
    { id: "disputes", label: "Dispute Updates", desc: "Status changes on active disputes", channels: { email: true, inApp: true, slack: false } },
    { id: "invoices", label: "Invoice Processed", desc: "Confirmation when an invoice completes analysis", channels: { email: false, inApp: true, slack: false } },
    { id: "arrivals", label: "Vessel Arrivals", desc: "Alerts when a vessel approaches a risk port", channels: { email: true, inApp: false, slack: false } },
    { id: "weekly", label: "Weekly Digest", desc: "Summary of savings, disputes, and fleet status", channels: { email: true, inApp: false, slack: true } },
]

type Channel = "email" | "inApp" | "slack"

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-sky-600" : "bg-slate-700"}`}
        >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
        </button>
    )
}

export function NotificationSettings() {
    const [categories, setCategories] = useState(CATEGORIES)
    const [quietStart, setQuietStart] = useState("22:00")
    const [quietEnd, setQuietEnd] = useState("07:00")

    const update = (id: string, channel: Channel) => {
        setCategories(prev => prev.map(c =>
            c.id === id ? { ...c, channels: { ...c.channels, [channel]: !c.channels[channel] } } : c
        ))
    }

    return (
        <div className="space-y-5">
            {/* Channel table */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base">Alert Preferences</CardTitle>
                    <CardDescription className="text-slate-400">Choose how you receive each type of notification.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
                                {(["Email", "In-App", "Slack"] as const).map(ch => (
                                    <th key={ch} className="text-center px-4 py-3 text-slate-500 font-medium w-24">{ch}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-white">{cat.label}</div>
                                        <div className="text-xs text-slate-500">{cat.desc}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center"><Toggle checked={cat.channels.email} onChange={() => update(cat.id, "email")} /></td>
                                    <td className="px-4 py-4 text-center"><Toggle checked={cat.channels.inApp} onChange={() => update(cat.id, "inApp")} /></td>
                                    <td className="px-4 py-4 text-center"><Toggle checked={cat.channels.slack} onChange={() => update(cat.id, "slack")} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Quiet hours */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base">Quiet Hours</CardTitle>
                    <CardDescription className="text-slate-400">Suppress non-critical notifications during these hours.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">From</span>
                        <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">To</span>
                        <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500" />
                    </div>
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white ml-auto">Save</Button>
                </CardContent>
            </Card>
        </div>
    )
}
