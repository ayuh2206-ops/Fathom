"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    AlertTriangle,
    ArrowLeft,
    Clock,
    Copy,
    Download,
    FileText,
    Loader2,
    Shield,
    Sparkles,
} from "lucide-react"
import Link from "next/link"

import { GenerateDisputeModal } from "@/components/disputes/GenerateDisputeModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type InvoiceStatus =
    | "uploaded"
    | "pending"
    | "processed"
    | "analyzed"
    | "flagged"
    | "approved"
    | "disputed"
    | "paid"

type RiskLevel = "low" | "medium" | "high" | "critical"

type RecommendedAction = "approve" | "review" | "dispute" | "escalate"

type FraudFlag = {
    type: string
    description: string
    severity: "low" | "medium" | "high"
    affectedField: string
    chargeAmount: number | null
}

type DisputeDraft = {
    subject: string
    body: string
    keyPoints: string[]
    estimatedRecoveryAmount: number | null
}

type InvoiceDetail = {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    currency: string
    status: InvoiceStatus
    fraudScore: number | null
    riskLevel: RiskLevel | null
    fraudFlags: FraudFlag[]
    fraudSummary: string | null
    recommendedAction: RecommendedAction | null
    disputeDraft: DisputeDraft | null
    fileName: string
    fileUrl: string | null
    createdAt: string
    analyzedAt: string | null
    analysisError: string | null
}

type InvoiceResponse = {
    invoice?: InvoiceDetail
    error?: string
    message?: string
}

const ANALYZABLE_STATUSES: InvoiceStatus[] = ["uploaded", "pending"]

function getStatusBadge(status: InvoiceStatus) {
    if (status === "flagged") {
        return <Badge className="border border-red-500/20 bg-red-500/10 text-red-400">Flagged</Badge>
    }

    if (status === "uploaded" || status === "pending") {
        return <Badge className="border border-violet-500/20 bg-violet-500/10 text-violet-300">Queued</Badge>
    }

    if (status === "processed" || status === "analyzed") {
        return <Badge className="border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Analyzed</Badge>
    }

    if (status === "disputed") {
        return <Badge className="border border-orange-500/20 bg-orange-500/10 text-orange-300">Disputed</Badge>
    }

    if (status === "paid" || status === "approved") {
        return <Badge className="border border-green-500/20 bg-green-500/10 text-green-300">Cleared</Badge>
    }

    return <Badge variant="outline">{status}</Badge>
}

function getRiskLevelBadge(riskLevel: RiskLevel | null) {
    if (riskLevel === "critical") {
        return <Badge className="border border-red-500/20 bg-red-500/10 text-red-400">Critical Risk</Badge>
    }

    if (riskLevel === "high") {
        return <Badge className="border border-orange-500/20 bg-orange-500/10 text-orange-300">High Risk</Badge>
    }

    if (riskLevel === "medium") {
        return <Badge className="border border-yellow-500/20 bg-yellow-500/10 text-yellow-300">Medium Risk</Badge>
    }

    if (riskLevel === "low") {
        return <Badge className="border border-green-500/20 bg-green-500/10 text-green-300">Low Risk</Badge>
    }

    return <Badge variant="outline">Unrated</Badge>
}

function getRecommendedActionBadge(action: RecommendedAction | null) {
    if (action === "escalate") {
        return <Badge className="border border-red-500/20 bg-red-500/10 text-red-400">Escalate</Badge>
    }

    if (action === "dispute") {
        return <Badge className="border border-orange-500/20 bg-orange-500/10 text-orange-300">Dispute</Badge>
    }

    if (action === "review") {
        return <Badge className="border border-yellow-500/20 bg-yellow-500/10 text-yellow-300">Review</Badge>
    }

    if (action === "approve") {
        return <Badge className="border border-green-500/20 bg-green-500/10 text-green-300">Approve</Badge>
    }

    return <Badge variant="outline">Pending</Badge>
}

function getFraudScoreClasses(score: number) {
    if (score <= 30) {
        return {
            badge: "border-green-500/20 bg-green-500/10 text-green-300",
            progress: "bg-green-500",
        }
    }

    if (score <= 60) {
        return {
            badge: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
            progress: "bg-yellow-500",
        }
    }

    if (score <= 80) {
        return {
            badge: "border-orange-500/20 bg-orange-500/10 text-orange-300",
            progress: "bg-orange-500",
        }
    }

    return {
        badge: "border-red-500/20 bg-red-500/10 text-red-400",
        progress: "bg-red-500",
    }
}

function getSeverityBadgeClasses(severity: FraudFlag["severity"]): string {
    if (severity === "high") {
        return "border border-red-500/20 bg-red-500/10 text-red-400"
    }

    if (severity === "medium") {
        return "border border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
    }

    return "border border-green-500/20 bg-green-500/10 text-green-300"
}

function formatFlagType(type: string): string {
    return type
        .toLowerCase()
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ")
}

function hasAnalysisResults(invoice: InvoiceDetail): boolean {
    return (
        invoice.fraudScore !== null &&
        (invoice.analyzedAt !== null || invoice.fraudSummary !== null || invoice.fraudFlags.length > 0)
    )
}

function isAnalyzableStatus(status: InvoiceStatus): boolean {
    return ANALYZABLE_STATUSES.includes(status)
}

export default function InvoiceDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const [isDraftOpen, setIsDraftOpen] = useState(false)

    const loadInvoice = useCallback(async () => {
        if (!params.id) {
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/invoices/${params.id}`, { cache: "no-store" })
            const payload = (await response.json().catch(() => ({}))) as InvoiceResponse

            if (!response.ok) {
                if (response.status === 404) {
                    setInvoice(null)
                    setError("Invoice not found")
                    return
                }

                throw new Error(payload.error || payload.message || "Failed to load invoice")
            }

            if (!payload.invoice) {
                throw new Error("Invoice payload is missing")
            }

            setInvoice(payload.invoice)
        } catch (loadError: unknown) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load invoice")
        } finally {
            setIsLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        void loadInvoice()
    }, [loadInvoice])

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

    const analyzedAt = useMemo(() => {
        if (!invoice?.analyzedAt) {
            return "-"
        }

        const date = new Date(invoice.analyzedAt)
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString()
    }, [invoice?.analyzedAt])

    const canAnalyze = invoice ? isAnalyzableStatus(invoice.status) : false
    const analysisVisible = invoice ? hasAnalysisResults(invoice) : false
    const fraudScoreClasses = invoice?.fraudScore !== null && invoice?.fraudScore !== undefined
        ? getFraudScoreClasses(invoice.fraudScore)
        : null

    const handleAnalyzeInvoice = async () => {
        if (!params.id) {
            return
        }

        setIsAnalyzing(true)
        setError(null)

        try {
            const response = await fetch(`/api/invoices/${params.id}/analyze`, {
                method: "POST",
            })
            const payload = (await response.json().catch(() => ({}))) as InvoiceResponse

            if (!response.ok) {
                throw new Error(payload.error || payload.message || "Analysis failed")
            }

            await loadInvoice()
        } catch (analysisError: unknown) {
            const message = analysisError instanceof Error ? analysisError.message : "Analysis failed"
            setError(message)
            toast({
                title: "Analysis failed",
                description: "Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleCopyDraft = async () => {
        if (!invoice?.disputeDraft) {
            return
        }

        try {
            await navigator.clipboard.writeText(invoice.disputeDraft.body)
            toast({
                title: "Dispute draft copied",
                description: "The draft letter has been copied to your clipboard.",
            })
        } catch {
            toast({
                title: "Copy failed",
                description: "Unable to copy the dispute draft right now.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-12 text-center text-slate-400">
                Loading invoice...
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
                <FileText className="h-16 w-16 text-slate-700" />
                <div>
                    <h2 className="mb-2 text-2xl font-bold text-white">Invoice not found</h2>
                    <p className="mb-5 text-slate-400">{error || "This invoice doesn&apos;t exist or has been removed."}</p>
                    <Link href="/dashboard/invoices">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
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
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h2>
                            {getStatusBadge(invoice.status)}
                        </div>
                        <p className="mt-0.5 text-sm text-slate-400">{invoice.vendor} · Uploaded {createdAt}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {invoice.fileUrl && (
                        <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 hover:text-white">
                            <a href={invoice.fileUrl} target="_blank" rel="noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </a>
                        </Button>
                    )}
                    {invoice.disputeDraft && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-slate-300 hover:text-white"
                            onClick={() => setIsDraftOpen(true)}
                        >
                            View Dispute Draft
                        </Button>
                    )}
                    {canAnalyze && (
                        <Button
                            className="bg-sky-600 text-white hover:bg-sky-500"
                            size="sm"
                            onClick={() => void handleAnalyzeInvoice()}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Analyze Invoice
                                </>
                            )}
                        </Button>
                    )}
                    <Button className="bg-sky-600 text-white hover:bg-sky-500" size="sm" onClick={() => setIsDisputeOpen(true)}>
                        Generate Dispute
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Invoice Summary</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Invoice Number</span>
                            <span className="font-mono text-white">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Vendor</span>
                            <span className="text-white">{invoice.vendor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Amount</span>
                            <span className="font-semibold text-white">{formattedAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Current Status</span>
                            <span className="capitalize text-white">{invoice.status}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Audit Pipeline</div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="h-4 w-4 text-violet-300" />
                            <span>Invoice ingested and queued</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Shield className="h-4 w-4 text-cyan-300" />
                            <span>OCR + field extraction stage</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <AlertTriangle className="h-4 w-4 text-orange-300" />
                            <span>Fraud scoring + dispute recommendation</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">File Metadata</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-400">Stored File</span>
                            <span className="break-all text-right text-white">{invoice.fileName || "Uploaded invoice"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Fraud Score</span>
                            <span className="text-white">{invoice.fraudScore !== null ? `${invoice.fraudScore}%` : "Pending"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Analyzed At</span>
                            <span className="text-right text-white">{analyzedAt}</span>
                        </div>
                    </div>
                </div>
            </div>

            {invoice.analysisError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    Last analysis attempt failed: {invoice.analysisError}
                </div>
            )}

            {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {analysisVisible && invoice.fraudScore !== null && fraudScoreClasses && (
                <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">AI Analysis</p>
                            <h3 className="mt-2 text-2xl font-bold text-white">Risk Assessment Results</h3>
                            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                Automated extraction, fraud scoring, and dispute recommendation completed for this invoice.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn("border text-sm", fraudScoreClasses.badge)}>
                                Fraud Score {invoice.fraudScore}%
                            </Badge>
                            {getRiskLevelBadge(invoice.riskLevel)}
                            {getRecommendedActionBadge(invoice.recommendedAction)}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
                            <div className="mb-4 text-xs uppercase tracking-wide text-slate-500">Score Breakdown</div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Risk Index</span>
                                <span className="text-3xl font-bold text-white">{invoice.fraudScore}%</span>
                            </div>
                            <Progress
                                value={invoice.fraudScore}
                                className="mt-4 h-3 bg-white/5"
                            />
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>100</span>
                            </div>
                            <div className={cn("mt-4 rounded-lg px-3 py-2 text-sm", fraudScoreClasses.badge)}>
                                {invoice.riskLevel ? `${invoice.riskLevel.toUpperCase()} risk profile` : "Risk profile pending"}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="text-xs uppercase tracking-wide text-slate-500">Fraud Summary</div>
                                    {getRecommendedActionBadge(invoice.recommendedAction)}
                                </div>
                                <p className="text-sm leading-7 text-slate-300">
                                    {invoice.fraudSummary || "No summary is available for this invoice yet."}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
                                <div className="mb-4 text-xs uppercase tracking-wide text-slate-500">Fraud Flags</div>
                                {invoice.fraudFlags.length === 0 ? (
                                    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-slate-400">
                                        No fraud flags were generated for this invoice.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {invoice.fraudFlags.map((flag, index) => (
                                            <div
                                                key={`${flag.type}-${index}`}
                                                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-white">{formatFlagType(flag.type)}</span>
                                                    <Badge className={getSeverityBadgeClasses(flag.severity)}>
                                                        {flag.severity.toUpperCase()}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-white/10 text-slate-300">
                                                        {flag.affectedField}
                                                    </Badge>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-slate-300">{flag.description}</p>
                                                {flag.chargeAmount !== null && (
                                                    <div className="mt-3 text-xs text-slate-400">
                                                        Potentially affected charge:{" "}
                                                        <span className="font-semibold text-white">
                                                            {new Intl.NumberFormat("en-US", {
                                                                style: "currency",
                                                                currency: invoice.currency || "USD",
                                                            }).format(flag.chargeAmount)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {invoice.disputeDraft && (
                                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-sky-300">Dispute Draft Ready</div>
                                            <p className="mt-2 text-sm text-slate-300">
                                                A formal dispute letter was generated from the flagged charge pattern and extracted invoice evidence.
                                            </p>
                                        </div>
                                        <Button className="bg-sky-600 text-white hover:bg-sky-500" onClick={() => setIsDraftOpen(true)}>
                                            View Dispute Draft
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <GenerateDisputeModal
                isOpen={isDisputeOpen}
                onClose={() => setIsDisputeOpen(false)}
                onGenerate={() => setIsDisputeOpen(false)}
            />

            <Dialog open={isDraftOpen} onOpenChange={setIsDraftOpen}>
                <DialogContent className="max-w-3xl border-white/10 bg-slate-950 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Dispute Draft</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Review the AI-generated dispute letter before sending it to the carrier or port agent.
                        </DialogDescription>
                    </DialogHeader>

                    {invoice.disputeDraft && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500">Subject</div>
                                <div className="mt-2 text-sm font-semibold text-white">{invoice.disputeDraft.subject}</div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500">Letter Body</div>
                                <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                    {invoice.disputeDraft.body}
                                </pre>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-500">Key Points</div>
                                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                    {invoice.disputeDraft.keyPoints.map((keyPoint, index) => (
                                        <li key={`${keyPoint}-${index}`} className="rounded-md bg-white/[0.03] px-3 py-2">
                                            {keyPoint}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white" onClick={() => setIsDraftOpen(false)}>
                            Close
                        </Button>
                        <Button className="bg-sky-600 text-white hover:bg-sky-500" onClick={() => void handleCopyDraft()}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
