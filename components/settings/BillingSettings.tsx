"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"
import { RazorpayCheckout } from "@/components/billing/RazorpayCheckout"
import { format } from "date-fns"

export function BillingSettings() {
    const { data: session } = useSession()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [org, setOrg] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!session?.user?.organizationId || !db) return

        const docRef = doc(db, "organizations", session.user.organizationId)
        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setOrg(snap.data())
            }
            setLoading(false)
        })

        return () => unsub()
    }, [session?.user?.organizationId])

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? It will remain active until the end of your billing cycle.")) return

        try {
            const res = await fetch('/api/billing/cancel', { method: 'POST' })
            if (!res.ok) throw new Error("Failed to cancel")
            alert("Subscription cancelled successfully.")
        } catch (error) {
            console.error(error)
            alert("Error cancelling subscription.")
        }
    }

    if (loading) {
        return <div className="text-slate-400 p-4">Loading billing details...</div>
    }

    // Default fallbacks
    const plan = org?.subscriptionPlan || 'trial'
    const status = org?.subscriptionStatus || 'active'
    const limit = org?.invoiceLimit || 5
    const used = org?.invoicesThisMonth || 0
    const usagePercent = Math.min((used / limit) * 100, 100)
    const nextCharge = org?.currentPeriodEnd ? format(new Date(org.currentPeriodEnd), 'MMM d, yyyy') : 'N/A'

    const PLAN_NAMES: Record<string, string> = { trial: 'Trial', scout: 'Scout', navigator: 'Navigator', admiral: 'Admiral' }
    const displayPlanName = PLAN_NAMES[plan] || 'Unknown'

    return (
        <div className="space-y-5">
            {/* Current Plan */}
            <Card className="bg-slate-900/50 border-sky-500/20 border">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            {displayPlanName} Plan
                            <Badge className={`text-[10px] ${status === 'active' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                                {status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Billing monthly · {status === 'cancelled' ? `Ends on ${nextCharge}` : `Next charge ${nextCharge}`}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Usage meters */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-slate-800/60 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoices</span>
                                <span className="font-mono text-white">{used} / {limit === Infinity ? '∞' : limit}</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${usagePercent}%` }} />
                            </div>
                            <p className="text-xs text-slate-500">{usagePercent.toFixed(0)}% used</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                        {plan !== 'admiral' && (
                            <RazorpayCheckout 
                                planId="admiral" 
                                planName="Admiral" 
                                amountDisplay="₹66,500/mo" 
                                userEmail={session?.user?.email || ''} 
                                userName={session?.user?.name || ''} 
                            />
                        )}
                        {plan !== 'navigator' && plan !== 'admiral' && (
                            <RazorpayCheckout 
                                planId="navigator" 
                                planName="Navigator" 
                                amountDisplay="₹24,900/mo" 
                                userEmail={session?.user?.email || ''} 
                                userName={session?.user?.name || ''} 
                            />
                        )}
                        {plan === 'trial' && (
                            <RazorpayCheckout 
                                planId="scout" 
                                planName="Scout" 
                                amountDisplay="₹8,200/mo" 
                                userEmail={session?.user?.email || ''} 
                                userName={session?.user?.name || ''} 
                            />
                        )}
                        
                        {plan !== 'trial' && status === 'active' && (
                            <Button size="sm" variant="outline" onClick={handleCancel} className="border-white/10 text-slate-400 hover:text-white bg-transparent">
                                Cancel Subscription
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method instructions */}
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2"><CreditCard className="h-4 w-4 text-sky-400" /> Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400 mb-4">Payment methods are managed securely via Razorpay during checkout.</p>
                </CardContent>
            </Card>
        </div>
    )
}
