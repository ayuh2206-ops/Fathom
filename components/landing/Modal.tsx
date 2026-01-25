"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
    title: string
    description?: string
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
    trigger?: React.ReactNode
    className?: string
}

export function Modal({ title, description, children, isOpen, onClose, trigger, className }: ModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={cn("bg-slate-950 border-white/10 text-white sm:max-w-[425px]", className)}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
                    {description && <DialogDescription className="text-slate-400">{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}
