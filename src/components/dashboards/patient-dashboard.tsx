'use client'

import { useState, useEffect } from 'react'
import { Calendar, FileText, Heart, Activity, Pill, Bell, ChevronRight, Download, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/components/auth-context'
import { getSmartHealthTipsAction } from '@/app/dashboard/ai-actions'
import { format } from 'date-fns'

export function PatientDashboard() {
    const { user } = useAuth()
    const supabase = createClient()
    const [patientData, setPatientData] = useState<any>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    const [records, setRecords] = useState<any[]>([])
    const [prescriptions, setPrescriptions] = useState<any[]>([])
    const [aiTips, setAiTips] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchPatientData()
        }
    }, [user])

    async function fetchPatientData() {
        setLoading(true)
        try {
            // 1. Get patient profile
            const { data: patient, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user?.id)
                .single()

            if (pError) throw pError
            setPatientData(patient)

            // 2. Get appointments
            const { data: appts } = await supabase
                .from('appointments')
                .select(`
                    *,
                    doctor:profiles!appointments_doctor_id_fkey(full_name)
                `)
                .eq('patient_id', patient.id)
                .order('appointment_date', { ascending: true })
                .limit(5)

            setAppointments(appts || [])

            // 3. Get medical records
            const { data: recs } = await supabase
                .from('medical_records')
                .select(`
                    *,
                    doctor:profiles!medical_records_doctor_id_fkey(full_name)
                `)
                .eq('patient_id', patient.id)
                .order('created_at', { ascending: false })

            setRecords(recs || [])

            // 4. Get prescriptions
            const { data: pxs } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('patient_id', patient.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            setPrescriptions(pxs || [])

            // 5. Get AI Tips
            const tipsRes = await getSmartHealthTipsAction(patient.id)
            if (tipsRes.success) {
                setAiTips(tipsRes.data || [])
            }

        } catch (error) {
            console.error('Error fetching patient dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-blue-100/20">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic">Synchronizing Health Data...</p>
            </div>
        )
    }

    const nextAppt = appointments.find(a => new Date(a.appointment_date) > new Date())

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
                        <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-100/40">Patient Wellness Hub</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                        Welcome back, <span className="text-primary italic">{patientData?.full_name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-blue-100/40 font-medium">Accessing your medical records and personalized care journey</p>
                </div>
            </header>

            {/* Health Pulse Stat Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Overall Health Status</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-4xl font-black text-white">Optimal</h3>
                        <span className="text-emerald-400 text-xs font-bold font-mono tracking-tighter">+2% Recovery</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[84%] bg-primary shadow-[0_0_15px_rgba(42,167,236,0.6)]" />
                    </div>
                </div>
                
                <div className="glass-card p-6 border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/20 mb-3">Next Scheduled Visit</p>
                    {nextAppt ? (
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
                                <span className="text-[10px] font-black text-primary uppercase leading-none">
                                    {format(new Date(nextAppt.appointment_date), 'MMM')}
                                </span>
                                <span className="text-lg font-black text-white leading-none mt-1">
                                    {format(new Date(nextAppt.appointment_date), 'dd')}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white tracking-tight">{nextAppt.reason}</p>
                                <p className="text-[10px] text-blue-100/30 font-medium uppercase tracking-widest mt-0.5">
                                    {nextAppt.doctor?.full_name} · {format(new Date(nextAppt.appointment_date), 'hh:mm a')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-blue-100/20 font-bold uppercase tracking-widest">No upcoming visits</p>
                    )}
                </div>

                <div className="glass-card p-6 border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/20 mb-3">Pending Medications</p>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter">{prescriptions.length}</h3>
                            <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest mt-0.5">Awaiting Pharmacy</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Timeline and History */}
                <Card className="lg:col-span-3 glass-card border-none bg-white/2">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Medical History</CardTitle>
                        <Button variant="ghost" className="h-8 px-4 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 rounded-xl">Secure Access</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {records.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                <p className="text-sm font-bold text-blue-100/20">Your medical timeline begins here</p>
                            </div>
                        ) : (
                            records.map((record, i) => (
                                <div key={record.id} className="relative pl-8 group">
                                    {i !== records.length - 1 && <div className="absolute left-3 top-6 bottom-[-24px] w-[1px] bg-white/5 group-hover:bg-primary/20 transition-colors" />}
                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white/5 border border-white/10 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group/item cursor-pointer">
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{record.diagnosis}</p>
                                            <p className="text-[10px] text-blue-100/30 font-medium uppercase tracking-widest">
                                                {record.doctor?.full_name} · {record.symptoms?.slice(0, 30)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <p className="text-[11px] font-black font-mono text-blue-100/20">{format(new Date(record.created_at), 'MMM dd, yyyy')}</p>
                                            <Download className="h-4 w-4 text-blue-100/10 group-hover/item:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* AI Suggestions Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-card border-none bg-primary/10 overflow-hidden relative border border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Intelligence Hub
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {aiTips.length > 0 ? (
                                aiTips.map((tip, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/40 transition-colors">
                                        <p className="text-xs font-bold text-white mb-2 leading-none italic tracking-tight uppercase tracking-wider group-hover:text-primary transition-colors">Personalized Recommendation</p>
                                        <p className="text-xs text-blue-100/60 leading-relaxed font-medium">{tip}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-blue-100/40 text-center py-4">Our clinical engine is analyzing your latest records to provide tailored health insights.</p>
                            )}
                        </CardContent>
                        <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-primary/20 blur-2xl rounded-full" />
                    </Card>

                    <Card className="glass-card border-none bg-white/2">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/40">Active Medications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {prescriptions.length === 0 ? (
                                <p className="text-xs text-blue-100/20 text-center py-4 font-black uppercase tracking-widest">No active prescriptions</p>
                            ) : (
                                prescriptions.map((px) => (
                                    <div key={px.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-rose-500/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                                                <Pill className="h-4 w-4 text-rose-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-none">{px.medicine_name}</p>
                                                <p className="text-[10px] text-blue-100/30 uppercase font-black tracking-widest mt-1">{px.instructions}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-none rounded-lg text-[8px] font-black uppercase tracking-widest">Ongoing</Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
