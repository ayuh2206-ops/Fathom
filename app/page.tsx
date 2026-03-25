import { ShipSceneNative } from "@/components/landing-new/ShipSceneNative"
import LandingUI from "@/components/landing-new/LandingUI"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      <ShipSceneNative />
      <LandingUI />
    </main>
  )
}
