"use client"

import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
    return (
        <header className="h-16 border-b border-white/10 bg-slate-950/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 w-full max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search vessels, invoices, or containers..."
                        className="pl-9 bg-slate-900/50 border-white/10 focus:border-ocean w-full text-sm text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-ocean rounded-full ring-2 ring-slate-950"></span>
                </Button>
                <div className="h-6 w-px bg-white/10" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt="User" />
                                <AvatarFallback className="bg-ocean text-white">JD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-950 border-white/10 text-white" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">John Doe</p>
                                <p className="text-xs leading-none text-slate-400">
                                    captain@pacificshipping.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-400 focus:bg-red-900/10 focus:text-red-400 cursor-pointer">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
