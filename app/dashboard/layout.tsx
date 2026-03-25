import { Header } from "@/components/dashboard/Header"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { authOptions } from "@/lib/auth-options"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect("/")
    }

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden">
            <div className="hidden md:block">
                <Sidebar className="" />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header userName={session.user.name} userEmail={session.user.email} />

                <main className="flex-1 overflow-y-auto bg-slate-950/50 p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
