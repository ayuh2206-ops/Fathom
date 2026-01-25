"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Download, AlertTriangle, FileText, X } from "lucide-react"
import Link from "next/link"

export default function InvoiceDetailPage() {
    const params = useParams()

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            Invoice #INV-2024-{params.id}
                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                            </Badge>
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>Vendor: <strong className="text-white">Maersk Line</strong></span>
                            <span>Date: <strong className="text-white">Jan 20, 2024</strong></span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700">
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                    </Button>
                </div>
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">

                {/* Left: Original Document Viewer (Mock) */}
                <Card className="bg-slate-900 border-white/10 flex flex-col overflow-hidden h-full">
                    <CardHeader className="py-3 px-4 border-b border-white/10 bg-slate-950/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Original Document
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400">
                            <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                    </CardHeader>
                    <div className="flex-1 bg-slate-800 p-8 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 pattern-grid-lg opacity-5"></div>
                        {/* Mock PDF Representation */}
                        <div className="w-[80%] h-[90%] bg-white shadow-2xl rounded-sm p-8 text-slate-900 text-xs overflow-y-auto font-mono opacity-90 relative">
                            {/* Red Overlays for Fraud Detection */}
                            <div className="absolute top-[35%] right-[10%] w-[30%] h-[20px] bg-red-500/30 border border-red-500 rounded cursor-help" title="Anomaly Detected"></div>

                            <div className="flex justify-between border-b pb-4 mb-4">
                                <h1 className="text-xl font-bold">INVOICE</h1>
                                <div className="text-right">
                                    <p className="font-bold">Maersk Line</p>
                                    <p>Copenhagen, Denmark</p>
                                </div>
                            </div>
                            <div className="mb-8">
                                <p><strong>Bill To:</strong> Pacific Shipping Co.</p>
                                <p><strong>Date:</strong> Jan 20, 2024</p>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Description</th>
                                        <th className="py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2">Ocean Freight - 40HQ - CNSHA to NLRTM</td>
                                        <td className="py-2 text-right">$4,500.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Terminal Handling Charge (Origin)</td>
                                        <td className="py-2 text-right">$250.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Terminal Handling Charge (Dest)</td>
                                        <td className="py-2 text-right">$250.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 relative">
                                            Detention Charge (5 Days)
                                            {/* Highlight */}
                                        </td>
                                        <td className="py-2 text-right relative font-bold text-red-600">
                                            $1,200.00
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Documentation Fee</td>
                                        <td className="py-2 text-right">$50.00</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="border-t font-bold">
                                        <td className="py-4">Total</td>
                                        <td className="py-4 text-right">$6,250.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* Right: Analysis & Evidence */}
                <Card className="bg-slate-900 border-white/10 flex flex-col h-full overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b border-white/10 bg-slate-950/50">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" /> Fraud Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        <div className="p-6 space-y-6">

                            {/* Alert Card 1 */}
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-400 text-sm">Suspicious Detention Charge</h4>
                                        <p className="text-slate-300 text-sm mt-1">
                                            The invoice includes detention charges for 5 days ($1,200), but AIS tracking shows the container was returned within the free time period (2 days).
                                        </p>
                                        <div className="mt-3 bg-slate-950 rounded p-2 text-xs font-mono text-slate-400 border border-white/5">
                                            Evidence: AIS Position Log #99238 vs Invoice Line #4
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Card 2 */}
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-400 text-sm">Rate Discrepancy</h4>
                                        <p className="text-slate-300 text-sm mt-1">
                                            Ocean Freight rate ($4,500) is 12% higher than the agreed contract rate ($4,000).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Extracted Data Summary */}
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-medium text-white mb-3 text-sm">Extracted Line Items</h4>
                                <div className="space-y-2">
                                    {[
                                        { desc: "Ocean Freight", amount: "$4,500.00", status: "warning" },
                                        { desc: "THC Origin", amount: "$250.00", status: "ok" },
                                        { desc: "THC Dest", amount: "$250.00", status: "ok" },
                                        { desc: "Detention Charge", amount: "$1,200.00", status: "error" },
                                        { desc: "Doc Fee", amount: "$50.00", status: "ok" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm p-2 rounded hover:bg-white/5">
                                            <span className="text-slate-400">{item.desc}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono">{item.amount}</span>
                                                {item.status === 'error' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                                                {item.status === 'warning' && <div className="h-2 w-2 rounded-full bg-yellow-500" />}
                                                {item.status === 'ok' && <div className="h-2 w-2 rounded-full bg-green-500 opacity-50" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
