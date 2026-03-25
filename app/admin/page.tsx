import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth"
import { getFirebaseFirestore } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

type FirestoreUser = {
    email?: string
    fullName?: string
    role?: string
    organizationId?: string
    createdAt?: Timestamp | string | Date | null
}

type FirestoreInvoice = {
    amount?: number
    status?: string
    currency?: string
}

type FirestoreOrganization = {
    name?: string
    subscriptionPlan?: string
}

function formatFirestoreDate(
    value: Timestamp | string | Date | null | undefined
): string {
    if (!value) {
        return "-"
    }

    if (value instanceof Timestamp) {
        return value.toDate().toLocaleString()
    }

    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return date.toLocaleString()
}

function toDateValue(value: Timestamp | string | Date | null | undefined): number {
    if (!value) {
        return 0
    }

    if (value instanceof Timestamp) {
        return value.toMillis()
    }

    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 0
    }

    return date.getTime()
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount)
}

export default async function AdminPanelPage() {
    const sessionToken = cookies().get(ADMIN_SESSION_COOKIE)?.value

    if (!verifyAdminSessionToken(sessionToken)) {
        redirect("/")
    }

    const firestore = getFirebaseFirestore()

    const [usersSnapshot, invoicesSnapshot, organizationsSnapshot] = await Promise.all([
        firestore.collection("users").get(),
        firestore.collection("invoices").get(),
        firestore.collection("organizations").get(),
    ])

    const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreUser),
    }))

    const organizationsMap = new Map(
        organizationsSnapshot.docs.map((doc) => {
            const data = doc.data() as FirestoreOrganization
            return [
                doc.id,
                {
                    id: doc.id,
                    name: data.name || "Unnamed Organization",
                    plan: data.subscriptionPlan || "unknown",
                },
            ] as const
        })
    )

    const invoices = invoicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreInvoice),
    }))

    const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
    const flaggedInvoices = invoices.filter((invoice) => invoice.status === "flagged").length
    const pendingInvoices = invoices.filter((invoice) =>
        ["uploaded", "pending", "processed", "analyzed"].includes(String(invoice.status || ""))
    ).length

    const sortedUsers = [...users].sort((a, b) => {
        return toDateValue(b.createdAt) - toDateValue(a.createdAt)
    })

    return (
        <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                            Fathom Internal
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-white">Admin Control Panel</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Operational view across users, organizations, and invoice processing.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-md border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
                        >
                            Open Dashboard
                        </Link>
                        <AdminLogoutButton />
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Total Users</p>
                        <p className="mt-2 text-3xl font-bold text-white">{users.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Organizations</p>
                        <p className="mt-2 text-3xl font-bold text-white">{organizationsSnapshot.size}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Invoices (Total)</p>
                        <p className="mt-2 text-3xl font-bold text-white">{invoices.length}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatCurrency(totalInvoiceAmount)} processed value</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400">Alerts</p>
                        <p className="mt-2 text-3xl font-bold text-red-300">{flaggedInvoices}</p>
                        <p className="mt-1 text-xs text-slate-500">{pendingInvoices} invoices still in processing pipeline</p>
                    </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold text-white">Quick Controls</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <Link
                            href="/Fathom_LandingPage_Design_Nine.html"
                            className="rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"
                        >
                            Launch Public Landing
                        </Link>
                        <Link
                            href="/dashboard/invoices"
                            className="rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"
                        >
                            Test Invoice Workflow
                        </Link>
                        <Link
                            href="/dashboard/disputes"
                            className="rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"
                        >
                            Review Dispute Pipeline
                        </Link>
                    </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold text-white">All Users</h2>
                    <div className="mt-4 overflow-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-3 py-2">Name</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Role</th>
                                    <th className="px-3 py-2">Organization</th>
                                    <th className="px-3 py-2">Plan</th>
                                    <th className="px-3 py-2">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map((user) => {
                                    const organization = user.organizationId
                                        ? organizationsMap.get(user.organizationId)
                                        : null

                                    return (
                                        <tr key={user.id} className="border-b border-white/5">
                                            <td className="px-3 py-3 text-white">{user.fullName || "-"}</td>
                                            <td className="px-3 py-3 text-slate-300">{user.email || "-"}</td>
                                            <td className="px-3 py-3 text-slate-300">{user.role || "-"}</td>
                                            <td className="px-3 py-3 text-slate-300">{organization?.name || "-"}</td>
                                            <td className="px-3 py-3 text-slate-300 capitalize">{organization?.plan || "-"}</td>
                                            <td className="px-3 py-3 text-slate-400">
                                                {formatFirestoreDate(user.createdAt)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {sortedUsers.length === 0 && (
                                    <tr>
                                        <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    )
}
