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
import { Eye, Download, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export interface Invoice {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    date: string
    status: 'uploaded' | 'pending' | 'processed' | 'analyzed' | 'flagged' | 'approved' | 'disputed' | 'paid'
    fraudScore: number // 0-100
}

interface InvoiceListProps {
    invoices: Invoice[]
    onView: (id: string) => void
    onDelete: (id: string) => void
}

export function InvoiceList({ invoices, onView, onDelete }: InvoiceListProps) {
    const getStatusBadge = (status: Invoice['status']) => {
        switch (status) {
            case 'uploaded':
                return <Badge variant="outline" className="bg-violet-500/10 text-violet-300 border-violet-500/20"><Clock className="w-3 h-3 mr-1" /> Uploaded</Badge>
            case 'pending':
                return <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case 'processed':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Processed</Badge>
            case 'analyzed':
                return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Analyzed</Badge>
            case 'flagged':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Flagged</Badge>
            case 'approved':
                return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
            case 'disputed':
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> Disputed</Badge>
            case 'paid':
                return <Badge variant="default" className="bg-emerald-500 text-white hover:bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="rounded-md border border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-400">Invoice #</TableHead>
                        <TableHead className="text-slate-400">Vendor</TableHead>
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Fraud Score</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-mono text-white">{invoice.invoiceNumber}</TableCell>
                            <TableCell className="text-slate-300">{invoice.vendor}</TableCell>
                            <TableCell className="text-slate-400">{invoice.date}</TableCell>
                            <TableCell className="font-medium text-white">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${invoice.fraudScore > 70 ? 'bg-red-500' : invoice.fraudScore > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${invoice.fraudScore}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs ${invoice.fraudScore > 70 ? 'text-red-400' : 'text-slate-500'}`}>{invoice.fraudScore}%</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => onView(invoice.id)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => onDelete(invoice.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
