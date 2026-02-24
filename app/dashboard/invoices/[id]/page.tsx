"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText, Shield, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { GenerateDisputeModal } from "@/components/disputes/GenerateDisputeModal"

type InvoiceStatus =
    | "uploaded"
    | "pending"
    | "processed"
    | "analyzed"
    | "flagged"
    | "approved"
    | "disputed"
    | "paid"

type InvoiceDetail = {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    currency: string
    status: InvoiceStatus
    fraudScore: number
    fileName: string
    fileUrl: string | null
    createdAt: string
}

function getStatusBadge(status: InvoiceStatus) {
    if (status === "flagged") {
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">Flagged</Badge>
    }

    if (status === "uploaded" || status === "pending") {
        return <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/20">Queued</Badge>
    }

    if (status === "processed" || status === "analyzed") {
        return <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Analyzed</Badge>
    }

    if (status === "disputed") {
        return <Badge className="bg-orange-500/10 text-orange-300 border border-orange-500/20">Disputed</Badge>
    }

    if (status === "paid" || status === "approved") {
        return <Badge className="bg-green-500/10 text-green-300 border border-green-500/20">Cleared</Badge>
    }

    return <Badge variant="outline">{status}</Badge>
}

export default function InvoiceDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)

    useEffect(() => {
        const loadInvoice = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/invoices/${params.id}`, { cache: "no-store" })
                if (!response.ok) {
                    if (response.status === 404) {
                        setInvoice(null)
                        setError("Invoice not found")
                        return
                    }

                    throw new Error("Failed to load invoice")
                }

                const payload = await response.json()
                setInvoice(payload.invoice as InvoiceDetail)
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Failed to load invoice")
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            void loadInvoice()
        }
    }, [params.id])

    const formattedAmount = useMemo(() => {
        if (!invoice) {
            return "$0.00"
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: invoice.currency || "USD",
        }).format(invoice.amount)
    }, [invoice])

    const createdAt = useMemo(() => {
        if (!invoice) {
            return "-"
        }

        const date = new Date(invoice.createdAt)
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString()
    }, [invoice])

    if (isLoading) {
        return (
            <div className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-12 text-center text-slate-400">
                Loading invoice...
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
                <FileText className="h-16 w-16 text-slate-700" />
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Invoice not found</h2>
                    <p className="text-slate-400 mb-5">{error || "This invoice doesn&apos;t exist or has been removed."}</p>
                    <Link href="/dashboard/invoices">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h2>
                            {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{invoice.vendor} · Uploaded {createdAt}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {invoice.fileUrl && (
                        <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 hover:text-white">
                            <a href={invoice.fileUrl} target="_blank" rel="noreferrer">
                                <Download className="h-4 w-4 mr-2" /> Download
                            </a>
                        </Button>
                    )}
                    <Button className="bg-sky-600 hover:bg-sky-500 text-white" size="sm" onClick={() => setIsDisputeOpen(true)}>
                        Generate Dispute
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Invoice Summary</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Invoice Number</span>
                            <span className="text-white font-mono">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Vendor</span>
                            <span className="text-white">{invoice.vendor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Amount</span>
                            <span className="text-white font-semibold">{formattedAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Current Status</span>
                            <span className="text-white capitalize">{invoice.status}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Audit Pipeline</div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="h-4 w-4 text-violet-300" />
                            <span>Invoice ingested and stored</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Shield className="h-4 w-4 text-cyan-300" />
                            <span>OCR + verification stage</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <AlertTriangle className="h-4 w-4 text-orange-300" />
                            <span>Dispute recommendation stage</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">File Metadata</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-400">Stored File</span>
                            <span className="text-white text-right break-all">{invoice.fileName || "Uploaded invoice"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Fraud Score</span>
                            <span className="text-white">{invoice.fraudScore}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <GenerateDisputeModal
                isOpen={isDisputeOpen}
                onClose={() => setIsDisputeOpen(false)}
                onGenerate={() => setIsDisputeOpen(false)}
            />
        </div>
    )
}
