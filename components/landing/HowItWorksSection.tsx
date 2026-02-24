"use client"

import { FileText, Satellite, ShieldCheck, ChevronRight } from "lucide-react"

const steps = [
    {
        num: "01",
        icon: FileText,
        iconColor: "text-sky-400",
        iconBg: "bg-sky-500/10",
        title: "Ingest Invoice",
        desc: "Forward to FATHOM via email, drag-and-drop, or API integration.",
        bullets: [
            "GPT-4V OCR extracts all line items, rates, quantities",
            "Handles PDFs, scanned images, Excel, multi-page documents",
            "99.2% extraction accuracy — fine-tuned on 50,000+ maritime invoices",
        ],
    },
    {
        num: "02",
        icon: Satellite,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10",
        title: "Verify Against Truth",
        desc: "Every claim cross-referenced against satellite reality, tariff law, and history.",
        bullets: [
            "Spire satellite tracks every tug movement, pilot boarding, berth time",
            "2,000+ port tariff schedules. Live rates. Fraud has nowhere to hide",
            "Anomaly detection trained on 500K invoices flags statistical outliers",
        ],
        sources: [
            { label: "🛰️ AIS Data", desc: "Real-time satellite positioning" },
            { label: "📋 Tariff DB", desc: "2,000+ port rate schedules" },
            { label: "🧠 ML Models", desc: "Statistical anomaly detection" },
        ],
    },
    {
        num: "03",
        icon: ShieldCheck,
        iconColor: "text-green-400",
        iconBg: "bg-green-500/10",
        title: "Recover Overcharges",
        desc: "Disputes generated with evidence packages. Resolved in 4.2 days average.",
        bullets: [
            "Legal-grade dispute letters with AIS maps and tariff citations",
            "Agent acknowledgment tracked, responses logged",
            "87% recovery rate on disputed amounts",
        ],
    },
]

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-28 bg-slate-900/30">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-1 h-4 bg-sky-500 rounded-full" />
                        <span className="font-mono text-xs tracking-widest text-sky-400 uppercase">The Truth Engine</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white">Fraud exposed in 90 seconds.</h2>
                    <p className="text-slate-400 text-xl max-w-lg mx-auto">Three data sources. One verdict.</p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {steps.map((step, i) => (
                        <div key={step.num} className="relative flex flex-col gap-6">
                            {/* Connector arrow */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:flex absolute top-10 -right-3 z-10 items-center">
                                    <ChevronRight className="h-6 w-6 text-sky-500/50" />
                                </div>
                            )}

                            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4 h-full">
                                {/* Step number + icon */}
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs text-sky-400">{step.num}</span>
                                    <div className={`p-3 rounded-lg ${step.iconBg}`}>
                                        <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                                </div>

                                {/* Sources (step 2 only) */}
                                {step.sources && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {step.sources.map((s) => (
                                            <div key={s.label} className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                                                <span className="text-sm">{s.label}</span>
                                                <span className="text-xs text-slate-500">{s.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Bullets */}
                                <ul className="space-y-1.5">
                                    {step.bullets.map((b) => (
                                        <li key={b} className="flex items-start gap-2 text-xs text-slate-400">
                                            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA below */}
                <div className="text-center mt-14">
                    <a
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-7 py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-sky-600/20"
                    >
                        See a live demo
                        <ChevronRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    )
}
