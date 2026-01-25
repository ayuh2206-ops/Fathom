"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
    { name: "Ocean Freight", value: 65, color: "#3b82f6" },
    { name: "THC", value: 15, color: "#10b981" },
    { name: "Detention/Demurrage", value: 12, color: "#ef4444" }, // High percentage highlights problem
    { name: "Documentation", value: 5, color: "#f59e0b" },
    { name: "Other", value: 3, color: "#64748b" },
]

export function CostDistribution() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    )
}
