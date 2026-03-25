"use client"

import { useState } from "react"
import { AlertsList } from "@/components/alerts/AlertsList"
import { AlertDetailSheet } from "@/components/alerts/AlertDetailSheet"
import { FraudTrendChart } from "@/components/alerts/FraudTrendChart"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Filter, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"

interface Alert {
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    type: string
    entity: string
    date: string
    status: 'open' | 'investigating' | 'resolved' | 'false_positive'
    description: string
    evidence?: string
}

const INITIAL_ALERTS: Alert[] = [
    {
        id: 'ALT-1002',
        severity: 'critical',
        type: 'Detention Charge Inflation',
        entity: 'INV-2024-001',
        date: '2 hours ago',
        status: 'open',
        description: 'Invoice #INV-2024-001 contains detention charges for 5 days, but AIS tracking confirms container was returned to terminal within 48 hours (Free Time). Potential overcharge of $1,200.',
        evidence: 'Container returns timestamp: 2024-01-18 14:30 UTC'
    },
    {
        id: 'ALT-1003',
        severity: 'high',
        type: 'Route Deviation',
        entity: 'EVER GIVEN',
        date: '5 hours ago',
        status: 'investigating',
        description: 'Vessel deviated >50nm from standard lane without reported weather advisory.',
        evidence: 'Deviation started at 14.5N, 45.2E'
    },
    {
        id: 'ALT-0998',
        severity: 'medium',
        type: 'Duplicate Invoice',
        entity: 'INV-2024-005',
        date: '1 day ago',
        status: 'open',
        description: 'Invoice amount and line items match previously paid invoice #INV-2023-899.',
    }
]

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleViewAlert = (alert: Alert) => {
        setSelectedAlert(alert)
        setIsSheetOpen(true)
    }

    const handleUpdateStatus = (id: string, newStatus: Alert['status']) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a))
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
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => window.location.reload()}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Critical Issues"
                    value={alerts.filter(a => a.severity === 'critical').length.toString()}
                    icon={ShieldAlert}
                    description="Requires immediate attention"
                />
                <StatCard
                    title="Open Alerts"
                    value={alerts.filter(a => a.status === 'open').length.toString()}
                    icon={AlertTriangle}
                    trend={{ value: 5, direction: 'up', label: 'vs yesterday' }}
                />
                <StatCard
                    title="Resolved"
                    value="142"
                    icon={CheckCircle}
                    description="This month"
                />
                <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4 flex flex-col justify-between">
                    <span className="text-sm font-medium text-slate-400">7-Day Trend</span>
                    <FraudTrendChart />
                </div>
            </div>

            <AlertsList alerts={alerts} onView={handleViewAlert} />

            <AlertDetailSheet
                alert={selectedAlert}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    )
}
