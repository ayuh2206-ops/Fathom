"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
    {
        q: "How does the 7-day free trial work?",
        a: "Upload your first invoice and we'll process it completely free. No credit card required. At the end of 7 days, choose a plan or your account pauses. All your data is retained for 30 days.",
    },
    {
        q: "How accurate is AIS verification?",
        a: "Spire Maritime provides satellite AIS updates every 5–30 seconds. For tug hire verification, we achieve 98%+ confidence on clearly defined time-based charges. Complex cases get Medium or Low confidence flags for your human review.",
    },
    {
        q: "What if an agent disputes the AIS data?",
        a: "Satellite AIS data is third-party, independent evidence. Agents cannot alter it. In our beta, 94% of disputes were resolved in your favor — agents typically concede when presented with satellite timestamps.",
    },
    {
        q: "Do I need to install anything?",
        a: "No installation required. Forward invoices to your unique FATHOM email address or use our web uploader. For advanced workflows, we offer a REST API and integrations with SAP, QuickBooks, and Slack.",
    },
    {
        q: "How long does processing take?",
        a: "Average invoice processing time is 90 seconds. OCR extraction: 30s. AIS query and verification: 40s. Fraud analysis and report: 20s. Complex multi-page invoices may take up to 3 minutes.",
    },
    {
        q: "What ports are covered?",
        a: "Our tariff database covers 2,000+ ports worldwide, with particular depth in major maritime hubs: Singapore, Rotterdam, Shanghai, Houston, Mumbai, Dubai, Santos, Hamburg. We add 50+ ports monthly.",
    },
    {
        q: "Can I dispute multiple line items at once?",
        a: "Yes. FATHOM generates a single comprehensive dispute letter covering all flagged items per invoice. You can also adjust which items to include before sending, and choose to handle low-confidence flags manually.",
    },
    {
        q: "Is my invoice data secure?",
        a: "FATHOM is SOC 2 Type II certified. Invoice data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never share data between customer accounts. Port agent names are anonymized in our aggregate benchmarks.",
    },
    {
        q: "What happens if an agent doesn't respond?",
        a: "FATHOM tracks delivery and opens. We send automated follow-ups at 3 days and 7 days. At 14 days with no response, we recommend paying only the verified amount and flag the agent as high-risk in your account.",
    },
    {
        q: "Do you offer refunds?",
        a: "We offer a 30-day money-back guarantee on all paid plans. If FATHOM doesn't recover at least 10× your subscription cost in the first 60 days, we'll extend your trial at no charge until it does.",
    },
]

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(!open)}
            >
                <span className="text-base font-semibold text-white">{q}</span>
                <ChevronDown
                    className={cn("h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200", open && "rotate-180")}
                />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300",
                    open ? "max-h-64 pb-5 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    )
}

export function FaqSection() {
    return (
        <section id="faq" className="py-28 bg-slate-900/30">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12 space-y-2">
                    <h2 className="text-4xl font-bold text-white">Common questions.</h2>
                    <p className="text-slate-400">Everything you need to know about FATHOM.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 divide-y divide-transparent px-6">
                    {faqs.map((faq) => (
                        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    )
}
