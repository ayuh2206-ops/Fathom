"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function ProfileSettings() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1000)
    }

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Public Profile</CardTitle>
                    <CardDescription className="text-slate-400">
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback className="bg-ocean text-white text-xl">JD</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                            Change Avatar
                        </Button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Display Name</Label>
                            <Input id="name" defaultValue="John Doe" className="bg-slate-950 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <Input id="email" defaultValue="captain@pacificshipping.com" className="bg-slate-950 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-slate-300">Role</Label>
                            <Input id="role" value="Fleet Manager" disabled className="bg-slate-950/50 border-white/5 text-slate-500 cursor-not-allowed" />
                        </div>

                        <Button type="submit" className="bg-ocean text-white hover:bg-ocean-dark" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-red-400">Danger Zone</CardTitle>
                    <CardDescription className="text-slate-400">
                        Irreversible actions related to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                        <div>
                            <p className="font-medium text-white">Delete Account</p>
                            <p className="text-sm text-slate-500">Permanently delete your account and all data.</p>
                        </div>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
