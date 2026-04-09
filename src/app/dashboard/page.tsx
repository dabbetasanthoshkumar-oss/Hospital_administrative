'use client'

import { useAuth } from '@/components/auth-context'
import { AdminDashboard } from '@/components/dashboards/admin-dashboard'
import { DoctorDashboard } from '@/components/dashboards/doctor-dashboard'
import { PatientDashboard } from '@/components/dashboards/patient-dashboard'
import { ReceptionistDashboard } from '@/components/dashboards/receptionist-dashboard'
import { PharmacistDashboard } from '@/components/dashboards/pharmacist-dashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
    const { profile, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    if (!profile) return null

    switch (profile.role) {
        case 'admin':
            return <AdminDashboard />
        case 'doctor':
            return <DoctorDashboard />
        case 'patient':
            return <PatientDashboard />
        case 'receptionist':
            return <ReceptionistDashboard />
        case 'pharmacist':
            return <PharmacistDashboard />
        default:
            return (
                <div className="glass-card p-12 text-center">
                    <h2 className="text-2xl font-black text-rose-400 mb-2 uppercase italic tracking-tighter">Access Context Missing</h2>
                    <p className="text-blue-100/40 font-medium">Please contact system administrator to assign your clinical role.</p>
                </div>
            )
    }
}


