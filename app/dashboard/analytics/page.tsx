"use client"

import { useState } from "react"
import { SpendChart } from "@/components/analytics/SpendChart"
import { CostDistribution } from "@/components/analytics/CostDistribution"
import { CarrierPerformance } from "@/components/analytics/CarrierPerformance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar, TrendingUp, Ship, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Simple fraud type donut data
const FRAUD_TYPES = [
    { label: "Time Inflation", value: 38, color: "#ef4444" },
    { label: "Phantom Charges", value: 24, color: "#f97316" },
    { label: "Rate Manipulation", value: 19, color: "#eab308" },
    { label: "Duplicate Billing", value: 12, color: "#8b5cf6" },
    { label: "Other", value: 7, color: "#64748b" },
]

// SVG Donut Chart (no recharts, keep it pure)
function DonutChart() {
    const total = FRAUD_TYPES.reduce((s, f) => s + f.value, 0)
    let offset = 0
    const r = 60
    const cx = 80
    const cy = 80
    const circumference = 2 * Math.PI * r

    const slices = FRAUD_TYPES.map(f => {
        const dasharray = (f.value / total) * circumference
        const dashoffset = -offset * circumference / total
        const slice = { ...f, dasharray, dashoffset }
        offset += f.value
        return slice
    })

    return (
        <div className="flex items-center gap-8">
            <svg width="160" height="160" className="shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="24" />
                {slices.map((s, i) => (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="24"
                        strokeDasharray={`${s.dasharray} ${circumference}`}
                        strokeDashoffset={s.dashoffset - circumference * 0.25}
                        style={{ transition: "all 0.5s ease" }}
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                    {total}%
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize="10">
                    fraud rate
                </text>
            </svg>
            <div className="space-y-2 flex-1">
                {FRAUD_TYPES.map(f => (
                    <div key={f.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                            <span className="text-sm text-slate-300">{f.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${f.value}%`, background: f.color }} />
                            </div>
                            <span className="font-mono text-xs text-slate-400 w-8 text-right">{f.value}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Simple area chart for recovery trend (12 months, SVG)
const RECOVERY_DATA = [
    { month: "Feb", recovery: 42000, disputes: 8 },
    { month: "Mar", recovery: 61000, disputes: 11 },
    { month: "Apr", recovery: 55000, disputes: 9 },
    { month: "May", recovery: 78000, disputes: 14 },
    { month: "Jun", recovery: 93000, disputes: 17 },
    { month: "Jul", recovery: 87000, disputes: 15 },
    { month: "Aug", recovery: 112000, disputes: 20 },
    { month: "Sep", recovery: 98000, disputes: 18 },
    { month: "Oct", recovery: 134000, disputes: 23 },
    { month: "Nov", recovery: 121000, disputes: 21 },
    { month: "Dec", recovery: 147000, disputes: 26 },
    { month: "Jan", recovery: 163000, disputes: 29 },
]

function RecoveryChart() {
    const maxVal = Math.max(...RECOVERY_DATA.map(d => d.recovery))
    const w = 480
    const h = 120
    const pad = { top: 10, bottom: 20, left: 40, right: 10 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom
    const pts = RECOVERY_DATA.map((d, i) => ({
        x: pad.left + (i / (RECOVERY_DATA.length - 1)) * chartW,
        y: pad.top + chartH - (d.recovery / maxVal) * chartH,
        ...d,
    }))

    const polyline = pts.map(p => `${p.x},${p.y}`).join(" ")
    const area = `M${pts[0].x},${pad.top + chartH} ${pts.map(p => `L${p.x},${p.y}`).join(" ")} L${pts[pts.length - 1].x},${pad.top + chartH} Z`

    return (
        <div className="overflow-x-auto">
            <svg width={w} height={h} className="w-full" viewBox={`0 0 ${w} ${h}`}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#areaGrad)" />
                <polyline points={polyline} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                    <g key={i}>
                        <text x={p.x} y={h - 4} textAnchor="middle" fill="#475569" fontSize="9">{p.month}</text>
                    </g>
                ))}
            </svg>
        </div>
    )
}

// Agent performance scorecard
const AGENTS_PERF = [
    { name: "Sarah Chen", role: "VP Operations", invoices: 312, recovered: "$287K", winRate: 94, alerts: 4 },
    { name: "Marcus Kim", role: "Fleet Controller", invoices: 248, recovered: "$198K", winRate: 89, alerts: 7 },
    { name: "Priya Sharma", role: "Port Analyst", invoices: 187, recovered: "$143K", winRate: 91, alerts: 3 },
    { name: "Tom Walsh", role: "Junior Auditor", invoices: 100, recovered: "$82K", winRate: 76, alerts: 12 },
]

function AgentScorecard() {
    return (
        <div className="space-y-3">
            {AGENTS_PERF.map((agent) => (
                <div key={agent.name} className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 hover:border-white/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-sky-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {agent.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-semibold">{agent.name}</span>
                            <span className="text-slate-500 text-xs">· {agent.role}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{agent.invoices} invoices</span>
                            <span className="font-mono text-sky-400">{agent.recovered} recovered</span>
                            {agent.alerts > 5 && (
                                <Badge className="text-[9px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20 border">⚠ {agent.alerts} open alerts</Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${agent.winRate}%` }} />
                                </div>
                                <span className="font-mono text-xs text-green-400">{agent.winRate}%</span>
                            </div>
                            <div className="text-[10px] text-slate-500 text-right">win rate</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "recovery", label: "Recovery", icon: TrendingUp },
    { id: "agents", label: "Agent Performance", icon: Ship },
]

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Analytics</h2>
                    <p className="text-slate-400">Deep dive into fleet performance and cost efficiency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Calendar className="h-4 w-4 mr-2" /> Last 12 Months
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Tab nav */}
            <div className="flex items-center gap-1 border-b border-white/10">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.id
                                ? "border-sky-500 text-sky-400"
                                : "border-transparent text-slate-400 hover:text-white"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-2 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Spend Analysis</CardTitle>
                                <CardDescription className="text-slate-400">Total freight spend vs disputed charges.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SpendChart />
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Cost Breakdown</CardTitle>
                                <CardDescription className="text-slate-400">Major expense categories.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CostDistribution />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fraud Type Breakdown */}
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Fraud Type Breakdown</CardTitle>
                            <CardDescription className="text-slate-400">Distribution of detected fraud patterns across your fleet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DonutChart />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Carrier Performance Scorecard</CardTitle>
                            <CardDescription className="text-slate-400">Comparing top carriers across key KPIs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CarrierPerformance />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recovery tab */}
            {activeTab === "recovery" && (
                <div className="space-y-5">
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Recovered", value: "$847K", sub: "+38.4% YoY", color: "text-green-400" },
                            { label: "Disputes Won", value: "94%", sub: "329 of 350", color: "text-sky-400" },
                            { label: "Avg Resolution", value: "4.2 days", sub: "Down from 12d", color: "text-yellow-400" },
                            { label: "Open Disputes", value: "5", sub: "$47,250 at stake", color: "text-orange-400" },
                        ].map(k => (
                            <Card key={k.label} className="bg-slate-900/50 border-white/10">
                                <CardContent className="pt-5">
                                    <div className={`font-mono text-2xl font-bold ${k.color}`}>{k.value}</div>
                                    <div className="text-sm text-white font-medium mt-1">{k.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Recovery Trend — 12 Months</CardTitle>
                            <CardDescription className="text-slate-400">Monthly recovered amounts and dispute volume.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecoveryChart />
                            <div className="mt-4 grid grid-cols-12 gap-1">
                                {RECOVERY_DATA.map(d => (
                                    <div key={d.month} className="text-center">
                                        <div className="font-mono text-xs text-sky-400 font-semibold">${(d.recovery / 1000).toFixed(0)}K</div>
                                        <div className="text-[9px] text-slate-500 mt-0.5">{d.month}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Agents tab */}
            {activeTab === "agents" && (
                <div className="space-y-5">
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Agent Performance Scorecards</CardTitle>
                            <CardDescription className="text-slate-400">Audit team performance across invoices, recovery, and dispute win rate.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AgentScorecard />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
