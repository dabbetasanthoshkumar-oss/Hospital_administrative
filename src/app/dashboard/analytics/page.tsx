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
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Performance Analytics</h1>
                <p className="text-muted-foreground text-sm">Real-time overview of hospital metrics and growth</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Patients"
                    value={patientCount?.toString() || '0'}
                    description="+12% from last month"
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatsCard
                    title="Appointments"
                    value={appCount?.toString() || '0'}
                    description="32 scheduled today"
                    icon={CalendarCheck}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    description="Paid invoices only"
                    icon={IndianRupee}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatsCard
                    title="Growth Rate"
                    value="8.4%"
                    description="Weekly patient increase"
                    icon={TrendingUp}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-sm border-none bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Patient Growth Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50/50">
                            <p className="text-muted-foreground text-sm">Interactive Growth Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-sm border-none bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Clinical Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentAppointments?.map((app) => (
                                <div key={app.id} className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        {(app.patients as any)?.full_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{(app.patients as any)?.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {app.status}
                                        </p>
                                    </div>
                                    <div className="text-xs font-mono text-slate-400">
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

function StatsCard({ title, value, description, icon: Icon, color, bgColor }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-tight">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}
