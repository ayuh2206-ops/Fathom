"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertsList } from "@/components/alerts/AlertsList"
import { AlertDetailSheet } from "@/components/alerts/AlertDetailSheet"
import { FraudTrendChart } from "@/components/alerts/FraudTrendChart"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Filter, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"

interface Alert {
    id: string
    severity: "critical" | "high" | "medium" | "low"
    type: string
    entity: string
    date: string
    status: "open" | "investigating" | "resolved" | "false_positive" | string
    description: string
    evidence?: string
    fraudScore?: number
    invoiceId?: string
    aisVerified?: boolean
}

type AlertApiRecord = {
    id: string
    type: string
    severity: Alert["severity"]
    status: string
    description: string
    vesselName?: string | null
    portName?: string | null
    agentName?: string | null
    fraudScore?: number
    flagTypes?: string[]
    timestamp?: string | null
    invoiceId?: string | null
    invoiceAmount?: number
    currency?: string
    aisVerified?: boolean
}

function formatRelativeTime(timestamp: string | null | undefined): string {
    if (!timestamp) {
        return "Unknown"
    }

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
        return "Unknown"
    }

    const diffMs = Date.now() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 1) {
        return "Just now"
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
    }

    return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) === 1 ? "" : "s"} ago`
}

function mapAlert(alert: AlertApiRecord): Alert {
    return {
        id: alert.id,
        severity: alert.severity,
        type: alert.type?.replace(/_/g, " ").toLowerCase() ?? "fraud alert",
        entity: alert.vesselName ?? alert.invoiceId ?? "Unknown",
        date: formatRelativeTime(alert.timestamp),
        status: (alert.status ?? "open") as Alert["status"],
        description: alert.description,
        evidence: alert.flagTypes?.join(", ") ?? undefined,
        fraudScore: typeof alert.fraudScore === "number" ? alert.fraudScore : undefined,
        invoiceId: alert.invoiceId ?? undefined,
        aisVerified: typeof alert.aisVerified === "boolean" ? alert.aisVerified : undefined,
    }
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadAlerts = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/alerts", { cache: "no-store" })
            if (!response.ok) {
                throw new Error("Failed to load alerts")
            }

            const payload = (await response.json()) as { alerts?: AlertApiRecord[] }
            setAlerts((payload.alerts ?? []).map(mapAlert))
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load alerts")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadAlerts()
    }, [loadAlerts])

    const handleViewAlert = (alert: Alert) => {
        setSelectedAlert(alert)
        setIsSheetOpen(true)
    }

    const handleUpdateStatus = (id: string, newStatus: Alert["status"]) => {
        setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, status: newStatus } : alert)))
        setSelectedAlert((current) => (current && current.id === id ? { ...current, status: newStatus } : current))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Fraud Alerts</h2>
                    <p className="text-slate-400">Review and resolve detected anomalies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                        onClick={() => void loadAlerts()}
                        disabled={isLoading}
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Critical Issues"
                    value={alerts.filter((alert) => alert.severity === "critical").length.toString()}
                    icon={ShieldAlert}
                    description="Requires immediate attention"
                />
                <StatCard
                    title="Open Alerts"
                    value={alerts.filter((alert) => alert.status === "open").length.toString()}
                    icon={AlertTriangle}
                    trend={{ value: 5, direction: "up", label: "vs yesterday" }}
                />
                <StatCard
                    title="Resolved"
                    value={alerts.filter((alert) => alert.status === "resolved").length.toString()}
                    icon={CheckCircle}
                    description="Current dataset"
                />
                <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col justify-between">
                    <span className="text-sm font-medium text-slate-400">7-Day Trend</span>
                    <FraudTrendChart />
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="rounded-md border border-white/10 bg-slate-900/50 px-4 py-10 text-center text-slate-400">
                    Loading alerts...
                </div>
            ) : alerts.length === 0 ? (
                <div className="rounded-md border border-white/10 bg-slate-900/50 px-4 py-10 text-center text-slate-400">
                    No alerts found.
                </div>
            ) : (
                <AlertsList alerts={alerts} onView={handleViewAlert} />
            )}

            <AlertDetailSheet
                alert={selectedAlert}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    )
}
