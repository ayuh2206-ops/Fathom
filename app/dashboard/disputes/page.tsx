"use client"

import { useState } from "react"
import { DisputesList, Dispute } from "@/components/disputes/DisputesList"
import { GenerateDisputeModal } from "@/components/disputes/GenerateDisputeModal"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Gavel, Scale, MailCheck } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { useRouter } from "next/navigation"

const INITIAL_DISPUTES: Dispute[] = [
    { id: 'DSP-992', invoiceNumber: 'INV-2023-899', type: 'Detention Overcharge', amount: 1200.00, carrier: 'Maersk Line', status: 'sent', date: '2024-01-15' },
    { id: 'DSP-994', invoiceNumber: 'INV-2024-002', type: 'Rate Discrepancy', amount: 450.00, carrier: 'CMA CGM', status: 'draft', date: '2024-01-22' },
    { id: 'DSP-980', invoiceNumber: 'INV-2023-750', type: 'Damaged Cargo', amount: 15000.00, carrier: 'MSC', status: 'negotiating', date: '2023-12-10' },
    { id: 'DSP-955', invoiceNumber: 'INV-2023-600', type: 'Lost Cargo', amount: 4200.00, carrier: 'ONE', status: 'accepted', date: '2023-11-05' },
]

export default function DisputesPage() {
    const router = useRouter()
    const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleGenerate = (data: { invoiceNumber: string; type: string; amount: number; date: string }) => {
        const newDispute: Dispute = {
            id: `DSP-${Math.floor(Math.random() * 1000)}`,
            invoiceNumber: data.invoiceNumber,
            type: data.type,
            amount: data.amount,
            carrier: 'Simulated Carrier',
            status: 'draft',
            date: data.date
        }
        setDisputes([newDispute, ...disputes])
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Disputes</h2>
                    <p className="text-slate-400">Manage claims and recover costs from carriers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Dispute
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Active Claims"
                    value={disputes.filter(d => d.status !== 'accepted' && d.status !== 'rejected').length.toString()}
                    icon={Scale}
                    description="In progress"
                />
                <StatCard
                    title="Pending Drafts"
                    value={disputes.filter(d => d.status === 'draft').length.toString()}
                    icon={Gavel}
                    description="Waiting for review"
                />
                <StatCard
                    title="Recovered (YTD)"
                    value="$45,231.89"
                    icon={MailCheck}
                    trend={{ value: 12, direction: 'up', label: 'vs last year' }}
                />
                <StatCard
                    title="Success Rate"
                    value="85%"
                    icon={Scale}
                    description="Claims accepted"
                    trend={{ value: 2, direction: 'up', label: 'vs last month' }}
                />
            </div>

            <DisputesList
                disputes={disputes}
                onView={(id) => router.push(`/dashboard/disputes/${id}`)}
            />

            <GenerateDisputeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGenerate={handleGenerate}
            />
        </div>
    )
}
