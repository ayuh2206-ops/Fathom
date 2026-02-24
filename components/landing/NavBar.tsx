"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Anchor, Menu, X } from "lucide-react"
// Let's use a custom mobile menu state for now to match the prompt requirements without extra deps if possible, or just standard state.

interface NavBarProps {
    onLoginClick?: () => void
    onRegisterClick?: () => void
}

export function NavBar({ onLoginClick, onRegisterClick }: NavBarProps) {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Platform", href: "#platform" },
        { name: "Solutions", href: "#solutions" },
        { name: "Pricing", href: "#pricing" },
    ]

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-ocean rounded-lg p-1.5 transition-transform group-hover:rotate-12">
                        <Anchor className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-serif text-2xl font-bold tracking-wider text-white">
                        FATHOM
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:text-ocean hover:bg-white/5" onClick={onLoginClick}>
                        Log In
                    </Button>
                    <Button className="bg-ocean hover:bg-ocean-dark text-white shadow-lg shadow-ocean/20" onClick={onRegisterClick}>
                        Get Started
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-slate-950 border-b border-white/10 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2" />
                    <Button variant="ghost" className="text-white justify-start" onClick={() => { setIsMobileMenuOpen(false); onLoginClick?.() }}>
                        Log In
                    </Button>
                    <Button className="bg-ocean text-white justify-start" onClick={() => { setIsMobileMenuOpen(false); onRegisterClick?.() }}>
                        Get Started
                    </Button>
                </div>
            )}
        </nav>
    )
}
