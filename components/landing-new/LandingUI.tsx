/* eslint-disable @typescript-eslint/no-explicit-any, react/jsx-no-comment-textnodes */
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export const FadeIn = ({ children, delay = 0, direction = "up", className = "", fullWidth = false }: { children: React.ReactNode, delay?: number, direction?: string, className?: string, fullWidth?: boolean }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const getTransform = () => {
        if (isVisible) return "translate-x-0 translate-y-0";
        if (direction === "up") return "translate-y-12";
        if (direction === "left") return "-translate-x-12";
        if (direction === "right") return "translate-x-12";
        return "";
    };

    return (
        <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 blur-0" : "opacity-0 blur-sm"} ${getTransform()} ${className} ${fullWidth ? 'w-full' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

export const Icons = {
    AlertTriangle: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    Globe: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>,
    Search: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Quote: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>,
    X: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
    Menu: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>,
    ShieldCheck: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>,
    TrendingUp: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    Check: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5" /></svg>,
};

export const AnimatedCounter = ({ end, suffix = "", prefix = "", duration = 1000 }: { end: number, suffix?: string, prefix?: string, duration?: number }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const countRef = useRef(0);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp: number | null = null;
        const startValue = countRef.current;
        const change = end - startValue;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(startValue + change * ease);
            setCount(current);
            countRef.current = current;
            if (progress < 1) window.requestAnimationFrame(step);
            else { setCount(end); countRef.current = end; }
        };
        window.requestAnimationFrame(step);
    }, [end, isVisible, duration]);

    return <span ref={ref} className="tabular-nums whitespace-nowrap">{prefix}{count.toLocaleString()}{suffix}</span>;
};

export const LogoMarquee = () => {
    const logos = ["MAERSK", "CMA CGM", "MSC", "HAPAG-LLOYD", "ONE", "EVERGREEN", "COSCO", "HMM", "ZIM", "YANG MING"];
    return (
        <FadeIn delay={200}>
            <div id="logos" className="w-full bg-slate-900/50 backdrop-blur-sm border-y border-white/5 py-12 overflow-hidden relative group">
                <div className="flex animate-scroll whitespace-nowrap gap-16 md:gap-32 w-max group-hover:[animation-play-state:paused]">
                    {[...logos, ...logos].map((logo, i) => (
                        <span key={i} className="font-serif text-2xl md:text-3xl font-bold text-white/20 hover:text-white transition-colors duration-300 cursor-default select-none">
                            {logo}
                        </span>
                    ))}
                </div>
            </div>
        </FadeIn>
    );
};

export const Modal = ({ isOpen, onClose, children, title, maxWidth = "max-w-xl" }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string, maxWidth?: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`relative w-full ${maxWidth} bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-[scale_0.2s_ease-out]`}>
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/50">
                    <h3 className="font-serif text-xl font-bold text-white">{title}</h3>
                    <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="text-slate-400 hover:text-white transition-colors block p-1" aria-label="Close modal">
                        <Icons.X />
                    </a>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const LoginForm = ({ onClose }: { onClose: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const emailInput = document.getElementById('work-email') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;

        const res = await signIn('credentials', {
            redirect: false,
            email: emailInput.value,
            password: passwordInput.value,
        });

        setIsLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            onClose();
            router.push('/dashboard');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input id="work-email" required type="email" placeholder="Work Email" className="w-full bg-slate-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            <input id="login-password" required type="password" placeholder="Password" className="w-full bg-slate-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-slate-400"><input type="checkbox" className="rounded bg-slate-800 border-white/10" /> Remember me</label>
                <a href="#" className="text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                {isLoading ? "AUTHENTICATING..." : "LOG IN"}
            </button>
            <div className="text-center text-sm text-slate-500">
                New to Fathom? <button type="button" onClick={() => router.push('/register')} className="text-blue-400 hover:underline">Request a demo</button>
            </div>
        </form>
    );
};

export const GetStartedForm = ({ onClose }: { onClose: () => void }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Account Created Successfully! Redirecting to FATHOM SaaS Portal...");
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Full Name" className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                <input required type="text" placeholder="Company Name" className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <select required className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer" defaultValue="">
                        <option value="" disabled>Fleet Size</option>
                        <option value="1-5">1-5 Vessels</option>
                        <option value="6-20">6-20 Vessels</option>
                        <option value="21-50">21-50 Vessels</option>
                        <option value="100+">100+ Vessels</option>
                    </select>
                </div>
                <div className="relative">
                    <select required className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer" defaultValue="">
                        <option value="" disabled>Company Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="1000+">1,000+ employees</option>
                    </select>
                </div>
            </div>
            <input required type="email" placeholder="Work Email" className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            <div className="flex gap-2 relative">
                <input required type="tel" placeholder="Phone Number" className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-full transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md mt-6">
                GET STARTED
            </button>
        </form>
    );
};

export const ROICalculator = ({ onRecover }: { onRecover: (data: any) => void }) => {
    const [volume, setVolume] = useState(5000);
    const [cost, setCost] = useState(2500);
    const [errorRate, setErrorRate] = useState(3);

    const potentialLoss = Math.floor(volume * cost * (errorRate / 100));

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl overflow-hidden relative group">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-white font-bold">ROI Estimator</h3>
                <div className="flex items-center gap-2 text-green-400">
                    <Icons.TrendingUp />
                    <span className="font-mono text-xs font-bold">LIVE CALC</span>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Annual Shipment Volume</span>
                        <span className="text-white font-mono">{volume.toLocaleString()} TEU</span>
                    </div>
                    <input type="range" min="1000" max="50000" step="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-ocean h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Avg. Cost per Container</span>
                        <span className="text-white font-mono">${cost.toLocaleString()}</span>
                    </div>
                    <input type="range" min="500" max="10000" step="100" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full accent-ocean h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Industry Avg. Error Rate</span>
                        <span className="text-white font-mono">{errorRate}%</span>
                    </div>
                    <input type="range" min="1" max="10" step="0.5" value={errorRate} onChange={(e) => setErrorRate(Number(e.target.value))} className="w-full accent-ocean h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                </div>
            </div>

            <div className="border-t border-white/10 pt-6">
                <div className="text-slate-400 text-sm mb-1">Estimated Recoverable Revenue</div>
                <div className="text-3xl md:text-5xl font-bold text-white font-font-mono drop-shadow-[0_0_15px_rgba(74,222,128,0.2)] break-words mb-6">
                    <AnimatedCounter end={potentialLoss} prefix="$" duration={500} />
                </div>
                <button
                    onClick={() => onRecover({ volume, cost, errorRate, potentialLoss })}
                    className="w-full py-3 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-blue-900 font-bold hover:bg-white transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    Recover This Now
                </button>
            </div>
        </div>
    );
};

export const ProtocolAnimation = ({ onStepClick }: { onStepClick: (step: any) => void }) => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: "01",
            icon: <Icons.Search />,
            title: "Data Ingestion",
            desc: "API uplink established. Ingesting real-time invoices and satellite telemetry.",
            status: "UPLINK ACTIVE"
        },
        {
            id: "02",
            icon: <Icons.ShieldCheck />,
            title: "Deep Verification",
            desc: "Cross-referencing geofence timestamps against carrier claims. Anomalies detected.",
            status: "SCANNING..."
        },
        {
            id: "03",
            icon: <Icons.TrendingUp />,
            title: "Revenue Reclaim",
            desc: "Automated dispute generation. Capital recovery protocols initiated.",
            status: "EXECUTING"
        }
    ];

    return (
        <div className="relative px-4 py-8">
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-slate-800/50 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2 h-full animate-[shimmer_2s_infinite_linear]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {steps.map((item, i) => {
                    const isActive = i === activeStep;
                    return (
                        <div key={i} onClick={() => onStepClick(item)} className={`relative group cursor-pointer transition-all duration-500 ${isActive ? 'scale-105' : 'opacity-50 hover:opacity-100 scale-100'}`}>
                            <div className="absolute -top-12 -right-4 text-9xl font-bold text-white/5 font-font-mono select-none pointer-events-none">{item.id}</div>
                            <div className={`h-full p-8 rounded-xl border backdrop-blur-md transition-all duration-500 flex flex-col items-start relative overflow-hidden ${isActive ? 'bg-slate-900/80 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]' : 'bg-slate-900/20 border-white/5 group-hover:bg-slate-800/50'}`}>
                                {isActive && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-[progress_4s_linear_forward]" style={{ width: '100%' }}></div>}
                                <div className="flex items-center gap-3 mb-6 w-full">
                                    <div className={`w-12 h-12 rounded flex items-center justify-center border transition-all duration-500 ${isActive ? 'bg-blue-500/10 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-white/10 text-slate-500'}`}>{item.icon}</div>
                                    <div className="font-font-mono text-[10px] tracking-widest text-blue-300">
                                        {isActive ? <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>{item.status}</span> : <span className="text-slate-600">STANDBY</span>}
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold mb-3 font-serif transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.title}</h3>
                                <p className={`text-sm leading-relaxed font-font-mono transition-colors ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{item.desc}</p>
                                {isActive && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/5 to-transparent h-[50%] w-full animate-scan pointer-events-none"></div>}
                            </div>
                            <div className={`hidden md:block absolute -top-[3.25rem] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-20 transition-all duration-500 ${isActive ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]' : 'bg-slate-900 border-slate-700'}`}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const NavBar = ({ scrollY, onLogin, onScrollTo, onAdminAccess }: { scrollY: number, onLogin: () => void, onScrollTo: (id: string) => void, onAdminAccess: () => void }) => {
    const isScrolled = scrollY > 50;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'py-8 bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer group select-none"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    onDoubleClick={onAdminAccess}
                >
                    <span className="text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">⚓</span>
                    <span className="font-serif font-bold text-2xl text-white tracking-widest group-hover:text-blue-400 transition-colors">FATHOM</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => onScrollTo('platform')} className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors uppercase tracking-wider">Platform</button>
                    <button onClick={() => onScrollTo('solutions')} className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors uppercase tracking-wider">Solutions</button>
                    <button onClick={() => onScrollTo('pricing')} className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors uppercase tracking-wider">Pricing</button>
                    <button
                        onClick={onLogin}
                        className="px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-100 hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    >
                        CLIENT LOGIN
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Icons.Menu />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 animate-[slideDown_0.3s_ease-out]">
                    <button onClick={() => { onScrollTo('platform'); setMobileMenuOpen(false); }} className="text-left text-white py-2">Platform</button>
                    <button onClick={() => { onScrollTo('solutions'); setMobileMenuOpen(false); }} className="text-left text-white py-2">Solutions</button>
                    <button onClick={() => { onScrollTo('pricing'); setMobileMenuOpen(false); }} className="text-left text-white py-2">Pricing</button>
                    <button onClick={onLogin} className="w-full py-3 bg-blue-600 text-white rounded font-bold">Client Login</button>
                </div>
            )}
        </nav>
    );
};

export const AdminAuthForm = ({ onClose }: { onClose: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, password }),
            });

            if (!response.ok) {
                setError("Invalid admin credentials.");
                setIsLoading(false);
                return;
            }

            window.location.href = "/admin";
        } catch {
            setError("Unable to login right now. Try again.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs uppercase tracking-widest text-blue-300">Name</label>
            <input name="name" required type="text" autoComplete="username" className="w-full bg-slate-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />

            <label className="block text-xs uppercase tracking-widest text-blue-300 mt-4">Password</label>
            <input name="password" required type="password" autoComplete="current-password" className="w-full bg-slate-800 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <div className="flex gap-4 mt-6">
                <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/20 hover:bg-white/10 text-white font-bold rounded-full transition-colors backdrop-blur-sm">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                    {isLoading ? "CHECKING..." : "LOGIN"}
                </button>
            </div>
        </form>
    );
};

export default function LandingUI() {
    const router = useRouter();
    const [scrollY, setScrollY] = useState(0);
    const [modalState, setModalState] = useState<{ isOpen: boolean, type: string | null, data: any }>({ isOpen: false, type: null, data: null });

    const openModal = React.useCallback((type: string, data: any = null) => {
        if (type === 'signup') {
            router.push('/register');
            return;
        }
        setModalState({ isOpen: true, type, data });
    }, [router]);

    useEffect(() => {
        if (window.location.search.includes('login=true')) {
            setModalState({ isOpen: true, type: 'login', data: null });
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key.toLowerCase() === 'k' || e.code === 'KeyK')) {
                e.preventDefault();
                e.stopPropagation();
                openModal('admin');
            }
        };
        window.addEventListener('keydown', handleKeyDown, { capture: true });

        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        }
    }, [router, openModal]);

    const closeModal = () => setModalState({ isOpen: false, type: null, data: null });

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 80;
            const top = el.offsetTop - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const renderModalContent = () => {
        switch (modalState.type) {
            case 'login': return <LoginForm onClose={closeModal} />;
            case 'signup': return <GetStartedForm onClose={closeModal} />;
            case 'video': return (
                <div className="aspect-video bg-black rounded flex items-center justify-center border border-white/10">
                    <div className="text-center"><div className="text-6xl mb-4">▶️</div><p className="text-slate-400">Interactive Product Tour Placeholder</p></div>
                </div>
            );
            case 'calendar': return (
                <div className="text-center py-8">
                    <h4 className="text-white text-lg font-bold mb-4">Select a Time</h4>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[9, 10, 11, 13, 14, 15].map(time => (
                            <button key={time} onClick={() => { alert('Meeting Confirmed'); closeModal(); }} className="p-3 bg-slate-800 hover:bg-blue-600 rounded-full text-sm transition-colors">{time}:00 AM</button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">Timezone: UTC-08:00 (Pacific Time)</p>
                </div>
            );
            case 'admin': return <AdminAuthForm onClose={closeModal} />;
            case 'enterprise': return (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm mb-4">Please detail your fleet requirements for a custom quote.</p>
                    <textarea placeholder="Fleet size, integrations needed, etc." className="w-full bg-slate-800 border border-white/10 rounded px-4 py-3 text-white h-32 focus:outline-none focus:border-blue-500"></textarea>
                    <button onClick={() => { alert('Inquiry Sent. Priority Support will contact you shortly.'); closeModal(); }} className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-lg backdrop-blur-md">CONTACT SALES</button>
                </div>
            );
            case 'protocol': return (
                <div>
                    <p className="text-slate-300 mb-6 leading-relaxed">{modalState.data?.desc} This process runs continuously in the background, utilizing our proprietary neural network to identify anomalies that traditional rule-based systems miss.</p>
                    <button className="w-full py-3 border border-white/20 hover:bg-white/10 rounded-full text-white transition-colors backdrop-blur-md">View Technical Documentation</button>
                </div>
            );
            default: return null;
        }
    };

    const getModalTitle = () => {
        switch (modalState.type) {
            case 'login': return 'Client Portal Access';
            case 'signup': return 'Create Your Account';
            case 'video': return 'Fathom Platform Demo';
            case 'calendar': return 'Schedule a Discovery Call';
            case 'admin': return 'Internal Admin Access';
            case 'enterprise': return 'Enterprise Solution Inquiry';
            case 'protocol': return modalState.data?.title || 'System Protocol';
            default: return '';
        }
    };

    return (
        <div id="root-container" className="relative w-full z-10">
            <NavBar scrollY={scrollY} onLogin={() => openModal('login')} onAdminAccess={() => openModal('admin')} onScrollTo={scrollToSection} />

            <Modal isOpen={modalState.isOpen} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>

            <div className="vignette"></div>
            <div className="letterbox lb-top"></div>
            <div className="letterbox lb-bottom"></div>

            {/* SECTION 1: HERO */}
            <div className="h-[100vh] relative flex items-center justify-center pointer-events-none">
                <div className="text-center transition-opacity duration-300 pointer-events-auto" style={{ opacity: Math.max(0, 1 - scrollY / 600) }}>
                    <h1 className="font-serif text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] mb-8">
                        FATHOM
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button onClick={() => openModal('signup')} className="px-8 py-4 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-white font-bold tracking-wide shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:bg-blue-500/90 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all hover:scale-105">
                            GET STARTED
                        </button>
                        <button onClick={() => openModal('signup')} className="px-8 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold tracking-wide hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                            START 7-DAY FREE TRIAL
                        </button>
                    </div>
                </div>

                <div
                    onClick={() => scrollToSection('logos')}
                    className="absolute bottom-12 animate-bounce text-white/50 text-2xl cursor-pointer pointer-events-auto hover:text-white transition-colors"
                >
                    ↓
                </div>
            </div>

            {/* SECTION 2: SOCIAL PROOF */}
            <LogoMarquee />

            {/* SECTION 3: STATISTICS DASHBOARD */}
            <div id="platform" className="bg-gradient-to-b from-slate-900/80 to-slate-900/90 py-24 px-8 backdrop-blur-sm border-t border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Recovered Capital", val: 142, suffix: "K+", prefix: "$" },
                        { label: "Routes Monitored", val: 8500, suffix: "" },
                        { label: "Carriers Audited", val: 124, suffix: "" }
                    ].map((stat, i) => (
                        <FadeIn key={i} delay={i * 150} direction="up" className="h-full">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-md text-center group hover:bg-white/10 transition-all h-full flex flex-col justify-center overflow-hidden">
                                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-mono mb-2 group-hover:text-blue-400 transition-colors break-words">
                                    <AnimatedCounter end={stat.val} prefix={stat.prefix} suffix={stat.suffix} />
                                </div>
                                <div className="text-slate-400 tracking-widest text-xs font-bold uppercase">{stat.label}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>

            {/* SECTION 4: PROBLEM STATEMENT & ROI */}
            <div className="py-24 px-8 bg-slate-950/80 backdrop-blur-md border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeIn direction="left">
                        <div>
                            <div className="font-mono text-orange-500 text-xs font-bold tracking-widest mb-4">/// SYSTEM ALERT</div>
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                The Ocean is Deep.<br />Your Losses Shouldn&apos;t Be.
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-2 border-orange-500 pl-6">
                                Traditional audits miss 40% of invoice discrepancies. Fathom cross-references satellite AIS data against carrier invoices to detect detention & demurrage errors in real-time.
                            </p>

                            <div onClick={() => openModal('signup')} className="bg-white rounded-lg p-6 max-w-md shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer group">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                                    <div className="font-bold text-slate-800">INVOICE #9942</div>
                                    <div className="bg-red-100 text-red-600 px-2 py-1 text-xs font-bold rounded flex items-center gap-1">
                                        <Icons.AlertTriangle /> FLAGGED
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm group-hover:opacity-80 transition-opacity">
                                    <div className="flex justify-between"><span className="text-gray-500">Container ID</span><span className="font-font-mono">MSCU99214</span></div>
                                    <div className="flex justify-between bg-blue-50 p-2 rounded -mx-2">
                                        <span className="text-blue-600 font-bold flex gap-2 items-center"><Icons.Globe width={16} /> AIS Actual</span>
                                        <span className="font-font-mono text-blue-800">Oct 14, 09:30</span>
                                    </div>
                                    <div className="pt-2 text-right text-red-600 font-bold text-xs">DISCREPANCY: 43.5 HOURS</div>
                                </div>
                                <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <span className="text-white font-bold flex items-center gap-2"><Icons.Search /> INSPECT RECORD</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn direction="right" delay={300}>
                        <div>
                            <ROICalculator onRecover={(data: any) => openModal('signup', data)} />
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* SECTION 5: HOW IT WORKS */}
            <div id="solutions" className="py-24 px-8 bg-slate-900/90 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <FadeIn direction="up">
                        <div className="text-center mb-20">
                            <h2 className="font-serif text-4xl text-white font-bold mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">The Fathom Protocol</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
                        </div>
                    </FadeIn>
                    <ProtocolAnimation onStepClick={(step: any) => openModal('protocol', step)} />
                </div>
            </div>

            {/* SECTION 6: TESTIMONIALS */}
            <div className="py-24 px-8 bg-slate-950/95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-30"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <FadeIn>
                        <div className="flex items-center gap-4 mb-16 justify-center">
                            <div className="h-px w-12 bg-slate-800"></div>
                            <h2 className="font-serif text-3xl text-center text-white tracking-widest">INTERCEPTED COMMS</h2>
                            <div className="h-px w-12 bg-slate-800"></div>
                        </div>
                    </FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: "TRX-8992", name: "Sarah Jenkins", role: "VP Logistics, AutoCorp", msg: "Fathom found $2.4M in overcharged demurrage in our first quarter alone.", coords: "34.0522° N, 118.2437° W", status: "VERIFIED" },
                            { id: "TRX-9941", name: "Marcus Chen", role: "Supply Chain Dir, TechFlow", msg: "The AIS verification is a game changer. We no longer argue with carriers; we just show the data.", coords: "1.3521° N, 103.8198° E", status: "VERIFIED" },
                            { id: "TRX-7723", name: "Elena Rossi", role: "CFO, GlobalTrade", msg: "Implementation was seamless. We connected our ERP and started seeing flags within 24 hours.", coords: "51.5074° N, 0.1278° W", status: "VERIFIED" }
                        ].map((t, i) => (
                            <FadeIn key={i} delay={i * 200} direction="up" className="h-full">
                                <div className="group relative h-full bg-slate-900/60 backdrop-blur-sm border border-white/10 p-8 hover:bg-slate-800/80 transition-all duration-500 hover:border-blue-400/40 rounded-sm overflow-hidden flex flex-col">
                                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-slate-600 group-hover:border-blue-400 transition-colors duration-300"></div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-slate-600 group-hover:border-blue-400 transition-colors duration-300"></div>
                                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                        <div>
                                            <div className="font-mono text-[10px] text-blue-400 tracking-widest opacity-70 mb-1">ID: {t.id}</div>
                                            <div className="flex items-center gap-2 bg-green-900/20 px-2 py-1 rounded border border-green-500/20"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></div><span className="font-mono text-[10px] text-green-400 tracking-wider font-bold">{t.status}</span></div>
                                        </div>
                                        <div className="text-white/10 transform scale-150 group-hover:text-blue-500/20 transition-colors duration-500"><Icons.Quote /></div>
                                    </div>
                                    <div className="mb-8 relative z-10 flex-1"><p className="text-slate-300 text-lg font-light leading-relaxed italic">&quot;{t.msg}&quot;</p></div>
                                    <div className="mt-auto flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-slate-800 flex items-center justify-center text-sm font-bold text-white border border-white/10 rounded shadow-lg group-hover:scale-110 transition-transform duration-300">{t.name.charAt(0)}</div>
                                        <div><div className="text-white font-bold text-sm font-serif tracking-wide group-hover:text-blue-300 transition-colors">{t.name}</div><div className="text-slate-500 text-[10px] uppercase tracking-widest">{t.role}</div></div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 7: PRICING */}
            <div id="pricing" className="py-24 px-8 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto z-10 relative">
                    <FadeIn>
                        <h2 className="font-serif text-4xl text-center mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Deployment Tiers</h2>
                    </FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <FadeIn delay={0} direction="right" className="h-full">
                            <div className="p-8 border border-blue-500/20 rounded-xl bg-slate-900/60 backdrop-blur-xl h-full flex flex-col hover:border-blue-400/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group">
                                <h3 className="font-serif text-xl text-blue-200 mb-2 group-hover:text-white transition-colors">Scout</h3>
                                <div className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400">$499<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                <ul className="space-y-4 mb-8 text-slate-400 text-sm flex-1">
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Up to 1,000 Containers</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Basic AIS Tracking</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Email Support</li>
                                </ul>
                                <button onClick={() => openModal('signup', { type: 'scout' })} className="w-full py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-100 font-bold hover:bg-white/10 hover:border-white/30 transition-all">START TRIAL</button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={200} direction="up" className="h-full relative z-10">
                            <div className="p-8 border-2 border-blue-400 rounded-xl bg-slate-900/80 backdrop-blur-xl relative transform md:scale-105 shadow-[0_0_50px_rgba(59,130,246,0.2)] h-full flex flex-col">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 text-xs font-bold rounded-full tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.6)]">POPULAR</div>
                                <h3 className="font-serif text-xl text-white mb-2">Navigator</h3>
                                <div className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">$1,499<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                <ul className="space-y-4 mb-8 text-slate-300 text-sm flex-1">
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Up to 10,000 Containers</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Real-time Satellite Feed</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Automated Disputes</li>
                                </ul>
                                <button onClick={() => openModal('signup', { type: 'navigator' })} className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600/90 to-blue-500/90 backdrop-blur-md border border-blue-400/30 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">DEPLOY NOW</button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={400} direction="left" className="h-full">
                            <div className="p-8 border border-blue-500/20 rounded-xl bg-slate-900/60 backdrop-blur-xl h-full flex flex-col hover:border-blue-400/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group">
                                <h3 className="font-serif text-xl text-blue-200 mb-2 group-hover:text-white transition-colors">Admiral</h3>
                                <div className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400">Custom</div>
                                <ul className="space-y-4 mb-8 text-slate-400 text-sm flex-1">
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Unlimited Volume</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> On-premise Deployment</li>
                                    <li className="flex gap-2"><Icons.Check width={16} className="text-blue-400" /> Dedicated Account Mgr</li>
                                </ul>
                                <button onClick={() => openModal('enterprise')} className="w-full py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-100 font-bold hover:bg-white/10 hover:border-white/30 transition-all">CONTACT SALES</button>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* SECTION 8: FINAL CTA */}
            <div className="py-32 px-8 bg-gradient-to-br from-blue-900 via-slate-900 to-black text-center relative overflow-hidden border-y border-blue-500/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay -z-0" style={{ transform: 'scale(1.2)' }}></div>
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(2,6,23,0.9)] pointer-events-none z-10"></div>
                <div className="relative z-20 max-w-4xl mx-auto">
                    <FadeIn direction="up">
                        <h2 className="font-serif text-5xl md:text-6xl text-white font-bold mb-8 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">Stop Leaking Revenue Today.</h2>
                        <p className="text-xl text-blue-200 mb-12 drop-shadow-lg">Join 500+ forwarders who have recovered millions with Fathom&apos;s intelligence engine.</p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <button onClick={() => openModal('signup')} className="px-10 py-5 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-blue-900 font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                GET STARTED
                            </button>
                            <button onClick={() => openModal('signup')} className="px-10 py-5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all">
                                START 7-DAY FREE TRIAL
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* SECTION 9: FOOTER */}
            <footer className="bg-black py-16 px-8 border-t border-white/10 text-slate-400 text-sm">
                <FadeIn delay={200}>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div>
                            <div className="text-white font-serif font-bold text-2xl flex items-center gap-2 mb-6 cursor-pointer" onClick={() => scrollToSection('root-container')}>
                                <span className="text-ocean-light">⚓</span> FATHOM
                            </div>
                            <p className="mb-6">Maritime intelligence for the modern supply chain.</p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Platform</h4>
                            <ul className="space-y-2">
                                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-white transition-colors">Features</button></li>
                                <li><button className="hover:text-white transition-colors">Integrations</button></li>
                                <li><button className="hover:text-white transition-colors">Security</button></li>
                                <li><button className="hover:text-white transition-colors">API Docs</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Company</h4>
                            <ul className="space-y-2">
                                <li><button className="hover:text-white transition-colors">About Us</button></li>
                                <li><button className="hover:text-white transition-colors">Careers</button></li>
                                <li><button className="hover:text-white transition-colors">Press</button></li>
                                <li><button onClick={() => openModal('enterprise')} className="hover:text-white transition-colors">Contact</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Legal</h4>
                            <ul className="space-y-2">
                                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                                <li><button className="hover:text-white transition-colors">Cookie Settings</button></li>
                            </ul>
                            <div className="mt-6 font-mono text-xs text-slate-600">
                                © 2024 FATHOM INC.<br />SAN FRANCISCO, CA
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </footer>
        </div>
    );
}
