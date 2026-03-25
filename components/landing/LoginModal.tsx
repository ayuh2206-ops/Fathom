"use client"

import { Modal } from "./Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Explicitly grab values safely to avoid null reference
        const emailInput = document.getElementById('email') as HTMLInputElement
        const passwordInput = document.getElementById('password') as HTMLInputElement

        const res = await signIn('credentials', {
            redirect: false,
            email: emailInput.value,
            password: passwordInput.value,
        })

        setIsLoading(false)

        if (res?.error) {
            alert(res.error)
        } else {
            onClose()
            // Redirect to dashboard
            window.location.href = '/dashboard'
        }
    }

    return (
        <Modal
            title="Access FATHOM"
            description="Enter your credentials to access the fleet dashboard."
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="captain@pacificshipping.com"
                        type="email"
                        required
                        className="bg-slate-900 border-white/10 focus:border-ocean text-white placeholder:text-slate-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="text-xs text-ocean hover:text-ocean-light">
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        className="bg-slate-900 border-white/10 focus:border-ocean text-white placeholder:text-slate-500"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-ocean data-[state=checked]:border-ocean" />
                    <Label htmlFor="remember" className="text-sm text-slate-400">Remember this device</Label>
                </div>

                <Button type="submit" className="w-full bg-ocean hover:bg-ocean-dark text-white" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Sign In"}
                </Button>

                <div className="text-center text-sm text-slate-500">
                    Not a customer yet? <Link href="#" className="text-ocean hover:underline">Request Access</Link>
                </div>
            </form>
        </Modal>
    )
}
