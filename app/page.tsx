"use client"

import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { LoginModal } from "@/components/landing/LoginModal";
import { RegisterModal } from "@/components/landing/RegisterModal";
import { useState } from "react";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-950 font-sans selection:bg-ocean/30 text-slate-50">
      <NavBar onLoginClick={() => setIsLoginOpen(true)} onRegisterClick={() => setIsRegisterOpen(true)} />
      <HeroSection />
      <ROICalculator />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* Scroll Spacer for future sections */}
      <div className="h-[50vh] bg-slate-900 flex items-center justify-center text-slate-500">
        More sections (Features, Testimonials, Pricing) coming soon...
      </div>
    </main>
  );
}
