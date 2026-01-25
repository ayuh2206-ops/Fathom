"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign } from "lucide-react"

export function ROICalculator() {
    const [volume, setVolume] = React.useState([10000])
    const [cost, setCost] = React.useState([2500]) // Avg cost per container
    const [errorRate, setErrorRate] = React.useState([3]) // 3%

    const potentialRecoverable = React.useMemo(() => {
        // potentialLoss = volume * cost * (errorRate / 100)
        // We estimate we can recover usually 80% of errors found, but let's just show the total overflow
        return (volume[0] * cost[0] * (errorRate[0] / 100))
    }, [volume, cost, errorRate])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <section id="roi-calculator" className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Text */}
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                            How much revenue are you <span className="text-red-400">losing</span>?
                        </h2>
                        <p className="text-lg text-slate-400 mb-8">
                            Top shipping lines estimate that 3-5% of all invoice charges are incorrect.
                            From time inflation to phantom detention fees, these errors add up.
                            See what FATHOM could recover for you.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Avg. Recovery Rate: 94%",
                                "No upfront integration costs",
                                "Automated dispute generation"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="h-6 w-6 rounded-full bg-ocean/20 flex items-center justify-center text-ocean">
                                        ✓
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Calculator Card */}
                    <Card className="bg-slate-950/50 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">ROI Calculator</CardTitle>
                            <CardDescription className="text-slate-400">Estimate your annual recovery potential</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Volume Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-300">Annual Shipment Volume</label>
                                    <span className="font-mono text-ocean">{volume[0].toLocaleString()} TEU</span>
                                </div>
                                <Slider
                                    value={volume}
                                    onValueChange={setVolume}
                                    min={1000}
                                    max={100000}
                                    step={1000}

                                />
                            </div>

                            {/* Cost Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-300">Avg. Cost per Container</label>
                                    <span className="font-mono text-ocean">${cost[0].toLocaleString()}</span>
                                </div>
                                <Slider
                                    value={cost}
                                    onValueChange={setCost}
                                    min={500}
                                    max={15000}
                                    step={50}
                                />
                            </div>

                            {/* Error Rate Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-300">Est. Industry Error Rate</label>
                                    <span className="font-mono text-ocean">{errorRate[0]}%</span>
                                </div>
                                <Slider
                                    value={errorRate}
                                    onValueChange={setErrorRate}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                />
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <div className="text-center">
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-widest">Potential Recoverable Revenue</p>
                                    <div className="text-5xl font-bold text-white mb-6 tabular-nums relative inline-block">
                                        {formatCurrency(potentialRecoverable)}
                                        <div className="absolute -inset-4 bg-ocean/20 blur-xl -z-10 rounded-full opacity-50"></div>
                                    </div>
                                    <Button size="lg" className="w-full bg-ocean hover:bg-ocean-dark text-white h-12">
                                        Recover This Now
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
