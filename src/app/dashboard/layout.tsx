import { createClient } from '@/lib/supabase-server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Stethoscope,
    Pill,
    Receipt,
    Settings,
    ShieldAlert,
    TrendingUp
} from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Patients', icon: Users, href: '/dashboard/patients' },
        { label: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
        { label: 'Medical Records', icon: FileText, href: '/dashboard/records' },
        { label: 'Doctors', icon: Stethoscope, href: '/dashboard/doctors' },
        { label: 'Pharmacy', icon: Pill, href: '/dashboard/pharmacy' },
        { label: 'Billing', icon: Receipt, href: '/dashboard/billing' },
        { label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
        { label: 'Audit Logs', icon: ShieldAlert, href: '/dashboard/audit' },
    ]

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-72 glass-card m-4 mr-0 border-none hidden md:flex flex-col z-20 overflow-hidden">
                <div className="p-8 border-b border-white/10">
                    <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl jelly shadow-lg shadow-primary/20">
                            <Stethoscope className="h-6 w-6 text-white" />
                        </div>
                        HOPI SYNC
                    </h2>
                </div>
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-5 py-3.5 text-blue-100/70 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300 group jelly"
                        >
                            <item.icon className="h-5 w-5 group-hover:text-primary transition-colors" />
                            <span className="font-semibold tracking-tight">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t border-white/10 mt-auto">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-4 px-5 py-4 text-blue-100/70 hover:text-white hover:bg-white/5 rounded-2xl transition-all group bubble-bg"
                    >
                        <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="font-semibold">Control Center</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden p-4">
                <div className="flex-1 glass-card border-none overflow-y-auto p-8 relative">
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
