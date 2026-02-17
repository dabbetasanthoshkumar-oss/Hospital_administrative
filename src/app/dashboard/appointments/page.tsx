import { createClient } from '@/lib/supabase-server'
import { createAppointment } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AppointmentsPage() {
    const supabase = await createClient()

    // Fetch patients and doctors for selection
    const { data: patients } = await supabase.from('patients').select('id, full_name')
    const { data: doctors } = await supabase.from('doctors').select('id, specialization, profiles(full_name)')

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
      *,
      patients(full_name, patient_id),
      doctors(specialization, profiles(full_name))
    `)
        .order('appointment_date', { ascending: true })

    const patientsData = (patients || []) as { id: string; full_name: string }[]
    const doctorsData = (doctors || []) as any[]

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Appointments</h1>
                <p className="text-blue-100/60 font-medium">Manage clinical schedule and patient consultations</p>
            </header>

            <div className="grid gap-10 lg:grid-cols-5">
                {/* Booking Form */}
                <Card className="lg:col-span-2 glass-card border-none self-start relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    <CardHeader className="pt-10 px-8">
                        <CardTitle className="text-2xl font-bold text-white uppercase tracking-tight">Schedule Node</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form
                            action={async (formData: FormData) => {
                                'use server'
                                await createAppointment(formData)
                            }}
                            className="space-y-6"
                        >
                            <div className="space-y-2.5">
                                <Label htmlFor="patient_id" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Select Patient</Label>
                                <select
                                    id="patient_id"
                                    name="patient_id"
                                    required
                                    className="flex h-14 w-full rounded-2xl border-none glass-input bg-transparent px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#0a0f1e]">Choose Patient Protocol</option>
                                    {patientsData.map(p => <option key={p.id} value={p.id} className="bg-[#0a0f1e]">{p.full_name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="doctor_id" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Assign Specialist</Label>
                                <select
                                    id="doctor_id"
                                    name="doctor_id"
                                    required
                                    className="flex h-14 w-full rounded-2xl border-none glass-input bg-transparent px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#0a0f1e]">Assign MD</option>
                                    {doctorsData.map(d => (
                                        <option key={d.id} value={d.id} className="bg-[#0a0f1e]">
                                            {d.profiles?.full_name} ({d.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="appointment_date" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Chronology Set</Label>
                                <Input
                                    id="appointment_date"
                                    name="appointment_date"
                                    type="datetime-local"
                                    required
                                    className="h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl px-4"
                                />
                            </div>

                            <button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 mt-4">
                                Book Appointment
                            </button>
                        </form>
                    </CardContent>
                </Card>

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
