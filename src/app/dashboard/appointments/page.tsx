'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppointmentForm } from './appointment-form'

export default function AppointmentsPage() {
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                
                const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
                    supabase.from('patients').select('id, full_name'),
                    supabase.from('doctors').select('id, specialization, profiles(full_name)'),
                    supabase.from('appointments').select('*,patients(full_name, patient_id),doctors(specialization, profiles(full_name))').order('appointment_date', { ascending: true })
                ])
                
                setPatients(patientsRes.data || [])
                setDoctors(doctorsRes.data || [])
                setAppointments(appointmentsRes.data || [])
            } catch (error) {
                console.error('Failed to load appointments data:', error)
            }
        }
        loadData()
    }, [])

    const patientsData = (patients || []) as { id: string; full_name: string }[]
    const doctorsData = (doctors || []) as any[]

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Appointments</h1>
                <p className="text-blue-100/60 font-medium">Manage clinical schedule and patient consultations</p>
            </header>

            <div className="grid gap-10 lg:grid-cols-5">
                {/* Booking Form (Client Component) */}
                <AppointmentForm patients={patientsData} doctors={doctorsData} />

                {/* Appointments List */}
                <Card className="lg:col-span-3 glass-card border-none">
                    <CardHeader className="pt-10 px-8">
                        <CardTitle className="text-2xl font-bold text-white uppercase tracking-tight">Active Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <div className="space-y-5">
                            {appointments?.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between p-5 glass-card bg-white/5 border-none hover:bg-white/10 transition-colors group jelly">
                                    <div>
                                        <p className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{(app.patients as any)?.full_name}</p>
                                        <p className="text-xs font-medium text-blue-100/40">
                                            with Dr. {(app.doctors as any)?.profiles?.full_name} • <span className="text-blue-100/60 font-bold">{new Date(app.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`
                                        rounded-lg font-black text-[9px] tracking-widest px-2.5 py-1 border-none shadow-lg shadow-black/20 uppercase
                                        ${app.status === 'scheduled' ? 'bg-primary/20 text-primary' :
                                            app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-red-500/20 text-red-400'}
                                    `}>
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                            {(!appointments || appointments.length === 0) && (
                                <div className="text-center py-24 opacity-20">
                                    <p className="font-black text-blue-100 uppercase tracking-[0.3em]">Timeline Empty</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
