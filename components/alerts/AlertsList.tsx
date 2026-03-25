"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Ship, AlertTriangle } from "lucide-react"

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

interface AlertsListProps {
    alerts: Alert[]
    onView: (alert: Alert) => void
}

export function AlertsList({ alerts, onView }: AlertsListProps) {
    return (
        <div className="rounded-md border border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-400">Severity</TableHead>
                        <TableHead className="text-slate-400">Alert Type</TableHead>
                        <TableHead className="text-slate-400">Related Entity</TableHead>
                        <TableHead className="text-slate-400">Detected</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alerts.map((alert) => (
                        <TableRow key={alert.id} className="border-white/10 hover:bg-white/5 group">
                            <TableCell>
                                {alert.severity === 'critical' ? (
                                    <Badge className="bg-red-500 text-white hover:bg-red-600 border-none animate-pulse">CRITICAL</Badge>
                                ) : alert.severity === 'high' ? (
                                    <Badge variant="destructive" className="bg-orange-500/20 text-orange-400 border-orange-500/20">HIGH</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/20">MEDIUM</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-slate-500" />
                                    {alert.type}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                                    {alert.entity.includes('INV') ? <FileText className="h-3 w-3 text-blue-400" /> : <Ship className="h-3 w-3 text-green-400" />}
                                    {alert.entity}
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">{alert.date}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                                    {alert.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="text-ocean hover:text-white hover:bg-ocean" onClick={() => onView(alert)}>
                                    Review <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
