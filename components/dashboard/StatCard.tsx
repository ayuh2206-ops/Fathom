import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string
    description?: string
    icon: React.ElementType
    trend?: {
        value: number
        direction: "up" | "down" | "neutral"
        label: string
    }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
    return (
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {(trend || description) && (
                    <div className="flex flex-col mt-1 space-y-1">
                        {trend && (
                            <div className="flex items-center">
                                <span
                                    className={cn(
                                        "text-xs font-medium flex items-center mr-2",
                                        trend.direction === "up" ? "text-green-400" :
                                            trend.direction === "down" ? "text-red-400" : "text-slate-400"
                                    )}
                                >
                                    {trend.direction === "up" && <ArrowUp className="h-3 w-3 mr-1" />}
                                    {trend.direction === "down" && <ArrowDown className="h-3 w-3 mr-1" />}
                                    {trend.direction === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                                    {trend.value}%
                                </span>
                                <span className="text-xs text-slate-500">{trend.label}</span>
                            </div>
                        )}
                        {description && (
                            <p className="text-xs text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
