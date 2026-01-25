"use client"

import { ProfileSettings } from "@/components/settings/ProfileSettings"
import { TeamSettings } from "@/components/settings/TeamSettings"
import { ApiManagement } from "@/components/settings/ApiManagement"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Key, Bell } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-slate-400">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/10">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <User className="h-4 w-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Users className="h-4 w-4 mr-2" /> Team
                    </TabsTrigger>
                    <TabsTrigger value="api" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Key className="h-4 w-4 mr-2" /> API & Keys
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Bell className="h-4 w-4 mr-2" /> Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettings />
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <TeamSettings />
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                    <ApiManagement />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <div className="p-8 text-center text-slate-500 bg-slate-900 border border-white/10 rounded-lg">
                        Notification preferences coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
