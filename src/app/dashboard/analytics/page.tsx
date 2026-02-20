import { createAdminClient } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users, CalendarCheck, TrendingUp, IndianRupee,
    Activity, CheckCircle2, Clock, XCircle, Stethoscope
} from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = createAdminClient()

    // Counts
    const [
        { count: patientCount },
        { count: appCount },
        { count: doctorCount },
        { data: billingData },
        { data: recentAppointments },
        { data: apptByStatus },
        { data: topDoctors }
    ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('billing').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('appointments').select('*, patients(full_name)').order('created_at', { ascending: false }).limit(6),
        supabase.from('appointments').select('status'),
        supabase.from('doctors').select('id, specialization, profiles(full_name)').limit(5),
    ])

    const totalRevenue = billingData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) ?? 0
    const scheduled = apptByStatus?.filter(a => a.status === 'scheduled').length ?? 0
    const completed = apptByStatus?.filter(a => a.status === 'completed').length ?? 0
    const cancelled = apptByStatus?.filter(a => a.status === 'cancelled').length ?? 0

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Performance Analytics</h1>
                <p className="text-blue-100/60 font-medium">Real-time hospital metrics and operational insights</p>
            </header>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Patients" value={patientCount?.toString() ?? '0'} sub="Registered" icon={Users} color="text-primary" bg="bg-primary/20" />
                <StatsCard title="Appointments" value={appCount?.toString() ?? '0'} sub={`${scheduled} active`} icon={CalendarCheck} color="text-cyan-400" bg="bg-cyan-500/20" />
                <StatsCard title="Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Paid invoices" icon={IndianRupee} color="text-emerald-400" bg="bg-emerald-500/20" />
                <StatsCard title="Doctors" value={doctorCount?.toString() ?? '0'} sub="On staff" icon={Stethoscope} color="text-amber-400" bg="bg-amber-500/20" />
            </div>

            {/* Appointment status breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatusCard label="Scheduled" value={scheduled} icon={Clock} color="text-primary" bg="bg-primary/10" total={appCount ?? 1} />
                <StatusCard label="Completed" value={completed} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" total={appCount ?? 1} />
                <StatusCard label="Cancelled" value={cancelled} icon={XCircle} color="text-red-400" bg="bg-red-500/10" total={appCount ?? 1} />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Recent Activity */}
                <Card className="lg:col-span-3 glass-card border-none">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/20 rounded-lg"><Activity className="h-4 w-4 text-primary" /></div>
                            Recent Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentAppointments?.map((app) => (
                                <div key={app.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-white/10 to-primary/20 flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0">
                                        {(app.patients as any)?.full_name?.charAt(0) ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{(app.patients as any)?.full_name}</p>
                                        <p className="text-xs text-blue-100/40 font-medium">
                                            {new Date(app.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg
                                        ${app.status === 'scheduled' ? 'bg-primary/20 text-primary'
                                            : app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/20 text-red-400'}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                            {!recentAppointments?.length && (
                                <p className="text-center py-12 text-blue-100/20 font-bold uppercase tracking-widest text-sm">No appointments yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Staff */}
                <Card className="lg:col-span-2 glass-card border-none">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-3 text-white">
                            <div className="p-2 bg-amber-500/20 rounded-lg"><Stethoscope className="h-4 w-4 text-amber-400" /></div>
                            Medical Staff
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topDoctors?.map((doc: any) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary/20 to-white/10 flex items-center justify-center flex-shrink-0">
                                        <Stethoscope className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{doc.profiles?.full_name}</p>
                                        <p className="text-[10px] text-blue-100/40 font-medium uppercase tracking-wider">{doc.specialization}</p>
                                    </div>
                                </div>
                            ))}
                            {!topDoctors?.length && (
                                <p className="text-center py-12 text-blue-100/20 font-bold uppercase tracking-widest text-sm">No doctors registered</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, sub, icon: Icon, color, bg }: any) {
    return (
        <Card className="glass-card border-none relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">{title}</CardTitle>
                <div className={`p-2 ${bg} rounded-xl`}><Icon className={`h-5 w-5 ${color}`} /></div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-white tracking-tight mb-1">{value}</div>
                <p className="text-xs text-blue-100/30 font-bold uppercase tracking-tight">{sub}</p>
            </CardContent>
        </Card>
    )
}

function StatusCard({ label, value, icon: Icon, color, bg, total }: any) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <Card className="glass-card border-none relative overflow-hidden">
            <CardContent className="pt-6 pb-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 ${bg} rounded-xl`}><Icon className={`h-5 w-5 ${color}`} /></div>
                    <span className="text-3xl font-black text-white">{value}</span>
                </div>
                <p className="text-xs font-black text-blue-100/40 uppercase tracking-widest">{label}</p>
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-blue-100/20 font-bold mt-1">{pct}% of total</p>
            </CardContent>
        </Card>
    )
}
