import { useState, useEffect } from 'react'
import { Calendar, Users, ClipboardList, Activity, Stethoscope, Clock, ChevronRight, PlusCircle, Search, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/auth-context'
import { createClient } from '@/lib/supabase-client'
import { ConsultationModal } from '@/components/consultation/consultation-modal'

export function DoctorDashboard() {
    const { profile } = useAuth()
    const [appointments, setAppointments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [isConsultOpen, setIsConsultOpen] = useState(false)

    useEffect(() => {
        const loadAppointments = async () => {
            if (!profile?.id) return
            
            const supabase = createClient()
            const { data, error } = await supabase
                .from('appointments')
                .select('*, patient:patients(full_name, patient_id)')
                .eq('doctor_id', profile.id)
                .order('appointment_date', { ascending: true })
                .limit(10)
            
            if (!error) {
                setAppointments(data || [])
            }
            setIsLoading(false)
        }

        loadAppointments()
    }, [profile?.id])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header ... */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Clinical Mode Active</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">My <span className="text-emerald-400">Practice</span></h1>
                    <p className="text-blue-100/40 font-medium">Monitoring scheduled consultations and patient outcomes</p>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 glass-card border-none bg-white/2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Encounter Queue</CardTitle>
                            <p className="text-[10px] font-bold text-blue-100/20 uppercase tracking-widest mt-1">
                                {appointments.filter(a => a.status === 'scheduled').length} Appointments Pending
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : appointments.map((appt, i) => (
                            <div key={appt.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-[10px]">
                                        {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">{(appt.patient as any)?.full_name}</p>
                                        <p className="text-[10px] text-blue-100/30 font-bold uppercase tracking-widest">{(appt.patient as any)?.patient_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className={`
                                        rounded-lg font-black text-[8px] tracking-widest px-2.5 py-1 border-none uppercase
                                        ${appt.status === 'scheduled' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}
                                    `}>
                                        {appt.status}
                                    </Badge>
                                    {appt.status === 'scheduled' && (
                                        <Button 
                                            onClick={() => {
                                                setSelectedAppointment(appt)
                                                setIsConsultOpen(true)
                                            }}
                                            className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all jelly"
                                        >
                                            <Play className="h-3 w-3 mr-2" />
                                            Consult
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Sidebar Actions ... */}
                <div className="space-y-6">
                    <Card className="glass-card border-none bg-emerald-500/5">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <button className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 transition-all text-left group">
                                <PlusCircle className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">New Appointment</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedAppointment && (
                <ConsultationModal 
                    isOpen={isConsultOpen}
                    onClose={() => {
                        setIsConsultOpen(false)
                        setSelectedAppointment(null)
                    }}
                    appointmentId={selectedAppointment.id}
                    patientId={selectedAppointment.patient_id}
                    doctorId={profile?.id || ''}
                    patientName={(selectedAppointment.patient as any)?.full_name || 'Patient'}
                />
            )}
        </div>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`animate-spin ${props.className}`}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
