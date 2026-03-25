"use client"

import { Modal } from "@/components/landing/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
interface AddVesselModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (vessel: { id: string; name: string; imo: string; type: string; lat: number; lng: number; heading: number; speed: number; status: 'moving' | 'anchored' | 'moored'; nextPort: string; eta: string }) => void
}

export function AddVesselModal({ isOpen, onClose, onAdd }: AddVesselModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        imo: "",
        type: "container"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            const newVessel = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                lat: 20 + Math.random() * 10,
                lng: -30 + Math.random() * 60,
                heading: Math.floor(Math.random() * 360),
                speed: 14.5,
                status: 'moving' as const,
                nextPort: 'Rotterdam',
                eta: '2024-02-15 08:00'
            }
            onAdd(newVessel)
            setIsLoading(false)
            onClose()
            setFormData({ name: "", imo: "", type: "container" })
        }, 1000)
    }

    return (
        <Modal
            title="Add New Vessel"
            description="Register a vessel to your fleet for tracking."
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="vessel-name">Vessel Name</Label>
                    <Input
                        id="vessel-name"
                        placeholder="EVER GIVEN"
                        required
                        className="bg-slate-900 border-white/10"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="imo">IMO Number</Label>
                    <Input
                        id="imo"
                        placeholder="9811000"
                        required
                        maxLength={7}
                        className="bg-slate-900 border-white/10 font-mono"
                        value={formData.imo}
                        onChange={e => setFormData({ ...formData, imo: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Vessel Type</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                        <SelectTrigger className="bg-slate-900 border-white/10">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="container">Container Ship</SelectItem>
                            <SelectItem value="bulk">Bulk Carrier</SelectItem>
                            <SelectItem value="tanker">Oil Tanker</SelectItem>
                            <SelectItem value="roro">Ro-Ro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
                    <Button type="submit" className="bg-ocean text-white" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Vessel"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
