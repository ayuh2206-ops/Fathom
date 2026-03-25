"use client"

import { useEffect, useRef, useState } from "react"

interface StatItem {
    value: string
    numericEnd: number
    prefix?: string
    suffix?: string
    label: string
    sublabel: string
}

const stats: StatItem[] = [
    { value: "$2.25M", numericEnd: 2.25, prefix: "$", suffix: "M", label: "Lost/year", sublabel: "per 25-ship fleet" },
    { value: "4–6 hrs", numericEnd: 6, suffix: " hrs", label: "Per audit", sublabel: "(manual)" },
    { value: "85%", numericEnd: 85, suffix: "%", label: "Undetected", sublabel: "fraud" },
]

function useCountUp(end: number, duration: number, shouldStart: boolean) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!shouldStart) return
        let startTime: number | null = null
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            setCount(parseFloat((progress * end).toFixed(2)))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [end, duration, shouldStart])

    return count
}

function AnimatedStat({ stat, shouldStart }: { stat: StatItem; shouldStart: boolean }) {
    const count = useCountUp(stat.numericEnd, 1500, shouldStart)

    let displayValue: string
    if (stat.prefix === "$" && stat.suffix === "M") {
        displayValue = `$${count.toFixed(2)}M`
    } else if (stat.suffix === "%") {
        displayValue = `${Math.round(count)}%`
    } else {
        displayValue = `4–${Math.round(count)} hrs`
    }

    return (
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 flex flex-col gap-1">
            <span className="text-3xl font-bold font-mono text-red-400">{displayValue}</span>
            <span className="text-sm font-semibold text-white">{stat.label}</span>
            <span className="text-xs text-slate-500">{stat.sublabel}</span>
        </div>
    )
}

const fraudLines = [
    { label: "Pilotage (In/Out)", amount: "$2,400", badge: "PHANTOM", badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30", tooltip: "Ship hasn't departed" },
    { label: "Tug Hire 2×4hrs @$600", amount: "$4,800", badge: "INFLATED", badgeColor: "text-red-400 bg-red-500/10 border-red-500/30", tooltip: "AIS shows 2hrs, not 4hrs" },
    { label: "Mooring (Arr+Dep)", amount: "$1,200", badge: "PREMATURE", badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30", tooltip: "No departure yet" },
    { label: "Agency Fee", amount: "$1,500", badge: "+87% TARIFF", badgeColor: "text-red-400 bg-red-500/10 border-red-500/30", tooltip: "87% above tariff max" },
]

export function ProblemSection() {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    const [flagsVisible, setFlagsVisible] = useState<boolean[]>([false, false, false, false])

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true)
                    // Stagger fraud flag animations
                    fraudLines.forEach((_, i) => {
                        setTimeout(() => {
                            setFlagsVisible(prev => {
                                const next = [...prev]
                                next[i] = true
                                return next
                            })
                        }, 800 + i * 600)
                    })
                }
            },
            { threshold: 0.2 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section id="problem" ref={ref} className="py-28 bg-slate-950">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">

                {/* Left Column */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                        <span className="font-mono text-xs tracking-widest text-yellow-500 uppercase">$30 Billion Leaks Annually</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Port agents are bleeding
                        <br />
                        <span className="relative inline-block text-white">
                            your fleet dry.
                            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                                <path d="M2 6 Q75 1 150 5 Q225 9 298 3" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none"
                                    strokeDasharray="300" strokeDashoffset={inView ? 0 : 300}
                                    style={{ transition: "stroke-dashoffset 1.2s ease 0.5s" }} />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                        Every port call, agents inflate invoices with phantom charges, rate manipulation, and billing for services never rendered. Manual auditing catches only 15% of fraud. The rest? Pure leakage — year after year.
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <AnimatedStat key={stat.label} stat={stat} shouldStart={inView} />
                        ))}
                    </div>
                </div>

                {/* Right Column — Animated Invoice */}
                <div className="lg:col-span-2 flex justify-center">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden"
                        style={{ transform: "rotate(-1.5deg)" }}>

                        {/* Invoice Header */}
                        <div className="bg-slate-800/80 px-5 py-4 border-b border-white/10">
                            <div className="text-xs text-slate-500 font-mono mb-1">DISBURSEMENT ACCOUNT</div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-white font-semibold text-sm">Invoice #DA-2024-1247</div>
                                    <div className="text-slate-400 text-xs">Port: Mumbai · Dec 15, 2024</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-500 text-xs">Vessel</div>
                                    <div className="text-white text-xs font-medium">MV Pacific Dawn</div>
                                </div>
                            </div>
                        </div>

                        {/* Line items */}
                        <div className="divide-y divide-white/5">
                            {fraudLines.map((line, i) => (
                                <div key={i} className={`px-5 py-3 flex items-center justify-between gap-2 transition-colors duration-300 ${flagsVisible[i] ? "bg-red-500/5" : ""}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-slate-300 text-xs">{line.label}</div>
                                        {flagsVisible[i] && (
                                            <div
                                                className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${line.badgeColor} animate-pulse`}
                                                title={line.tooltip}
                                            >
                                                ⚠ {line.badge}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-mono text-sm font-semibold shrink-0 ${flagsVisible[i] ? "text-red-400" : "text-white"}`}>
                                        {line.amount}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="px-5 py-4 border-t border-white/10 bg-slate-800/40">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-xs">Invoice Total</span>
                                {inView && (
                                    <span className="font-mono text-sm text-slate-400 line-through">$17,877</span>
                                )}
                            </div>
                            {inView && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-400 text-xs font-semibold">FATHOM Verified</span>
                                    <span className="font-mono text-base font-bold text-green-400">$10,827</span>
                                </div>
                            )}
                        </div>

                        {/* AIS Badge */}
                        <div className="px-5 py-3 bg-slate-950/50 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-slate-400 font-mono">Live AIS Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
