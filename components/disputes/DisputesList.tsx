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
import { ArrowUpRight, Scale } from "lucide-react"

export interface Dispute {
    id: string
    invoiceNumber: string
    type: string
    amount: number
    carrier: string
    status: 'draft' | 'sent' | 'negotiating' | 'accepted' | 'rejected'
    date: string
}

interface DisputesListProps {
    disputes: Dispute[]
    onView: (id: string) => void
}

export function DisputesList({ disputes, onView }: DisputesListProps) {
    const getStatusBadge = (status: Dispute['status']) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline" className="text-slate-400 border-slate-500/20">Draft</Badge>
            case 'sent':
                return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Sent to Carrier</Badge>
            case 'negotiating':
                return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Negotiating</Badge>
            case 'accepted':
                return <Badge variant="default" className="bg-green-500 text-white">Accepted</Badge>
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/20">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="rounded-md border border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-400">Dispute ID</TableHead>
                        <TableHead className="text-slate-400">Related Invoice</TableHead>
                        <TableHead className="text-slate-400">Reason</TableHead>
                        <TableHead className="text-slate-400">Carrier</TableHead>
                        <TableHead className="text-slate-400">Disputed Amount</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {disputes.map((dispute) => (
                        <TableRow key={dispute.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-mono text-white flex items-center gap-2">
                                <Scale className="h-4 w-4 text-slate-500" />
                                {dispute.id}
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono text-xs">{dispute.invoiceNumber}</TableCell>
                            <TableCell className="text-slate-300">{dispute.type}</TableCell>
                            <TableCell className="text-slate-300">{dispute.carrier}</TableCell>
                            <TableCell className="font-bold text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dispute.amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="text-ocean hover:text-white" onClick={() => onView(dispute.id)}>
                                    Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
