import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Dashboard</h1>
                    <p className="text-blue-100/60 font-medium">Monitoring system health and patient care</p>
                </div>
                <div className="flex items-center gap-6 p-2 pr-6 glass-card border-none rounded-full h-16">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                        {profile?.full_name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm leading-tight">
                            {profile?.full_name}
                        </span>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest">
                            {profile?.role}
                        </span>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-8 border-none relative overflow-hidden group jelly">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                        <TrendingUp className="w-12 h-12" />
                    </div>
                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Total Overview</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">128</span>
                        <span className="text-emerald-400 text-sm font-bold">+12%</span>
                    </div>
                    <p className="text-blue-100/40 text-sm mt-2 font-medium">System activity since last week</p>
                </div>
            </div>
        </div>
    )
}

