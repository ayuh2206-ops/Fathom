"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function RegisterForm() {
    const [step, setStep] = React.useState(1)
    const [isLoading, setIsLoading] = React.useState(false)
    const totalSteps = 3

    const [formData, setFormData] = React.useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        companySize: "",
        fleetSize: "",
        phone: "",
        plan: "navigator" // Default to recommended
    })

    // Basic validation check (can use Zod later)
    const isStep1Valid = formData.fullName && formData.email && formData.password.length >= 8 && formData.password === formData.confirmPassword
    const isStep2Valid = formData.companyName && formData.companySize && formData.fleetSize && formData.phone

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName,
                    plan: formData.plan
                    // Additional fields can be added to API as needed
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Registration failed')
            }

            // Auto-login or redirect to dashboard (or show verify email message)
            // For now, we'll just show success
            alert("Registration successful! Check console for simulated email.")
            // In a real app, sign in immediately:
            // signIn('credentials', { email: formData.email, password: formData.password })

        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <Progress value={(step / totalSteps) * 100} className="h-2 bg-slate-800" />
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Account Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Create your account</h2>
                            <p className="text-slate-400">Start with your basic information.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name</Label>
                                <Input
                                    id="fullname"
                                    placeholder="John Doe"
                                    className="bg-slate-900 border-white/10"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="work-email">Work Email</Label>
                                <Input
                                    id="work-email"
                                    type="email"
                                    placeholder="john@company.com"
                                    className="bg-slate-900 border-white/10"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-slate-900 border-white/10"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <p className="text-xs text-slate-500">Min 8 chars, 1 uppercase, 1 number</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-pass">Confirm Password</Label>
                                <Input
                                    id="confirm-pass"
                                    type="password"
                                    className="bg-slate-900 border-white/10"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Company Info */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Company Details</h2>
                            <p className="text-slate-400">Tell us about your organization.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input
                                    id="company"
                                    placeholder="Acme Shipping Co."
                                    className="bg-slate-900 border-white/10"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Size</Label>
                                <Select onValueChange={v => setFormData({ ...formData, companySize: v })}>
                                    <SelectTrigger className="bg-slate-900 border-white/10">
                                        <SelectValue placeholder="Select employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-50">1-50 employees</SelectItem>
                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                        <SelectItem value="201-1000">201-1,000 employees</SelectItem>
                                        <SelectItem value="1000+">1,000+ employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fleet Size</Label>
                                <Select onValueChange={v => setFormData({ ...formData, fleetSize: v })}>
                                    <SelectTrigger className="bg-slate-900 border-white/10">
                                        <SelectValue placeholder="Select fleet size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-10">1-10 vessels</SelectItem>
                                        <SelectItem value="11-50">11-50 vessels</SelectItem>
                                        <SelectItem value="51-100">51-100 vessels</SelectItem>
                                        <SelectItem value="100+">100+ vessels</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-slate-900 border-white/10"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Plan Selection */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Choose your plan</h2>
                            <p className="text-slate-400">Select the plan that fits your needs.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: "scout", name: "Scout", price: "$499", desc: "For small fleets up to 10 vessels" },
                                { id: "navigator", name: "Navigator", price: "$1,499", desc: "For growing fleets up to 50 vessels", popular: true },
                                { id: "admiral", name: "Admiral", price: "Custom", desc: "Unlimited enterprise access" }
                            ].map((plan) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative rounded-lg border p-4 cursor-pointer transition-all hover:bg-white/5",
                                        formData.plan === plan.id ? "border-ocean bg-ocean/10" : "border-white/10"
                                    )}
                                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 right-4 bg-ocean text-white text-xs px-2 py-1 rounded-full">
                                            Recommended
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-white">{plan.name}</h3>
                                            <p className="text-sm text-slate-400">{plan.desc}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">{plan.price}</div>
                                            <div className="text-xs text-slate-500">/month</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/10 mt-6 text-center">
                            <p className="text-sm text-slate-400 mb-3">Not ready to commit?</p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                onClick={() => {
                                    const trialData = { ...formData, plan: 'trial' }
                                    setIsLoading(true)
                                    fetch('/api/auth/register', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(trialData)
                                    })
                                        .then(async (res) => {
                                            if (!res.ok) {
                                                const data = await res.json()
                                                throw new Error(data.message || 'Registration failed')
                                            }
                                            alert("15-Day Free Trial activated! Please log in to continue.")
                                        })
                                        .catch((error: any) => alert(error.message))
                                        .finally(() => setIsLoading(false))
                                }}
                            >
                                Start Free 15-Day Trial
                            </Button>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={handleBack} className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}

                    {step < totalSteps ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="w-full bg-ocean hover:bg-ocean-dark text-white"
                            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                        >
                            Continue <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="w-full bg-ocean hover:bg-ocean-dark text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Create Account
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
