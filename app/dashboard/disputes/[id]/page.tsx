"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Send, PenTool, Printer, Download } from "lucide-react"
import Link from "next/link"

export default function DisputeDetailPage() {
    const params = useParams()

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/disputes">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            Dispute #{params.id}
                            <Badge variant="outline" className="text-slate-400 border-slate-500/20">Draft</Badge>
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>Invoice: <strong className="text-white">INV-2023-899</strong></span>
                            <span>Carrier: <strong className="text-white">Maersk Line</strong></span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <PenTool className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark">
                        <Send className="h-4 w-4 mr-2" />
                        Send to Carrier
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Letter Preview */}
                <Card className="lg:col-span-2 bg-white text-slate-900 border-none shadow-2xl overflow-hidden min-h-[800px] relative">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="bg-slate-100 p-2 rounded text-slate-400 cursor-pointer hover:text-slate-600 transistion-colors">
                            <Printer className="h-5 w-5" />
                        </div>
                    </div>
                    <CardContent className="p-16 font-serif leading-relaxed text-sm">
                        {/* Letterhead */}
                        <div className="border-b-2 border-slate-900 pb-8 mb-12 flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold tracking-widest uppercase">Pacific Shipping Co.</h1>
                                <p className="text-xs text-slate-500 mt-1">123 Maritime Way, Suite 400<br />San Francisco, CA 94105</p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                                <p>Tel: +1 (555) 012-3456</p>
                                <p>Ref: {params.id}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="space-y-6">
                            <p>{currentDate}</p>

                            <div>
                                <p className="font-bold">Claims Department</p>
                                <p>Maersk Line</p>
                                <p>50 Esplanaden</p>
                                <p>DK-1098 Copenhagen K, Denmark</p>
                            </div>

                            <p className="mt-8 font-bold text-base decoration-1 underline underline-offset-4">
                                RE: Formal Dispute of Invoice #INV-2023-899 - Detention Charges
                            </p>

                            <p>Dear Claims Adjuster,</p>

                            <p>
                                We write to formally dispute line item #4 regarding "Detention Charges" in the amount of $1,200.00 appearing on the captioned invoice.
                            </p>

                            <p>
                                According to our records and independent AIS tracking data, the container associated with this charge (CNTR-998877) was returned to the designated terminal on Jan 18, 2024 at 14:30 UTC. This return occurred within the agreed-upon 48-hour free time period following discharge.
                            </p>

                            <div className="bg-slate-50 p-4 border-l-4 border-slate-300 my-6 italic text-slate-600 text-xs">
                                "Free time shall commence 00:00 on the day following discharge and extend for 48 hours." — Service Contract Clause 14.2
                            </div>

                            <p>
                                Consequently, the application of detention fees for 5 days is factually incorrect and inconsistent with our service agreement.
                            </p>

                            <p>
                                We have attached the Terminal Interchange Receipt (TIR) and AIS positional logs as evidence of the timely return. We request that you issue a credit note for the full disputed amount of $1,200.00 immediately.
                            </p>

                            <p>
                                Pending resolution of this specific item, we have processed payment for the undisputed portion of the invoice ($5,050.00).
                            </p>

                            <p>
                                Sincerely,
                            </p>

                            <div className="mt-12">
                                <p className="font-bold">John Doe</p>
                                <p>Logistics Manager</p>
                                <p>Pacific Shipping Co.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Actions / Activity */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <Card className="bg-slate-900 border-white/10">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Current Status</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                                <span className="text-white font-medium">Drafting</span>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Created</span>
                                    <span className="text-white">Jan 25, 2024</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="text-white font-mono">$1,200.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Carrier</span>
                                    <span className="text-white">Maersk Line</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attachments */}
                    <Card className="bg-slate-900 border-white/10">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Evidence Attached</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5">
                                    <div className="h-8 w-8 bg-red-500/20 text-red-400 rounded flex items-center justify-center text-xs font-bold">PDF</div>
                                    <div className="text-sm overflow-hidden">
                                        <p className="text-white truncate">Invoice_INV-2023-899.pdf</p>
                                        <p className="text-xs text-slate-500">2.4 MB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/5">
                                    <div className="h-8 w-8 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center text-xs font-bold">CSV</div>
                                    <div className="text-sm overflow-hidden">
                                        <p className="text-white truncate">AIS_Log_CNTR-998877.csv</p>
                                        <p className="text-xs text-slate-500">145 KB</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2 border-white/10 text-slate-400 hover:text-white hover:bg-white/5">
                                    + Add Evidence
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
