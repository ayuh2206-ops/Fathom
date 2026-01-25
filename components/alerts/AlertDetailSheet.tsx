"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet"
import { AlertTriangle, ShieldCheck, Ship, FileText, Activity } from "lucide-react"

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

interface AlertDetailSheetProps {
    alert: Alert | null
    isOpen: boolean
    onClose: () => void
    onUpdateStatus: (id: string, newStatus: Alert['status']) => void
}

export function AlertDetailSheet({ alert, isOpen, onClose, onUpdateStatus }: AlertDetailSheetProps) {
    if (!alert) return null

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="bg-slate-950 border-l border-white/10 text-white w-[400px] sm:w-[540px]">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        {alert.severity === 'critical' || alert.severity === 'high' ? (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">{alert.severity}</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{alert.severity}</Badge>
                        )}
                        <span className="text-sm text-slate-500 font-mono">#{alert.id}</span>
                    </div>
                    <SheetTitle className="text-xl">{alert.type}</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Detected on {alert.date}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Entity Info */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            {alert.entity.includes('INV') ? <FileText className="h-6 w-6 text-blue-400" /> : <Ship className="h-6 w-6 text-green-400" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Related Entity</p>
                            <p className="font-mono text-white text-lg">{alert.entity}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300">Analysis</h4>
                        <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-red-500/50 pl-4">
                            {alert.description}
                        </p>
                    </div>

                    {/* Evidence */}
                    {alert.evidence && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-300">Evidence</h4>
                            <div className="bg-slate-900 p-3 rounded-md border border-white/10 text-xs font-mono text-slate-400">
                                {alert.evidence}
                            </div>
                        </div>
                    )}

                    {/* Timeline (Mock) */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300">Activity Log</h4>
                        <div className="relative pl-4 border-l border-white/10 space-y-4">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-ocean border-2 border-slate-950"></div>
                                <p className="text-xs text-slate-500">Just now</p>
                                <p className="text-sm text-white">Alert viewed by you</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-950"></div>
                                <p className="text-xs text-slate-500">{alert.date}</p>
                                <p className="text-sm text-white">System generated alert</p>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-8 flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full" onClick={() => { onUpdateStatus(alert.id, 'false_positive'); onClose(); }}>
                        Mark False Positive
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark w-full" onClick={() => { onUpdateStatus(alert.id, 'resolved'); onClose(); }}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Resolve Alert
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
