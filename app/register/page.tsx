import { RegisterForm } from "@/components/landing/RegisterForm"
import { ShieldAlert } from "lucide-react"

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements to match the landing page theme */}
            <div className="absolute top-0 left-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] -translate-x-1/2 rounded-full pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
                <div className="flex justify-center items-center gap-2 mb-6 text-white font-bold text-2xl tracking-tight">
                    <ShieldAlert className="h-8 w-8 text-blue-500" />
                    FATHOM
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
                    <RegisterForm />
                </div>
            </div>

            <p className="text-center text-slate-500 text-sm mt-8 relative z-10">
                Already have an account? <a href="/?login=true" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in here</a>
            </p>
        </main>
    )
}
