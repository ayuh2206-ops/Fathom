"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function ApiManagement() {
    const [isVisible, setIsVisible] = useState(false)
    const [keys, setKeys] = useState([
        { id: '1', name: 'Production Key', prefix: 'pk_live_', val: '89s8d9...s89d', created: '2023-11-01', lastUsed: 'Just now' },
        { id: '2', name: 'Test Key', prefix: 'pk_test_', val: 'j23k4j...23k4j', created: '2023-11-01', lastUsed: '2 days ago' },
    ])

    const handleCopy = (val: string) => {
        navigator.clipboard.writeText(val)
        // toast success
    }

    return (
        <Card className="bg-slate-900 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-white">API Keys</CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage keys for accessing the Fathom API externally.
                    </CardDescription>
                </div>
                <Button className="bg-ocean text-white hover:bg-ocean-dark">
                    <Plus className="mr-2 h-4 w-4" /> Generate New Key
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {keys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-white">{key.name}</p>
                                    <Badge variant="outline" className="text-xs border-white/10 text-slate-400">{key.prefix}</Badge>
                                </div>
                                <p className="text-xs text-slate-500">Last used: {key.lastUsed}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-slate-950 px-3 py-1.5 rounded border border-white/10 font-mono text-sm text-slate-300 w-48 truncate">
                                    {isVisible ? `${key.prefix}x8x8x8x8x8` : '••••••••••••••••'}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleCopy('mock-key')} className="text-slate-400 hover:text-white">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-4 rounded bg-blue-500/5 border border-blue-500/10">
                    <p className="text-sm text-blue-400 mb-2 font-semibold">Documentation</p>
                    <p className="text-sm text-slate-400">
                        Read our <span className="text-white underline cursor-pointer">API Documentation</span> to learn how to authenticate requests and integrate Fathom into your existing ERP workflow.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
