"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'
import { FleetList } from "@/components/fleet/FleetList"
import { AddVesselModal } from "@/components/fleet/AddVesselModal"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Plus, List, Map as MapIcon, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FleetVessel } from "@/types/fleet"

// Dynamically import Map to disable SSR
const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map...</div>
})

export default function FleetPage() {
    const [vessels, setVessels] = useState<FleetVessel[]>([])
    const [view, setView] = useState("map")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [fleetError, setFleetError] = useState<string | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const upsertVessel = (vessel: FleetVessel) => {
        setVessels((current) =>
            [...current.filter((entry) => entry.id !== vessel.id), vessel].sort((left, right) =>
                left.name.localeCompare(right.name)
            )
        )
    }

    const loadFleet = async () => {
        try {
            const res = await fetch("/api/fleet/vessels", { cache: "no-store" })
            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error || `Failed to load fleet: ${res.status}`)
            }

            const data = await res.json()
            setVessels(Array.isArray(data.vessels) ? data.vessels : [])
            setFleetError(null)
        } catch (error) {
            console.error("Failed to load tracked vessels:", error)
            setFleetError(error instanceof Error ? error.message : "Failed to load tracked vessels")
        }
    }

    const syncFleet = async () => {
        try {
            setIsRefreshing(true)
            const res = await fetch("/api/fleet/vessels/sync", {
                method: "POST",
                cache: "no-store",
            })

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error || `Failed to sync fleet: ${res.status}`)
            }

            const data = await res.json()
            setVessels(Array.isArray(data.vessels) ? data.vessels : [])
            setFleetError(null)
        } catch (error) {
            console.error("Failed to sync tracked vessels:", error)
            setFleetError(error instanceof Error ? error.message : "Failed to sync tracked vessels")
        } finally {
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        void loadFleet().then(() => syncFleet())

        intervalRef.current = setInterval(() => {
            void syncFleet()
        }, 30000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Fleet Management</h2>
                    <p className="text-slate-400">Track and manage your vessels in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => void syncFleet()}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vessel
                    </Button>
                </div>
            </div>

            {fleetError && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {fleetError}
                </div>
            )}

            {/* Tabs / View Toggle */}
            <Tabs defaultValue="map" value={view} onValueChange={setView} className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-900 border border-white/10">
                        <TabsTrigger value="map" className="data-[state=active]:bg-ocean data-[state=active]:text-white"><MapIcon className="h-4 w-4 mr-2" /> Map View</TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:bg-ocean data-[state=active]:text-white"><List className="h-4 w-4 mr-2" /> List View</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-4 text-sm text-slate-400">
                        <span>Total: <strong className="text-white">{vessels.length}</strong></span>
                        <span>Moving: <strong className="text-green-400">{vessels.filter(v => v.status === 'moving').length}</strong></span>
                    </div>
                </div>

                <TabsContent value="map" className="m-0 focus-visible:ring-0">
                    <FleetMap vessels={vessels} />
                </TabsContent>

                <TabsContent value="list" className="m-0 focus-visible:ring-0">
                    <FleetList vessels={vessels} onViewDetails={(id) => alert(`View details for ${id}`)} />
                </TabsContent>
            </Tabs>

            <AddVesselModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={async (vessel) => {
                    try {
                        const res = await fetch("/api/fleet/vessels", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(vessel),
                        })

                        const data = await res.json().catch(() => null)

                        if (!res.ok) {
                            throw new Error(data?.error || `Failed to create tracked vessel: ${res.status}`)
                        }

                        if (data?.vessel) {
                            upsertVessel(data.vessel as FleetVessel)
                            setFleetError(null)
                        }

                        toast({
                            title: "Vessel added",
                            description: `${vessel.name} is now being tracked.`,
                        })

                        void syncFleet()
                    } catch (error) {
                        console.error("Failed to add tracked vessel", error)
                        const message =
                            error instanceof Error ? error.message : "Failed to add tracked vessel"
                        setFleetError(message)
                        toast({
                            variant: "destructive",
                            title: "Could not add vessel",
                            description: message,
                        })
                        throw error
                    }
                }}
            />
        </div>
    )
}
