import { StatCard } from "@/components/dashboard/StatCard"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, FileText, Ship } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Recovered Revenue"
                    value="$45,231.89"
                    icon={DollarSign}
                    trend={{ value: 20.1, direction: "up", label: "from last month" }}
                />
                <StatCard
                    title="Active Fleet"
                    value="12 Vessels"
                    icon={Ship}
                    trend={{ value: 2, direction: "up", label: "new vessels" }}
                />
                <StatCard
                    title="Pending Invoices"
                    value="24"
                    icon={FileText}
                    description="3 flagged for review"
                />
                <StatCard
                    title="Potential Fraud"
                    value="$12,450.00"
                    icon={Activity}
                    description="Detected this week"
                    trend={{ value: 4, direction: "down", label: "alerts vs last week" }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Main Chart */}
                <Card className="col-span-4 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Recovered Revenue</CardTitle>
                        <CardDescription className="text-slate-400">
                            You have recovered $174,000 this year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="col-span-3 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-slate-400">
                            System alerts and team actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
