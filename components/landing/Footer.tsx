"use client"

import Link from "next/link"
import { Anchor } from "lucide-react"

const cols = [
    {
        header: "PRODUCT",
        links: ["Features", "Pricing", "How It Works", "Case Studies", "API Docs", "Changelog"],
    },
    {
        header: "COMPANY",
        links: ["About", "Blog", "Careers", "Press Kit", "Investors", "Contact"],
    },
    {
        header: "LEGAL",
        links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Security", "GDPR", "SOC 2"],
    },
    {
        header: "RESOURCES",
        links: ["Documentation", "API Reference", "Maritime Glossary", "Port Tariff Database", "Industry Reports", "Webinars"],
    },
]

export function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-white">
                            <div className="bg-sky-600 rounded-lg p-1.5">
                                <Anchor className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-widest">FATHOM</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Navigate port costs with sonar precision.
                        </p>
                        <div className="flex items-center gap-3">
                            {["LinkedIn", "Twitter", "GitHub"].map((s) => (
                                <a
                                    key={s}
                                    href="#"
                                    className="text-slate-600 hover:text-sky-400 text-xs transition-colors"
                                >
                                    {s}
                                </a>
                            ))}
                        </div>
                        <p className="text-slate-600 text-xs">© 2025 FATHOM. All rights reserved.</p>
                    </div>

                    {/* Link columns */}
                    {cols.map((col) => (
                        <div key={col.header} className="space-y-3">
                            <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{col.header}</h4>
                            <ul className="space-y-2">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-slate-600 text-xs">
                        Built for the 60,000+ vessels of the global merchant fleet.
                    </p>
                    <p className="text-slate-600 text-xs">
                        Built by Antariksh &amp; Ayush 🇮🇳 · v2.0
                    </p>
                </div>
            </div>
        </footer>
    )
}
