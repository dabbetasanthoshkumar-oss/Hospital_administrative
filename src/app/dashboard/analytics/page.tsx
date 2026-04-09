 'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users, CalendarCheck, TrendingUp, IndianRupee,
    Activity, CheckCircle2, Clock, XCircle, Stethoscope,
    Sparkles, AlertCircle, Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { RoleGuard } from '@/components/role-guard'
import { getHospitalInsightsAction } from '../ai-actions'
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
    const [patientCount, setPatientCount] = useState<number>(0)
    const [appCount, setAppCount] = useState<number>(0)
    const [doctorCount, setDoctorCount] = useState<number>(0)
    const [billingData, setBillingData] = useState<any[]>([])
    const [recentAppointments, setRecentAppointments] = useState<any[]>([])
    const [apptByStatus, setApptByStatus] = useState<any[]>([])
    const [topDoctors, setTopDoctors] = useState<any[]>([])
    const [aiInsights, setAiInsights] = useState<any[]>([])
    const [healthScore, setHealthScore] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )

                const [
                    patientsRes,
                    appsRes,
                    doctorsRes,
                    billingRes,
                    recentRes,
                    apptStatusRes,
                    topDocsRes,
                    insightsRes
                ] = await Promise.all([
                    supabase.from('patients').select('*', { count: 'exact', head: true }),
                    supabase.from('appointments').select('*', { count: 'exact', head: true }),
                    supabase.from('doctors').select('*', { count: 'exact', head: true }),
                    supabase.from('billing').select('total_amount, created_at').eq('payment_status', 'paid'),
                    supabase.from('appointments').select('*, patients(full_name)').order('created_at', { ascending: false }).limit(6),
                    supabase.from('appointments').select('status'),
                    supabase.from('doctors').select('id, specialization, profiles(full_name)').limit(5),
                    getHospitalInsightsAction()
                ])

                setPatientCount(patientsRes.count ?? 0)
                setAppCount(appsRes.count ?? 0)
                setDoctorCount(doctorsRes.count ?? 0)
                setBillingData(billingRes.data || [])
                setRecentAppointments(recentRes.data || [])
                setApptByStatus(apptStatusRes.data || [])
                setTopDoctors(topDocsRes.data || [])
                
                if (insightsRes.success) {
                    setAiInsights(insightsRes.data.insights)
                    setHealthScore(insightsRes.data.health_score)
                }
            } catch (err) {
                console.error('Failed to load analytics:', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const totalRevenue = billingData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) ?? 0
    const scheduled = apptByStatus?.filter(a => a.status === 'scheduled').length ?? 0
    const completed = apptByStatus?.filter(a => a.status === 'completed').length ?? 0
    const cancelled = apptByStatus?.filter(a => a.status === 'cancelled').length ?? 0

    // Prepare chart data
    const revenueData = [
        { name: 'Mon', revenue: totalRevenue * 0.1 },
        { name: 'Tue', revenue: totalRevenue * 0.15 },
        { name: 'Wed', revenue: totalRevenue * 0.12 },
        { name: 'Thu', revenue: totalRevenue * 0.25 },
        { name: 'Fri', revenue: totalRevenue * 0.2 },
        { name: 'Sat', revenue: totalRevenue * 0.1 },
        { name: 'Sun', revenue: totalRevenue * 0.08 },
    ]

    const statusData = [
        { name: 'Scheduled', value: scheduled },
        { name: 'Completed', value: completed },
        { name: 'Cancelled', value: cancelled },
    ]

    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase italic">PERFORMANCE <span className="text-primary NOT-italic">ANALYTICS</span></h1>
                        <p className="text-blue-100/60 font-medium">Strategic health metrics and operational AI insights</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-blue-100/30 uppercase tracking-[0.2em] mb-1">Hospital Health Score</div>
                        <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">{healthScore}%</div>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Total Patients" value={patientCount?.toString() ?? '0'} sub="Clinical Population" icon={Users} color="text-primary" bg="bg-primary/20" />
                    <StatsCard title="Growth Trend" value="+12%" sub="Since last month" icon={TrendingUp} color="text-cyan-400" bg="bg-cyan-500/20" />
                    <StatsCard title="Gross Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Strategic Intake" icon={IndianRupee} color="text-emerald-400" bg="bg-emerald-500/20" />
                    <StatsCard title="Medical Staff" value={doctorCount?.toString() ?? '0'} sub="Active Practitioners" icon={Stethoscope} color="text-amber-400" bg="bg-amber-500/20" />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2 glass-card border-none p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Revenue Velocity (Weekly)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#ffffff20" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#3b82f6' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card */}
                    <Card className="glass-card border-none p-6 flex flex-col">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Clinical AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4 flex-1">
                            {aiInsights.map((insight) => (
                                <div key={insight.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                    <p className="text-[10px] font-black uppercase text-blue-100/40 mb-1 flex items-center gap-2">
                                        {insight.type === 'positive' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                                        {insight.type === 'warning' && <AlertCircle className="h-3 w-3 text-amber-400" />}
                                        {insight.type === 'info' && <Activity className="h-3 w-3 text-blue-400" />}
                                        {insight.title}
                                    </p>
                                    <p className="text-xs text-blue-100/60 leading-relaxed">{insight.content}</p>
                                </div>
                            ))}
                            {aiInsights.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Generating Strategy...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Status Pie Chart */}
                    <Card className="glass-card border-none p-6">
                         <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                Appointment Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[250px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 ml-8 shrink-0">
                                {statusData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                        <span className="text-[10px] font-black text-blue-100/60 uppercase tracking-widest">{entry.name}</span>
                                        <span className="text-[10px] font-black text-white ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Mini-Table */}
                    <Card className="glass-card border-none p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xs font-black text-blue-100/40 uppercase tracking-widest">Recent Clinical Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-3">
                            {recentAppointments.map((app) => (
                                <div key={app.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                                        {(app.patients as any)?.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{(app.patients as any)?.full_name}</p>
                                        <p className="text-[10px] text-blue-100/30 uppercase font-black">{app.status}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-white/5 border-none text-[8px] text-blue-100/40 uppercase font-black tracking-widest">
                                        {new Date(app.appointment_date).toLocaleDateString()}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
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
