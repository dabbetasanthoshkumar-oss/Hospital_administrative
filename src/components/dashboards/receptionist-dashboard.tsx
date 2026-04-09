'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, Clock, UserPlus, Phone, Search, Bell, Activity, ChevronRight, UserCheck, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

export function ReceptionistDashboard() {
    const [patients, setPatients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchRecentPatients = async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('patients')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10)
                
                if (!error) {
                    setPatients(data || [])
                }
            } catch (err) {
                console.error('Error fetching patients:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecentPatients()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                        <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Front Desk Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Patient <span className="text-cyan-400">Admissions</span></h1>
                    <p className="text-blue-100/40 font-medium">Managing registrations, triage, and physician availability</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/patients/new">
                        <Button className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Quick Add Patient
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                {[
                    { label: 'Today Arrivals', value: '42', color: 'text-primary' },
                    { label: 'Pending Check-in', value: '8', color: 'text-amber-400' },
                    { label: 'Emergency Admissions', value: '3', color: 'text-rose-400' },
                    { label: 'Avg Wait-time', value: '14 min', color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-white/5 bg-white/2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/20 mb-2">{stat.label}</p>
                        <h3 className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Check-in Queue */}
                <Card className="lg:col-span-2 glass-card border-none bg-white/2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Recent Registrations</CardTitle>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-100/20 group-focus-within:text-cyan-400" />
                            <Input placeholder="Search Patients..." className="pl-9 h-9 w-48 glass-input border-none text-[10px] font-black rounded-xl" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-blue-100/20">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Accessing Records...</p>
                            </div>
                        ) : patients.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                <p className="text-sm font-bold text-blue-100/20">No recent admissions found</p>
                            </div>
                        ) : (
                            patients.map((patient) => (
                                <div key={patient.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all group cursor-pointer jelly">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex flex-col items-center justify-center font-black text-xs text-blue-100/20">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{patient.full_name}</p>
                                            <p className="text-[10px] text-blue-100/30 font-medium uppercase tracking-widest">ID: {patient.patient_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Badge variant="outline" className="rounded-lg font-black text-[8px] tracking-widest px-2.5 py-1 border-none uppercase bg-cyan-500/20 text-cyan-400">
                                            Registered
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-blue-100/10 group-hover:text-cyan-400 transition-all" />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Staff Availability */}
                <Card className="glass-card border-none bg-white/2">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/40">Clinician Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: 'Dr. Sarah', room: 'OPD-1', status: 'Busy' },
                            { name: 'Dr. John', room: 'OPD-2', status: 'Available' },
                            { name: 'Dr. Emily', room: 'OPD-3', status: 'In-Surgery' },
                            { name: 'Dr. Kevin', room: 'OPD-4', status: 'Lunch Break' },
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${doc.status === 'Available' ? 'bg-emerald-500 animate-pulse' : doc.status === 'Busy' ? 'bg-amber-500' : 'bg-white/20'}`} />
                                    <div>
                                        <p className="text-xs font-bold text-white">{doc.name}</p>
                                        <p className="text-[10px] text-blue-100/30 uppercase font-black">{doc.room}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${doc.status === 'Available' ? 'text-emerald-400' : 'text-blue-100/20'}`}>{doc.status}</span>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4 h-10 rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-blue-100/40 hover:text-white hover:bg-white/10">Full Availability Radar</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
