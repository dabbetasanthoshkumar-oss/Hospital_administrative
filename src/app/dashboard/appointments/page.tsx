import { createClient } from '@/lib/supabase-server'
import { createAppointment } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

    return (
        <div className="p-8">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Booking Form */}
                <Card className="lg:col-span-1 shadow-md self-start">
                    <CardHeader>
                        <CardTitle>Schedule Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createAppointment} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">Patient</Label>
                                <select id="patient_id" name="patient_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <option value="">Select Patient</option>
                                    {patients?.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="doctor_id">Doctor</Label>
                                <select id="doctor_id" name="doctor_id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <option value="">Select Doctor</option>
                                    {doctors?.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {(d.profiles as any)?.full_name} ({d.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="appointment_date">Date & Time</Label>
                                <Input id="appointment_date" name="appointment_date" type="datetime-local" required />
                            </div>

                            <Button type="submit" className="w-full">Book Appointment</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card className="lg:col-span-2 shadow-md">
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {appointments?.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-primary">{(app.patients as any)?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            with Dr. {(app.doctors as any)?.profiles?.full_name} • {new Date(app.appointment_date).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                            app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {app.status}
                                    </div>
                                </div>
                            ))}
                            {(!appointments || appointments.length === 0) && (
                                <p className="text-center py-8 text-muted-foreground">No appointments scheduled.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
