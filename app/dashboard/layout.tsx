import { Header } from "@/components/dashboard/Header"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { getOptionalServerSession } from "@/lib/server-session"
import { redirect } from "next/navigation"
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"
import { cookies } from "next/headers"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getOptionalServerSession()
    
    // Check for admin session fallback for testing/access
    const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value
    const isAdmin = verifyAdminSessionToken(adminToken)

    if (!session?.user?.id && !isAdmin) {
        redirect("/")
    }

    const userName = session?.user?.name || "Admin (Testing)"
    const userEmail = session?.user?.email || "admin@fathom"

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-slate-50 overflow-hidden">
            <div className="hidden md:block">
                <Sidebar className="" />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header userName={userName} userEmail={userEmail} />

                <main className="flex-1 overflow-y-auto bg-slate-950/50 p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
