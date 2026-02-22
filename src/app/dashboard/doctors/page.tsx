import { createAdminClient } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, Award, Mail, Calendar, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function DoctorsPage() {
    const supabase = createAdminClient()

    const { data: doctors } = await supabase
        .from('doctors')
        .select(`
      *,
      profiles(full_name, role)
    `)

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Medical Staff</h1>
                    <p className="text-blue-100/60 font-medium">Manage specialists and clinical availability</p>
                </div>
                <Link href="/dashboard/doctors/new">
                    <button className="px-6 py-3 glass-button jelly rounded-2xl flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                        <Plus className="h-4 w-4" />
                        Register Specialist
                    </button>
                </Link>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {doctors?.map((doctor) => (
                    <Card key={doctor.id} className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
                            <Stethoscope className="w-20 h-20" />
                        </div>
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-white/10 to-primary/20 flex items-center justify-center text-primary shadow-xl">
                                    <Stethoscope className="h-7 w-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white leading-none mb-2">{(doctor.profiles as any)?.full_name}</CardTitle>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-none rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                                        {doctor.specialization}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-blue-100/40 font-medium">
                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <span>Senior Consultant</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-blue-100/40 font-medium">
                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="truncate">hospital-staff@example.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-blue-100/40 font-medium">
                                    <div className="p-1.5 bg-white/5 rounded-lg">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-blue-100/70">Mon, Wed, Fri (09:00 - 17:00)</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button className="flex-1 glass-button h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
                                    Schedule
                                </button>
                                <Link href={`/dashboard/doctors/${doctor.id}`} className="flex-1 bg-white/5 hover:bg-white/10 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-100/40 transition-colors flex items-center justify-center">
                                    Profile
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!doctors || doctors.length === 0) && (
                    <div className="col-span-full text-center py-32 glass-card border-none">
                        <Stethoscope className="h-16 w-16 text-white/5 mx-auto mb-6" />
                        <p className="font-black text-blue-100/20 uppercase tracking-[0.2em]">Medical roster is empty</p>
                    </div>
                )}
            </div>
        </div>
    )
}
