"use client"

import { Modal } from "@/components/landing/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { UploadCloud, CheckCircle, Loader2, X } from "lucide-react"

interface UploadInvoicePayload {
    file: File
    vendorName: string
}

interface UploadInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (payload: UploadInvoicePayload) => Promise<void>
}

export function UploadInvoiceModal({ isOpen, onClose, onUpload }: UploadInvoiceModalProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [vendorName, setVendorName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [agentWarning, setAgentWarning] = useState<{ label: string; score: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const normalizedVendorName = vendorName.trim()

        if (!normalizedVendorName) {
            setAgentWarning(null)
            return
        }

        let isCancelled = false
        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await fetch("/api/agents/lookup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        agentName: normalizedVendorName,
                        agentEmail: null,
                    }),
                })

                if (!response.ok) {
                    if (!isCancelled) {
                        setAgentWarning(null)
                    }
                    return
                }

                const payload = (await response.json()) as {
                    agent?: { reputationScore?: number } | null
                    reputationLabel?: "trusted" | "caution" | "flagged" | null
                }

                if (!payload.agent || !payload.reputationLabel) {
                    if (!isCancelled) {
                        setAgentWarning(null)
                    }
                    return
                }

                if (!isCancelled) {
                    setAgentWarning({
                        label: payload.reputationLabel,
                        score: typeof payload.agent.reputationScore === "number" ? payload.agent.reputationScore : 0,
                    })
                }
            } catch {
                if (!isCancelled) {
                    setAgentWarning(null)
                }
            }
        }, 500)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [vendorName, file])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!file) return
        setIsUploading(true)
        setError(null)

        try {
            await onUpload({
                file,
                vendorName: vendorName.trim(),
            })
            setIsUploading(false)
            setFile(null)
            setVendorName("")
            setAgentWarning(null)
            onClose()
        } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : "Upload failed")
            setIsUploading(false)
        }
    }

    const warningStyles =
        agentWarning?.label === "flagged"
            ? "border-red-500/20 bg-red-500/10 text-red-300"
            : agentWarning?.label === "caution"
                ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"

    const warningText =
        agentWarning?.label === "flagged"
            ? `⚠ This agent has been flagged for fraud in past invoices (reputation score: ${agentWarning.score}/100). Proceed with extra caution.`
            : agentWarning?.label === "caution"
                ? "This agent has some prior flags. Review carefully."
                : agentWarning?.label === "trusted"
                    ? "Agent has a clean track record."
                    : null

    return (
        <Modal
            title="Upload Invoice"
            description="Drag and drop your invoice PDF or image here for analysis."
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="vendor-name" className="text-slate-300">
                        Vendor / Agent Name
                    </Label>
                    <Input
                        id="vendor-name"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="Enter the port agent or vendor name"
                        className="border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-ocean"
                    />
                </div>

                <div
                    className={`
                        border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                        ${isDragging ? "border-ocean bg-ocean/10" : "border-white/10 hover:bg-white/5"}
                        ${file ? "border-green-500/50 bg-green-500/5" : ""}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                    />

                    {file ? (
                        <div className="text-center">
                            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <p className="text-white font-medium mb-1">{file.name}</p>
                            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFile(null)
                                    setError(null)
                                }}
                            >
                                <X className="h-4 w-4 mr-2" /> Remove
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500">PDF, PNG, JPG up to 10MB</p>
                        </div>
                    )}
                </div>

                {agentWarning && warningText && (
                    <div className={`rounded-md border px-3 py-2 text-sm ${warningStyles}`}>
                        {warningText}
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-ocean text-white" disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Upload & Process"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
