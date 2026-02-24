"use client"

import { Modal } from "@/components/landing/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Gavel, Loader2 } from "lucide-react"

interface GenerateDisputeModalProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (disputeData: { invoiceNumber: string; type: string; amount: number; date: string; details?: string }) => void
}

export function GenerateDisputeModal({ isOpen, onClose, onGenerate }: GenerateDisputeModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        invoiceNumber: "",
        type: "Detention/Demurrage",
        amount: "",
        details: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate legal text generation
        setTimeout(() => {
            onGenerate({
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date().toISOString().split('T')[0]
            })
            setIsLoading(false)
            onClose()
            setFormData({ invoiceNumber: "", type: "Detention/Demurrage", amount: "", details: "" })
        }, 1500)
    }

    return (
        <Modal
            title="Generate Dispute"
            description="Create a formal dispute letter based on invoice anomalies."
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="invoice">Related Invoice Number</Label>
                    <Input
                        id="invoice"
                        placeholder="INV-2024-XXX"
                        required
                        className="bg-slate-900 border-white/10"
                        value={formData.invoiceNumber}
                        onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Dispute Reason</Label>
                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                            <SelectTrigger className="bg-slate-900 border-white/10">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Detention/Demurrage">Detention Overcharge</SelectItem>
                                <SelectItem value="Rate Discrepancy">Rate Discrepancy</SelectItem>
                                <SelectItem value="Damaged Cargo">Damaged Cargo</SelectItem>
                                <SelectItem value="Lost Cargo">Lost Cargo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Disputed Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            required
                            className="bg-slate-900 border-white/10"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="details">Additional Context</Label>
                    <Textarea
                        id="details"
                        placeholder="Explain the discrepancy (e.g., 'Container was returned within free time...')"
                        className="bg-slate-900 border-white/10 min-h-[100px]"
                        value={formData.details}
                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
                    <Button type="submit" className="bg-ocean text-white" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Legal Text...
                            </>
                        ) : (
                            <>
                                <Gavel className="mr-2 h-4 w-4" />
                                Create Draft
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
