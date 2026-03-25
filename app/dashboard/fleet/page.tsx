"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { collection, onSnapshot } from "firebase/firestore"
import { db, hasClientConfig } from "@/lib/firebase"
import { FleetList } from "@/components/fleet/FleetList"
import { AddVesselModal } from "@/components/fleet/AddVesselModal"
import { Button } from "@/components/ui/button"
import { Plus, List, Map as MapIcon, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamically import Map to disable SSR
const FleetMap = dynamic(() => import('@/components/fleet/FleetMap'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map...</div>
})

export interface FleetVessel {
    id: string;
    name: string;
    imo: string;
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    status: 'moving' | 'anchored' | 'moored';
    nextPort: string;
    eta: string;
}

// No longer need hardcoded mock data here, we will fetch it!

export default function FleetPage() {
    const [vessels, setVessels] = useState<FleetVessel[]>([])
    const [view, setView] = useState("map")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Simulation loop fetching from our Mock API OR Firestore Sync
    useEffect(() => {
        if (hasClientConfig && db) {
            // PHASE 3: REAL-TIME FIRESTORE SYNC
            // Listen to the 'vessels' collection for instant updates pushed by the Cloud Function
            const unsubscribe = onSnapshot(collection(db, "vessels"), (snapshot) => {
                const liveVessels: FleetVessel[] = [];
                snapshot.forEach((doc) => {
                    liveVessels.push({ id: doc.id, ...doc.data() } as FleetVessel);
                });
                setVessels(liveVessels);
            }, (error) => {
                console.error("Firestore onSnapshot error:", error);
            });

            return () => unsubscribe();
        } else {
            // FALLBACK: If Firebase Client SDK isn't configured, fallback to polling the Mock API
            const fetchFleet = async () => {
                try {
                    const res = await fetch('/api/mock/fleet')
                    if (res.ok) {
                        const data = await res.json()
                        setVessels(data.vessels)
                    }
                } catch (error) {
                    console.error("Failed to fetch mock fleet:", error)
                }
            }

            fetchFleet() // initial fetch
            const interval = setInterval(fetchFleet, 2000) // Update every 2 seconds from the server

            return () => clearInterval(interval)
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
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button className="bg-ocean text-white hover:bg-ocean-dark" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vessel
                    </Button>
                </div>
            </div>

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
                    if (hasClientConfig && db) {
                        try {
                            const { doc, setDoc } = await import("firebase/firestore");
                            await setDoc(doc(db, "vessels", vessel.id), vessel);
                        } catch (e) {
                            console.error("Failed to add ship to live Firestore map", e);
                        }
                    } else {
                        try {
                            await fetch('/api/mock/fleet', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(vessel)
                            });
                            // The 2-second poller will automatically grab the new ship
                        } catch (e) {
                            console.error("Failed to add ship to mock simulation", e);
                        }
                    }
                }}
            />
        </div>
    )
}
