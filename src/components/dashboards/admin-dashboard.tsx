'use client'

import { TrendingUp, Users, Calendar, Activity, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Command</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Hospital <span className="text-primary">Overview</span></h1>
                <p className="text-blue-100/40 font-medium">Enterprise resource monitoring & system performance</p>
            </header>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Patients', value: '12,842', trend: '+12%', icon: Users, color: 'text-primary' },
                    { label: 'Revenue (MTD)', value: '$452,000', trend: '+8.4%', icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Active Staff', value: '124', trend: 'Stable', icon: Activity, color: 'text-blue-400' },
                    { label: 'Occupancy', value: '88%', trend: '+4%', icon: Calendar, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 relative overflow-hidden group hover:bg-white/5 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="h-12 w-12" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/30 mb-3">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                            <span className={`${stat.color} text-[10px] font-bold`}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 glass-card border-none bg-white/2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">System Audit Logs</CardTitle>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors">View All</button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { user: 'Dr. Sarah', action: 'Modified Prescription', time: '2m ago', icon: Clock },
                                { user: 'Receptionist John', action: 'New Patient Registered', time: '15m ago', icon: Users },
                                { user: 'System', action: 'Backup Successful', time: '1h ago', icon: ShieldCheck },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <log.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{log.action}</p>
                                            <p className="text-[10px] text-blue-100/30 font-medium">{log.user}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-tighter">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <Card className="glass-card border-none bg-primary/5 border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Critical Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-rose-400">Inventory Shortage</p>
                                    <p className="text-[10px] text-rose-400/60 mt-1 uppercase tracking-tight">Insulin reserves below 5%</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <Activity className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-400">Network Performance</p>
                                    <p className="text-[10px] text-blue-400/60 mt-1 uppercase tracking-tight">Server latency stable at 42ms</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
