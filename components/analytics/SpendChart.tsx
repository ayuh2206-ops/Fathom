"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
    { name: "Jan", total: 45000, disputed: 1200 },
    { name: "Feb", total: 52000, disputed: 450 },
    { name: "Mar", total: 48000, disputed: 2100 },
    { name: "Apr", total: 61000, disputed: 800 },
    { name: "May", total: 55000, disputed: 1500 },
    { name: "Jun", total: 67000, disputed: 3200 },
]

export function SpendChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="total" name="Total Spend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disputed" name="Disputed Amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
