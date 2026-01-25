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
import { MoreHorizontal, ArrowUpRight } from "lucide-react"

interface Vessel {
    id: string
    name: string
    imo: string
    lat: number
    lng: number
    heading: number
    speed: number
    status: 'moving' | 'anchored' | 'moored'
    nextPort: string
    eta: string
}

interface FleetListProps {
    vessels: Vessel[]
    onViewDetails: (id: string) => void
}

export function FleetList({ vessels, onViewDetails }: FleetListProps) {
    return (
        <div className="rounded-md border border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-400">Vessel Name</TableHead>
                        <TableHead className="text-slate-400">IMO Number</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Speed</TableHead>
                        <TableHead className="text-slate-400">Next Port</TableHead>
                        <TableHead className="text-slate-400">ETA</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vessels.map((vessel) => (
                        <TableRow key={vessel.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{vessel.name}</TableCell>
                            <TableCell className="font-mono text-slate-400">{vessel.imo}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={vessel.status === 'moving' ? 'default' : 'secondary'}
                                    className={
                                        vessel.status === 'moving' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                            vessel.status === 'anchored' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' :
                                                'bg-slate-500/20 text-slate-400'
                                    }
                                >
                                    {vessel.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">{vessel.speed} kn</TableCell>
                            <TableCell className="text-slate-300">{vessel.nextPort}</TableCell>
                            <TableCell className="text-slate-300">{vessel.eta}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onViewDetails(vessel.id)}>
                                    <ArrowUpRight className="h-4 w-4 text-slate-400 hover:text-white" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
