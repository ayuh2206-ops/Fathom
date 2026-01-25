"use client"

import { Modal } from "./Modal"
import { RegisterForm } from "./RegisterForm"

interface RegisterModalProps {
    isOpen: boolean
    onClose: () => void
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    return (
        <Modal
            title="Start your journey"
            description="Join the world's leading freight intelligence platform."
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="pt-4">
                <RegisterForm />
            </div>
        </Modal>
    )
}
