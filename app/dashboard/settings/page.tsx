"use client"

import { ProfileSettings } from "@/components/settings/ProfileSettings"
import { TeamSettings } from "@/components/settings/TeamSettings"
import { ApiManagement } from "@/components/settings/ApiManagement"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { BillingSettings } from "@/components/settings/BillingSettings"
import { SecuritySettings } from "@/components/settings/SecuritySettings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Key, Bell, CreditCard, Shield } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-slate-400">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/10 flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <User className="h-4 w-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Users className="h-4 w-4 mr-2" /> Team
                    </TabsTrigger>
                    <TabsTrigger value="api" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Key className="h-4 w-4 mr-2" /> API &amp; Keys
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Bell className="h-4 w-4 mr-2" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <CreditCard className="h-4 w-4 mr-2" /> Billing
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-ocean data-[state=active]:text-white">
                        <Shield className="h-4 w-4 mr-2" /> Security
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
                    <NotificationSettings />
                </TabsContent>
                <TabsContent value="billing" className="space-y-4">
                    <BillingSettings />
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <SecuritySettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}
