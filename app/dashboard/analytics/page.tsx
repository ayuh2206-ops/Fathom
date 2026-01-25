"use client"

import { SpendChart } from "@/components/analytics/SpendChart"
import { CostDistribution } from "@/components/analytics/CostDistribution"
import { CarrierPerformance } from "@/components/analytics/CarrierPerformance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Analytics</h2>
                    <p className="text-slate-400">Deep dive into fleet performance and cost efficiency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last 6 Months
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Spend Analysis */}
                <Card className="col-span-2 bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Spend Analysis</CardTitle>
                        <CardDescription className="text-slate-400">Total freight spend vs disputed charges.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendChart />
                    </CardContent>
                </Card>

                {/* Cost Distribution */}
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

            {/* Carrier Performance */}
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
    )
}
