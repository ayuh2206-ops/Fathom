"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
    {
        name: "Starter",
        monthly: 299,
        annual: 239,
        tagline: "For operators evaluating FATHOM",
        vessels: "5 vessels",
        invoices: "100 invoices / month",
        features: [
            "Core OCR extraction",
            "Basic tariff verification (500 ports)",
            "Fraud flagging",
            "Email support",
            "7-day data retention",
            "7-day free trial",
        ],
        cta: "Start Free Trial",
        ctaStyle: "border border-white/20 text-white hover:bg-white/5",
        card: "border-white/10 bg-slate-900/50",
        roi: "~$18K saved / vessel / year",
    },
    {
        name: "Navigator",
        monthly: 899,
        annual: 719,
        tagline: "For operators scaling their audits",
        vessels: "25 vessels",
        invoices: "500 invoices / month",
        badge: "MOST POPULAR",
        features: [
            "Advanced AI + AIS verification",
            "Full tariff database (2,000+ ports)",
            "ML anomaly detection",
            "Automated dispute generation",
            "Custom analytics reports",
            "Priority support (4hr response)",
            "90-day data retention",
            "API access (50K calls/month)",
            "7-day free trial",
        ],
        cta: "Start Free Trial →",
        ctaStyle: "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20",
        card: "border-sky-500/40 bg-slate-900 ring-2 ring-sky-500/20 scale-105",
        roi: "$3.55M recovered / fleet / year · 329× ROI",
        roiColor: "text-sky-400",
        recommended: true,
    },
    {
        name: "Admiral",
        monthly: null,
        annual: null,
        tagline: "Contact us for a tailored quote",
        vessels: "Unlimited vessels",
        invoices: "Unlimited invoices",
        features: [
            "White-label option",
            "Dedicated success manager",
            "SLA guarantee (99.9% uptime)",
            "Custom integrations (SAP, Oracle)",
            "Onboarding + training",
            "API unlimited",
            "Data warehouse export",
            "Multi-entity / group accounts",
        ],
        cta: "Contact Sales →",
        ctaStyle: "border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/5",
        card: "border-yellow-500/20 bg-slate-900/50",
        roi: "Usually responds within 1 business day",
        roiColor: "text-slate-500",
        enterprise: true,
    },
]

export function PricingSection() {
    const [annual, setAnnual] = useState(false)

    return (
        <section id="pricing" className="py-28 bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-1 h-4 bg-sky-500 rounded-full" />
                        <span className="font-mono text-xs tracking-widest text-sky-400 uppercase">Pricing</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white">Pays for itself on the first invoice.</h2>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-sky-600" : "bg-slate-700"}`}
                        >
                            <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-6" : ""}`} />
                        </button>
                        <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-500"}`}>
                            Annual <span className="text-green-400 font-semibold">— Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-2xl border p-7 flex flex-col gap-5 transition-all duration-200 ${plan.card}`}
                        >
                            {/* Header */}
                            <div>
                                {plan.badge && (
                                    <span className="text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full mb-3 inline-block">
                                        {plan.badge}
                                    </span>
                                )}
                                {plan.enterprise && (
                                    <span className="text-xs font-bold bg-yellow-500/5 text-yellow-600 border border-yellow-500/10 px-2 py-0.5 rounded-full mb-3 inline-block">
                                        ENTERPRISE
                                    </span>
                                )}
                                <div className={`text-lg font-bold ${plan.recommended ? "text-sky-300" : plan.enterprise ? "text-yellow-400" : "text-slate-300"}`}>
                                    {plan.name}
                                </div>
                                <div className="mt-2">
                                    {plan.monthly ? (
                                        <>
                                            <span className="font-mono text-4xl font-bold text-white">
                                                ${annual ? plan.annual : plan.monthly}
                                            </span>
                                            <span className="text-slate-500 text-sm">/mo</span>
                                            {annual && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    ${(plan.annual! * 12).toLocaleString()}/year
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className={`font-mono text-3xl font-bold ${plan.enterprise ? "text-yellow-400" : "text-white"}`}>
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs mt-1">{plan.tagline}</p>
                            </div>

                            <hr className="border-white/10" />

                            {/* Features */}
                            <ul className="space-y-2 flex-1">
                                <li className="flex items-center gap-2 text-sm text-white font-medium">
                                    <Check className="h-4 w-4 text-sky-400 shrink-0" />
                                    {plan.vessels}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-white font-medium">
                                    <Check className="h-4 w-4 text-sky-400 shrink-0" />
                                    {plan.invoices}
                                </li>
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                                        <Check className="h-4 w-4 text-sky-400/60 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href="/register"
                                className={`block text-center rounded-lg px-5 py-3 text-sm font-semibold transition-all ${plan.ctaStyle}`}
                            >
                                {plan.cta}
                            </Link>

                            {/* ROI note */}
                            <p className={`text-xs text-center ${plan.roiColor ?? "text-slate-500"}`}>
                                {plan.roi}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
