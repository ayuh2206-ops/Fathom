"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Invoice, InvoiceList } from "@/components/invoices/InvoiceList"
import { UploadInvoiceModal } from "@/components/invoices/UploadInvoiceModal"
import { Button } from "@/components/ui/button"
import { Plus, Filter, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { useRouter } from "next/navigation"

type InvoiceApiResponse = {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    currency: string
    status: string
    fraudScore: number
    createdAt: string
}

function mapInvoice(invoice: InvoiceApiResponse): Invoice {
    const created = new Date(invoice.createdAt)
    const date = Number.isNaN(created.getTime())
        ? new Date().toISOString().split("T")[0]
        : created.toISOString().split("T")[0]

    return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor,
        amount: invoice.amount,
        date,
        status: invoice.status as Invoice["status"],
        fraudScore: invoice.fraudScore ?? 0,
    }
}

export default function InvoicesPage() {
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadInvoices = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/invoices", { cache: "no-store" })
            if (!response.ok) {
                throw new Error("Failed to load invoices")
            }

            const payload = await response.json()
            const nextInvoices = (payload.invoices || []).map((item: InvoiceApiResponse) => mapInvoice(item))
            setInvoices(nextInvoices)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load invoices")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadInvoices()
    }, [loadInvoices])

    const handleUpload = useCallback(async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/invoices", {
            method: "POST",
            body: formData,
        })

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload.message || "Upload failed")
        }

        const payload = await response.json()
        setInvoices((current) => [mapInvoice(payload.invoice as InvoiceApiResponse), ...current])
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" })
        if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            alert(payload.message || "Failed to delete invoice")
            return
        }

        setInvoices((current) => current.filter((invoice) => invoice.id !== id))
    }, [])

    const flaggedCount = useMemo(
        () => invoices.filter((invoice) => invoice.status === "flagged").length,
        [invoices]
    )
    const pendingCount = useMemo(
        () => invoices.filter((invoice) => invoice.status === "pending" || invoice.status === "uploaded").length,
        [invoices]
    )

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

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Processed"
                    value={invoices.length.toString()}
                    icon={FileText}
                    description="All uploaded invoices"
                />
                <StatCard
                    title="Flagged for Fraud"
                    value={flaggedCount.toString()}
                    icon={AlertTriangle}
                    trend={{ value: 0, direction: "up", label: "update after AI audit" }}
                />
                <StatCard
                    title="Pending Review"
                    value={pendingCount.toString()}
                    icon={CheckCircle}
                    description="Awaiting analysis"
                />
            </div>

            {error && <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            {isLoading ? (
                <div className="rounded-md border border-white/10 bg-slate-900/50 px-4 py-10 text-center text-slate-400">
                    Loading invoices...
                </div>
            ) : (
                <InvoiceList
                    invoices={invoices}
                    onView={(id) => router.push(`/dashboard/invoices/${id}`)}
                    onDelete={handleDelete}
                />
            )}

            <UploadInvoiceModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    )
}
