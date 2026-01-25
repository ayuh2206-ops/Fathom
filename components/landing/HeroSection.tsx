"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ShipScene } from "./ShipScene"

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-ocean/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-ocean"></span>
                        </span>
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">
                            Live Fleet Tracking Active
                        </span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight font-serif">
                        Stop Shipping <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-light via-ocean to-ocean-dark">
                            Fraud
                        </span> Forever.
                    </h1>

                    <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
                        Detect phantom charges, time inflation, and route deviations in real-time.
                        FATHOM uses advanced satellite tracking to recover lost revenue from your supply chain.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="bg-ocean hover:bg-ocean-dark text-white h-12 px-8 text-base">
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 h-12 px-8 text-base">
                            View Live Demo
                        </Button>
                    </div>

                    <div className="mt-12 flex items-center gap-8 text-slate-500 text-sm">
                        <div>
                            <strong className="block text-white text-xl font-bold">$840M+</strong>
                            Recovered
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <strong className="block text-white text-xl font-bold">12k+</strong>
                            Vessels Tracked
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <strong className="block text-white text-xl font-bold">99.9%</strong>
                            Accuracy
                        </div>
                    </div>
                </div>

                {/* 3D Scene */}
                <div className="h-[600px] w-full rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                    <ShipScene />
                </div>
            </div>
        </section>
    )
}
