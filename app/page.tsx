"use client"

import { useState } from "react"
import { NavBar } from "@/components/landing/NavBar"
import { HeroSection } from "@/components/landing/HeroSection"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { ROICalculator } from "@/components/landing/ROICalculator"
import { PricingSection } from "@/components/landing/PricingSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FaqSection } from "@/components/landing/FaqSection"
import { CtaSection } from "@/components/landing/CtaSection"
import { Footer } from "@/components/landing/Footer"
import { LoginModal } from "@/components/landing/LoginModal"
import { RegisterModal } from "@/components/landing/RegisterModal"

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-ocean/30">
      <NavBar
        onLoginClick={() => setIsLoginOpen(true)}
        onRegisterClick={() => setIsRegisterOpen(true)}
      />

      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ROICalculator />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </main>
  )
}
