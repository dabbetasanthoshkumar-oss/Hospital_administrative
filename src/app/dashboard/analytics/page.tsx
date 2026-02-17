import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    CalendarCheck,
    TrendingUp,
    IndianRupee,
    Activity
} from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()

    // High-level stats
    const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true })
    const { count: appCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true })

    const { data: billingData } = await supabase
        .from('billing')
        .select('total_amount')
        .eq('payment_status', 'paid')

    const totalRevenue = billingData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0

    const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('*, patients(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Performance Analytics</h1>
                <p className="text-blue-100/60 font-medium">Real-time overview of hospital metrics and growth</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Patients"
                    value={patientCount?.toString() || '0'}
                    description="+12% from last month"
                    icon={Users}
                    color="text-primary"
                />
                <StatsCard
                    title="Appointments"
                    value={appCount?.toString() || '0'}
                    description="32 scheduled today"
                    icon={CalendarCheck}
                    color="text-cyan-400"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    description="Paid invoices only"
                    icon={IndianRupee}
                    color="text-emerald-400"
                />
                <StatsCard
                    title="Growth Rate"
                    value="8.4%"
                    description="Weekly patient increase"
                    icon={TrendingUp}
                    color="text-amber-400"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
                <Card className="lg:col-span-4 glass-card border-none overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            Patient Growth Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                            <p className="text-blue-100/30 font-bold uppercase tracking-widest text-sm">Interactive Growth Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Recent Clinical Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentAppointments?.map((app) => (
                                <div key={app.id} className="flex items-center gap-5 p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-white/10 to-primary/20 flex items-center justify-center text-white font-black shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                                        {(app.patients as any)?.full_name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white leading-none mb-1">{(app.patients as any)?.full_name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-blue-100/50 font-medium">
                                                {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black tracking-tighter text-blue-100/20">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, description, icon: Icon, color }: any) {
    return (
        <Card className="glass-card border-none relative overflow-hidden group jelly">
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">{title}</CardTitle>
                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black text-white tracking-tight mb-2">{value}</div>
                <p className="text-xs text-blue-100/30 font-bold">{description}</p>
            </CardContent>
            {/* Decorative bubble effect */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </Card>
    )
}
