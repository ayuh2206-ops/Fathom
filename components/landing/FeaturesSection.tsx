"use client"

import { Satellite, Globe, FileSearch, Gavel, BarChart3, Plug } from "lucide-react"

const features = [
    {
        icon: Satellite,
        iconColor: "text-sky-400",
        iconBg: "bg-sky-500/10",
        badge: "99.8% ACCURACY",
        badgeColor: "text-green-400",
        title: "Real-Time Satellite Tracking",
        desc: "Every port call verified against Spire Maritime's live satellite AIS. Tug engagement, pilot boarding, berth times — all captured to the second.",
    },
    {
        icon: Globe,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10",
        badge: "2,000+ PORTS",
        badgeColor: "text-sky-400",
        title: "Live Tariff Intelligence",
        desc: "Mumbai to Rotterdam. Published rate schedules for 2,000+ ports, updated monthly. We know the max a port agent can legally charge.",
    },
    {
        icon: FileSearch,
        iconColor: "text-yellow-400",
        iconBg: "bg-yellow-500/10",
        badge: "99.2% EXTRACTION",
        badgeColor: "text-yellow-400",
        title: "Maritime-Grade OCR",
        desc: "GPT-4V fine-tuned on 50,000+ port disbursement invoices. Reads any format — PDF, scanned, handwritten, 12 languages.",
    },
    {
        icon: Gavel,
        iconColor: "text-orange-400",
        iconBg: "bg-orange-500/10",
        badge: "87% WIN RATE",
        badgeColor: "text-orange-400",
        title: "Evidence-Backed Disputes",
        desc: "Generate a legal-grade dispute letter with one click. AIS track maps, tariff excerpts, historical comps — all attached.",
    },
    {
        icon: BarChart3,
        iconColor: "text-green-400",
        iconBg: "bg-green-500/10",
        badge: "10× FASTER",
        badgeColor: "text-green-400",
        title: "Fleet-Wide Risk Intelligence",
        desc: "Live dashboard surfaces your highest-risk ports, agents, and vessels. Spot systematic fraud before it compounds.",
    },
    {
        icon: Plug,
        iconColor: "text-slate-400",
        iconBg: "bg-slate-500/10",
        badge: "5-MIN SETUP",
        badgeColor: "text-slate-400",
        title: "Plugs Into Your Workflow",
        desc: "SAP, QuickBooks, Oracle, Slack, Google Drive. Email forwarding requires zero technical setup. API available for custom workflows.",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-28 bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16 space-y-3">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Built for maritime.
                        <br />
                        <span className="text-sky-400">Powered by satellites.</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Every feature purpose-built for port disbursement fraud detection.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feat) => (
                        <div
                            key={feat.title}
                            className="group rounded-xl border border-white/10 bg-slate-900/50 p-6 space-y-4 hover:border-sky-500/30 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-200 cursor-default"
                        >
                            {/* Icon + badge */}
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-lg ${feat.iconBg}`}>
                                    <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                                </div>
                                <span className={`font-mono text-xs font-bold ${feat.badgeColor}`}>{feat.badge}</span>
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="text-base font-semibold text-white mb-1">{feat.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
