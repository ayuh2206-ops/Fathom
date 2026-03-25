"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, DollarSign } from "lucide-react"

const BILLING_HISTORY = [
    { date: "Jan 1, 2025", amount: "$899.00", status: "Paid", invoice: "INV-B-0024" },
    { date: "Dec 1, 2024", amount: "$899.00", status: "Paid", invoice: "INV-B-0023" },
    { date: "Nov 1, 2024", amount: "$899.00", status: "Paid", invoice: "INV-B-0022" },
    { date: "Oct 1, 2024", amount: "$899.00", status: "Paid", invoice: "INV-B-0021" },
]

export function BillingSettings() {
    return (
        <div className="space-y-5">
            {/* Current Plan */}
            <Card className="bg-slate-900/50 border-sky-500/20 border">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            Navigator Plan
                            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">ACTIVE</Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">Billing monthly · Next charge Jan 1, 2025</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-white">$899</div>
                        <div className="text-slate-500 text-xs">/month</div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Usage meters */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-slate-800/60 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoices</span>
                                <span className="font-mono text-white">412 / 500</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: "82%" }} />
                            </div>
                            <p className="text-xs text-slate-500">82% used · resets in 11 days</p>
                        </div>
                        <div className="rounded-lg bg-slate-800/60 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Vessels</span>
                                <span className="font-mono text-white">15 / 25</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: "60%" }} />
                            </div>
                            <p className="text-xs text-slate-500">60% used</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">Upgrade to Admiral</Button>
                        <Button size="sm" variant="outline" className="border-white/10 text-slate-400 hover:text-white">Cancel Plan</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-sky-400" /> Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-slate-800 border border-white/10 px-3 py-2 text-xs font-mono text-slate-300">VISA •••• 4242</div>
                        <span className="text-slate-500 text-xs">Expires 09/27</span>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 text-slate-400 hover:text-white">Update</Button>
                </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-sky-400" /> Billing History</CardTitle>
                    <CardDescription className="text-slate-400">Download past invoices from FATHOM.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
                                <th className="text-left px-5 py-3 text-slate-500 font-medium">Invoice</th>
                                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                                <th className="text-right px-5 py-3 text-slate-500 font-medium">Amount</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {BILLING_HISTORY.map(row => (
                                <tr key={row.invoice} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3 text-slate-300">{row.date}</td>
                                    <td className="px-5 py-3 font-mono text-slate-400 text-xs">{row.invoice}</td>
                                    <td className="px-5 py-3">
                                        <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px]">
                                            <Check className="h-2.5 w-2.5 mr-1" />{row.status}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono text-white">{row.amount}</td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="text-xs text-sky-400 hover:text-sky-300">PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
