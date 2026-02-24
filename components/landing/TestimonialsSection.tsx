"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
    {
        quote: "FATHOM found $87,000 in overcharges in our first month. The AIS verification is bulletproof — agents can't dispute satellite data.",
        name: "Rajesh Kumar",
        role: "Fleet Manager",
        company: "Pacific Shipping Co",
        vessels: "25 vessels",
        recovery: "$87,000 recovered · first month",
    },
    {
        quote: "Our port disbursement spend dropped 18% in 90 days. The dispute win rate is extraordinary — 94% so far.",
        name: "Sarah Chen",
        role: "VP Operations",
        company: "OceanFreight Ltd",
        vessels: "15 vessels",
        recovery: "$142,000 recovered · first quarter",
    },
    {
        quote: "I was skeptical. Then it found $23,000 in phantom charges on a single invoice. The ROI is 300x. This is a no-brainer.",
        name: "Lars Eriksson",
        role: "CFO",
        company: "Nordic Carriers",
        vessels: "42 vessels",
        recovery: "$203,000 recovered",
    },
    {
        quote: "Setup took 20 minutes. We forwarded our first invoice that evening. By morning, we had three disputes ready to send.",
        name: "Patricia Voss",
        role: "Port Operations Director",
        company: "Global Shipping Inc",
        vessels: "8 vessels",
        recovery: "$61,000 recovered",
    },
    {
        quote: "The tariff database alone is worth the subscription. I had no idea how to verify agent rates before FATHOM.",
        name: "Omar Khalil",
        role: "Maritime Controller",
        company: "AsiaPac Lines",
        vessels: "18 vessels",
        recovery: "$94,000 recovered",
    },
    {
        quote: "We process 400 invoices a month. FATHOM handles all of them. It's like having 10 expert auditors working 24/7.",
        name: "Mei Lin",
        role: "Group Finance Director",
        company: "TransAtlantic Corp",
        vessels: "60 vessels",
        recovery: "$318,000 recovered",
    },
]

const stats = [
    { value: "$847K", label: "Recovered in beta" },
    { value: "329×", label: "Average ROI" },
    { value: "4.2 days", label: "Avg dispute resolution" },
]

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export function TestimonialsSection() {
    const [startIndex, setStartIndex] = useState(0)
    const visible = 3

    const prev = () => setStartIndex(Math.max(0, startIndex - 1))
    const next = () => setStartIndex(Math.min(testimonials.length - visible, startIndex + 1))

    const visibleItems = testimonials.slice(startIndex, startIndex + visible)

    return (
        <section id="testimonials" className="py-28 bg-slate-900/30">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12 space-y-2">
                    <h2 className="text-4xl font-bold text-white">
                        $847,230 recovered by fleet operators in beta.
                    </h2>
                    <p className="text-slate-400">Real results from real operators.</p>
                </div>

                {/* Carousel */}
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {visibleItems.map((t) => (
                            <div
                                key={t.name}
                                className="rounded-xl border border-white/10 bg-slate-900 p-6 flex flex-col gap-4 border-l-4 border-l-sky-500"
                            >
                                <p className="text-slate-300 text-sm leading-relaxed italic flex-1">
                                    &ldquo;{t.quote}&rdquo;
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-sky-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                        {getInitials(t.name)}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">{t.name}</div>
                                        <div className="text-slate-500 text-xs">{t.role} · <span className="text-sky-400">{t.company}</span></div>
                                        <div className="text-slate-500 text-xs">🚢 {t.vessels}</div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-3 py-2">
                                    <span className="font-mono text-xs text-yellow-400 font-semibold">{t.recovery}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Nav buttons */}
                    <div className="flex justify-center gap-3 mt-8">
                        <button
                            onClick={prev}
                            disabled={startIndex === 0}
                            className="p-2 rounded-full border border-white/10 text-slate-400 hover:border-sky-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStartIndex(Math.min(i, testimonials.length - visible))}
                                className={`h-2 w-2 rounded-full transition-colors ${i >= startIndex && i < startIndex + visible ? "bg-sky-400" : "bg-slate-600"}`}
                            />
                        ))}
                        <button
                            onClick={next}
                            disabled={startIndex >= testimonials.length - visible}
                            className="p-2 rounded-full border border-white/10 text-slate-400 hover:border-sky-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="mt-14 grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                    {stats.map((stat) => (
                        <div key={stat.label} className="px-6 py-6 text-center">
                            <div className="font-mono text-3xl font-bold text-sky-400">{stat.value}</div>
                            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
