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
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Stethoscope className="h-6 w-6" />
                        HospiSys
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors group"
                        >
                            <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t mt-auto">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
