import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, Award, Mail, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DoctorsPage() {
    const supabase = await createClient()

    const { data: doctors } = await supabase
        .from('doctors')
        .select(`
      *,
      profiles(full_name, role)
    `)

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Medical Staff</h1>
                    <p className="text-muted-foreground text-sm">Manage specialists and clinical availability</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors?.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow border-none bg-white">
                        <div className="h-2 bg-primary" />
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{(doctor.profiles as any)?.full_name}</CardTitle>
                                    <Badge variant="outline" className="mt-1">{doctor.specialization}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award className="h-4 w-4" />
                                    <span>Senior Consultant</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail className="h-4 w-4" />
                                    <span>hospital-staff@example.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium text-slate-700">Mon, Wed, Fri (09:00 - 17:00)</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                                    View Schedule
                                </button>
                                <button className="flex-1 border border-slate-200 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!doctors || doctors.length === 0) && (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed">
                        <Stethoscope className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">No doctors have been registered in the system.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
