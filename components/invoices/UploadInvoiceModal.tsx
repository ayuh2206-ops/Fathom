"use client"

import { Modal } from "@/components/landing/Modal"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { UploadCloud, FileText, CheckCircle, Loader2, X } from "lucide-react"

interface UploadInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => void
}

export function UploadInvoiceModal({ isOpen, onClose, onUpload }: UploadInvoiceModalProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleSubmit = () => {
        if (!file) return
        setIsUploading(true)

        // Simulate upload and processing
        setTimeout(() => {
            onUpload(file)
            setIsUploading(false)
            setFile(null)
            onClose()
        }, 2000)
    }

    return (
        <Modal
            title="Upload Invoice"
            description="Drag and drop your invoice PDF or image here for analysis."
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="space-y-6 pt-4">
                <div
                    className={`
                        border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                        ${isDragging ? 'border-ocean bg-ocean/10' : 'border-white/10 hover:bg-white/5'}
                        ${file ? 'border-green-500/50 bg-green-500/5' : ''}
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
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
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
