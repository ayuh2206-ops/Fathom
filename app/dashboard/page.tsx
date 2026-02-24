import { StatCard } from "@/components/dashboard/StatCard"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, FileText, Ship, Scale, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const RECENT_ALERTS = [
    { id: "ALT-1002", invoice: "INV-2024-001", port: "Los Angeles", vessel: "MV Pacific Dawn", severity: "critical", desc: "Time Inflation: 81.5 hours overcharged", amount: "$12,225", confidence: 98, age: "2h ago" },
    { id: "ALT-1003", invoice: "EVER GIVEN", port: "Hong Kong", vessel: "MV Pacific Star", severity: "high", desc: "Phantom charges: billing for services never rendered", amount: "$22,500", confidence: 94, age: "5h ago" },
    { id: "ALT-0998", invoice: "INV-2024-005", port: "Singapore", vessel: "MV Coral Sea", severity: "medium", desc: "Duplicate Invoice: matches previously paid #INV-2023-899", amount: "$8,200", confidence: 88, age: "1d ago" },
]

const RISK_AGENTS = [
    { rank: 1, name: "Los Angeles Port Services", port: "Los Angeles", invoices: 47, rate: 81, overcharged: "$187K", winRate: "100%" },
    { rank: 2, name: "Singapore Terminal Co", port: "Singapore", invoices: 31, rate: 62, overcharged: "$143K", winRate: "89%" },
    { rank: 3, name: "Mumbai Port Authority", port: "Mumbai", invoices: 28, rate: 54, overcharged: "$98K", winRate: "91%" },
    { rank: 4, name: "Hong Kong Stevedores", port: "Hong Kong", invoices: 19, rate: 41, overcharged: "$67K", winRate: "84%" },
    { rank: 5, name: "Rotterdam Agents Ltd", port: "Rotterdam", invoices: 22, rate: 28, overcharged: "$52K", winRate: "76%" },
]

const ARRIVALS = [
    { vessel: "MV Pacific Dawn", destination: "Singapore", flag: "🇵🇦", eta: "Jan 1, 14:00 UTC", countdown: "2d 6h", risk: true },
    { vessel: "MV Coral Sea", destination: "Rotterdam", flag: "🇧🇸", eta: "Jan 3, 09:30 UTC", countdown: "4d 0h", risk: false },
    { vessel: "MV Baltic Star", destination: "Shanghai", flag: "🇬🇧", eta: "Jan 5, 22:00 UTC", countdown: "6d 15h", risk: true },
]

const SEVERITY_CONFIG = {
    critical: { bar: "bg-red-500", badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "CRITICAL" },
    high: { bar: "bg-orange-500", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "HIGH" },
    medium: { bar: "bg-yellow-500", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "MEDIUM" },
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Overview</h2>
                    <p className="text-slate-400 text-sm">Good morning. Here&apos;s your fleet overview.</p>
                </div>
            </div>

            {/* 6 KPI Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
                <StatCard title="Recovered YTD" value="$847,230" icon={DollarSign} trend={{ value: 38.4, direction: "up", label: "vs last year" }} />
                <StatCard title="Active Alerts" value="23" icon={Activity} description="5 new in 24hrs" trend={{ value: 5, direction: "up", label: "new alerts" }} />
                <StatCard title="Invoices (30d)" value="847" icon={FileText} trend={{ value: 12, direction: "up", label: "vs last month" }} />
                <StatCard title="Fleet Status" value="15/15" icon={Ship} description="All vessels with AIS" />
                <StatCard title="Active Disputes" value="5" icon={Scale} description="$47,250 in progress" />
                <StatCard title="Fraud Rate" value="2.7%" icon={TrendingDown} trend={{ value: 0.3, direction: "down", label: "improving" }} />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Recovered Revenue</CardTitle>
                        <CardDescription className="text-slate-400">You have recovered $847,230 this year.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-slate-400">System alerts and team actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Alerts Feed */}
            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="text-white text-lg">Recent Fraud Alerts</CardTitle>
                        <CardDescription className="text-slate-400">Latest anomalies detected across your fleet.</CardDescription>
                    </div>
                    <Link href="/dashboard/alerts" className="text-sky-400 text-sm hover:text-sky-300">View All →</Link>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                    {RECENT_ALERTS.map((alert) => {
                        const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG]
                        return (
                            <div key={alert.id} className="group border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <div className="flex gap-4 p-5">
                                    <div className={`w-1 rounded-full shrink-0 ${cfg.bar}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={`text-[10px] border ${cfg.badge} shrink-0`}>{cfg.label}</Badge>
                                                <span className="font-mono text-sm text-white font-semibold">{alert.invoice}</span>
                                                <span className="text-slate-500 text-xs">· {alert.port}</span>
                                            </div>
                                            <span className="text-xs text-slate-600 shrink-0">{alert.age}</span>
                                        </div>
                                        <p className="text-sm text-white font-medium mb-0.5">{alert.vessel}</p>
                                        <p className="text-sm text-slate-400">{alert.desc}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm font-bold text-yellow-400">💰 {alert.amount}</span>
                                                <span className="text-xs text-slate-500">Confidence: {alert.confidence}%</span>
                                            </div>
                                            <Link href="/dashboard/alerts" className="text-xs text-sky-400 hover:text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Report →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Bottom row: Agent Risk + Upcoming Arrivals */}
            <div className="grid gap-4 lg:grid-cols-2">

                {/* Agent Risk Table */}
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-white text-lg">Top Risk Agents</CardTitle>
                            <CardDescription className="text-slate-400">Highest fraud rate this month.</CardDescription>
                        </div>
                        <Link href="/dashboard/analytics" className="text-sky-400 text-sm hover:text-sky-300">View All →</Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-4 py-2.5 text-left text-slate-500 font-medium">#</th>
                                    <th className="px-4 py-2.5 text-left text-slate-500 font-medium">Agent</th>
                                    <th className="px-4 py-2.5 text-left text-slate-500 font-medium">Fraud Rate</th>
                                    <th className="px-4 py-2.5 text-right text-slate-500 font-medium">Overcharged</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RISK_AGENTS.map((agent) => (
                                    <tr key={agent.rank} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-slate-500 font-mono">{agent.rank}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-white font-medium">{agent.name}</div>
                                            <div className="text-slate-500">{agent.port} · {agent.invoices} invoices</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${agent.rate > 60 ? "bg-red-500" : agent.rate > 30 ? "bg-orange-500" : "bg-yellow-500"}`}
                                                        style={{ width: `${agent.rate}%` }}
                                                    />
                                                </div>
                                                <span className={`font-mono font-bold ${agent.rate > 60 ? "text-red-400" : agent.rate > 30 ? "text-orange-400" : "text-yellow-400"}`}>
                                                    {agent.rate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-yellow-400 font-semibold">{agent.overcharged}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Upcoming Arrivals */}
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-white text-lg">Upcoming Arrivals</CardTitle>
                            <CardDescription className="text-slate-400">Next 7 days.</CardDescription>
                        </div>
                        <Link href="/dashboard/fleet" className="text-sky-400 text-sm hover:text-sky-300">View Fleet →</Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ARRIVALS.map((arr) => (
                            <div key={arr.vessel} className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 hover:border-white/20 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">🚢</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-white text-sm font-semibold">{arr.vessel}</span>
                                        {arr.risk && (
                                            <Badge className="text-[9px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20 border">⚠ RISK PORT</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        → {arr.flag} {arr.destination}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-mono text-white">{arr.eta}</div>
                                    <div className="text-xs text-sky-400">in {arr.countdown}</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

