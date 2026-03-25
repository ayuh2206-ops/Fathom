"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, Shield } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const members = [
    { id: 1, name: 'John Doe', email: 'captain@pacificshipping.com', role: 'Owner', avatar: '/avatars/01.png' },
    { id: 2, name: 'Sarah Chen', email: 'sarah@pacificshipping.com', role: 'Admin', avatar: '/avatars/02.png' },
    { id: 3, name: 'Mike Ross', email: 'mike@pacificshipping.com', role: 'Viewer', avatar: '/avatars/03.png' },
]

export function TeamSettings() {
    return (
        <Card className="bg-slate-900 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-white">Team Members</CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage who has access to your workspace.
                    </CardDescription>
                </div>
                <Button className="bg-ocean text-white hover:bg-ocean-dark">
                    <Plus className="mr-2 h-4 w-4" /> Invite Member
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-white flex items-center gap-2">
                                        {member.name}
                                        {member.role === 'Owner' && <Shield className="h-3 w-3 text-yellow-400" />}
                                    </p>
                                    <p className="text-sm text-slate-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                    {member.role}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-slate-950 border-white/10 text-white" align="end">
                                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10">Change Role</DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10 text-red-400">Remove</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
