"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const data = [
    { name: "Mon", alerts: 4 },
    { name: "Tue", alerts: 7 },
    { name: "Wed", alerts: 2 },
    { name: "Thu", alerts: 9 },
    { name: "Fri", alerts: 5 },
    { name: "Sat", alerts: 1 },
    { name: "Sun", alerts: 3 },
]

export function FraudTrendChart() {
    return (
        <ResponsiveContainer width="100%" height={100}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Bar
                    dataKey="alerts"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
