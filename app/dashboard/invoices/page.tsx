"use client"

import { useState } from "react"
import { InvoiceList, Invoice } from "@/components/invoices/InvoiceList"
import { UploadInvoiceModal } from "@/components/invoices/UploadInvoiceModal"
import { Button } from "@/components/ui/button"
import { Plus, Filter, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { useRouter } from "next/navigation"

const INITIAL_INVOICES: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-2024-001', vendor: 'Maersk Line', amount: 12500.00, date: '2024-01-20', status: 'flagged', fraudScore: 85 },
    { id: '2', invoiceNumber: 'INV-2024-002', vendor: 'CMA CGM', amount: 8200.50, date: '2024-01-21', status: 'processed', fraudScore: 12 },
    { id: '3', invoiceNumber: 'INV-2024-003', vendor: 'Hapag-Lloyd', amount: 15750.00, date: '2024-01-22', status: 'pending', fraudScore: 0 },
    { id: '4', invoiceNumber: 'INV-2024-004', vendor: 'MSC', amount: 5400.25, date: '2024-01-23', status: 'approved', fraudScore: 5 },
    { id: '5', invoiceNumber: 'INV-2024-005', vendor: 'ONE', amount: 9800.00, date: '2024-01-23', status: 'flagged', fraudScore: 72 },
]

export default function InvoicesPage() {
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
    const [isUploadOpen, setIsUploadOpen] = useState(false)

    const handleUpload = (file: File) => {
        // Simulate adding a new processed invoice
        const newInvoice: Invoice = {
            id: Math.random().toString(36).substr(2, 9),
            invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000)}`,
            vendor: 'Simulated Vendor',
            amount: Math.floor(Math.random() * 10000) + 1000,
            date: new Date().toISOString().split('T')[0],
            status: 'processed', // Default to processed after "upload"
            fraudScore: Math.floor(Math.random() * 100)
        }
        setInvoices([newInvoice, ...invoices])
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Invoices</h2>
                    <p className="text-slate-400">Manage and analyze your shipping invoices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark" onClick={() => setIsUploadOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Processed"
                    value={invoices.length.toString()}
                    icon={FileText}
                    description="Last 30 days"
                />
                <StatCard
                    title="Flagged for Fraud"
                    value={invoices.filter(i => i.status === 'flagged').length.toString()}
                    icon={AlertTriangle}
                    trend={{ value: 12, direction: 'up', label: 'vs last week' }}
                />
                <StatCard
                    title="Pending Review"
                    value={invoices.filter(i => i.status === 'pending').length.toString()}
                    icon={CheckCircle}
                    description="Awaiting approval"
                />
            </div>

            <InvoiceList
                invoices={invoices}
                onView={(id) => router.push(`/dashboard/invoices/${id}`)}
                onDelete={(id) => setInvoices(invoices.filter(i => i.id !== id))}
            />

            <UploadInvoiceModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    )
}
