"use client"

import Link from "next/link"
import { Lock, CreditCard, Zap, X } from "lucide-react"

export function CtaSection() {
    return (
        <section id="register" className="py-28 bg-slate-950 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(14,165,233,0.08),transparent)]" />

            <div className="relative max-w-xl mx-auto px-6 text-center space-y-8">
                <div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Start recovering overcharges today.
                    </h2>
                    <p className="text-slate-400 text-lg mt-3">No credit card required.</p>
                </div>

                {/* CTA Card */}
                <div className="rounded-2xl border border-sky-500/30 bg-slate-900 p-8 shadow-2xl shadow-sky-900/20 space-y-6 text-left">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="col-span-1 h-11 px-4 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                            />
                            <input
                                type="email"
                                placeholder="Work Email"
                                className="col-span-1 h-11 px-4 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Company Name"
                                className="col-span-1 h-11 px-4 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                            />
                            <input
                                type="number"
                                placeholder="Number of Vessels"
                                className="col-span-1 h-11 px-4 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                            />
                        </div>
                    </div>

                    {/* Plan selector */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Choose your plan</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["Starter — $299/mo", "Navigator — $899/mo", "Admiral — Custom"].map((plan, i) => (
                                <label key={plan} className={`cursor-pointer rounded-lg border p-3 text-center text-xs font-medium transition-colors ${i === 1 ? "border-sky-500/60 bg-sky-500/10 text-sky-300" : "border-white/10 bg-slate-800 text-slate-400 hover:border-white/20"}`}>
                                    <input type="radio" name="plan" className="hidden" defaultChecked={i === 1} />
                                    {plan.split("—")[0].trim()}
                                    <div className="text-slate-500 font-normal mt-0.5">{plan.split("—")[1]?.trim()}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/register"
                        className="block w-full text-center rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-sky-600/20"
                    >
                        Start 7-Day Free Trial →
                    </Link>

                    <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Secure</span>
                        <span className="flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> No credit card</span>
                        <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> 5-min setup</span>
                        <span className="flex items-center gap-1.5"><X className="h-3 w-3" /> Cancel anytime</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
