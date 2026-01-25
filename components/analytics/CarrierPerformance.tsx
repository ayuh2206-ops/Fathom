"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { subject: 'On-Time Arrival', A: 90, B: 65, fullMark: 100 },
    { subject: 'Doc Accuracy', A: 85, B: 50, fullMark: 100 },
    { subject: 'Cost Efficiency', A: 70, B: 85, fullMark: 100 },
    { subject: 'Communication', A: 80, B: 60, fullMark: 100 },
    { subject: 'Equipment Avail', A: 95, B: 70, fullMark: 100 },
]

export function CarrierPerformance() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            {/* Radar Comparison */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Maersk"
                            dataKey="A"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            fill="#0ea5e9"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="CMA CGM"
                            dataKey="B"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="#f59e0b"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs mt-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div> Maersk Line</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div> CMA CGM</div>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Detention Rate (Maersk)</span>
                        <span className="text-green-400 font-mono">1.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[1.2%]"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Detention Rate (CMA CGM)</span>
                        <span className="text-red-400 font-mono">4.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[4.8%]"></div>
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-md border border-white/5 mt-4">
                    <p className="text-xs text-slate-400 italic">
                        "Maersk Line shows significantly better detention performance this quarter. CMA CGM recurring issues with doc delays are impacting free time usage."
                    </p>
                </div>
            </div>
        </div>
    )
}
