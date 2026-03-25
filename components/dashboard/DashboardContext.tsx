"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// TYPES
export interface Vessel {
    id: string
    name: string
    imo: string
    lat: number
    lng: number
    heading: number
    speed: number
    status: 'moving' | 'anchored' | 'moored'
    nextPort: string
    eta: string
}

export interface Invoice {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    date: string
    status: 'pending' | 'processed' | 'flagged' | 'approved'
    fraudScore: number
}

export interface Alert {
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    type: string
    entity: string
    date: string
    status: 'open' | 'investigating' | 'resolved' | 'false_positive'
    description: string
    evidence?: string
}

interface DashboardContextType {
    vessels: Vessel[]
    invoices: Invoice[]
    alerts: Alert[]
    addVessel: (vessel: Vessel) => void
    addInvoice: (invoice: Invoice) => void
    updateAlertStatus: (id: string, status: Alert['status']) => void
    refreshData: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// MOCK DATA GENERATORS
const INITIAL_VESSELS: Vessel[] = [
    { id: '1', name: 'EVER GIVEN', imo: '9811000', lat: 30.01, lng: 32.55, heading: 45, speed: 12.0, status: 'moving', nextPort: 'Rotterdam', eta: '2024-02-15 14:00' },
    { id: '2', name: 'MAERSK ALABAMA', imo: '9164263', lat: 25.10, lng: -55.20, heading: 270, speed: 16.5, status: 'moving', nextPort: 'Charleston', eta: '2024-02-12 09:30' },
    { id: '3', name: 'HMM ALGECIRAS', imo: '9863297', lat: 1.25, lng: 103.80, heading: 0, speed: 0, status: 'moored', nextPort: 'Singapore', eta: 'Arrived' },
]

const INITIAL_INVOICES: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-2024-001', vendor: 'Maersk Line', amount: 12500.00, date: '2024-01-20', status: 'flagged', fraudScore: 85 },
    { id: '2', invoiceNumber: 'INV-2024-002', vendor: 'CMA CGM', amount: 8200.50, date: '2024-01-21', status: 'processed', fraudScore: 12 },
]

const INITIAL_ALERTS: Alert[] = [
    {
        id: 'ALT-1002',
        severity: 'critical',
        type: 'Detention Charge Inflation',
        entity: 'INV-2024-001',
        date: '2 hours ago',
        status: 'open',
        description: 'Invoice #INV-2024-001 contains detention charges for 5 days, but AIS tracking confirms container was returned to terminal within 48 hours (Free Time). Potential overcharge of $1,200.',
        evidence: 'Container returns timestamp: 2024-01-18 14:30 UTC'
    },
]

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS)
    const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
    const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)

    // FLIGHT TRACKING SIMULATION
    useEffect(() => {
        const interval = setInterval(() => {
            setVessels(current => current.map(v => {
                if (v.status === 'moving') {
                    return {
                        ...v,
                        lat: v.lat + (Math.random() - 0.5) * 0.05,
                        lng: v.lng + (Math.random() - 0.5) * 0.05
                    }
                }
                return v
            }))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const addVessel = (vessel: Vessel) => {
        setVessels(prev => [...prev, vessel])
    }

    const addInvoice = (invoice: Invoice) => {
        setInvoices(prev => [invoice, ...prev])

        // INTEGRATION LOGIC: Auto-generate alert if high fraud score
        if (invoice.fraudScore > 70) {
            const newAlert: Alert = {
                id: `ALT-${Math.floor(Math.random() * 9000) + 1000}`,
                severity: invoice.fraudScore > 90 ? 'critical' : 'high',
                type: 'High Risk Invoice Detected',
                entity: invoice.invoiceNumber,
                date: 'Just now',
                status: 'open',
                description: `Newly uploaded invoice ${invoice.invoiceNumber} has a fraud score of ${invoice.fraudScore}%. Anomaly detected in line items.`,
                evidence: 'OCR Confidence: High. Discrepancy found: Rate Mismatch.'
            }
            setAlerts(prev => [newAlert, ...prev])
        }
    }

    const updateAlertStatus = (id: string, status: Alert['status']) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    }

    const refreshData = () => {
        // Logic to re-fetch if this were an API
        console.log("Refreshed data")
    }

    return (
        <DashboardContext.Provider value={{ vessels, invoices, alerts, addVessel, addInvoice, updateAlertStatus, refreshData }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}
