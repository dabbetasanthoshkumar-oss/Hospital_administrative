'use client'

import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
    TrendingUp,
    Menu,
    X
} from 'lucide-react'

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    // Auth guard
    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.replace('/login')
        })
    }, [])

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl jelly shadow-lg shadow-primary/20 flex-shrink-0">
                        <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                    HOPI SYNC
                </h2>
                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 text-blue-100/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group jelly text-sm font-semibold tracking-tight
                                ${isActive
                                    ? 'bg-primary/20 text-white'
                                    : 'text-blue-100/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Settings */}
            <div className="p-4 border-t border-white/10">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-blue-100/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all group text-sm font-semibold"
                >
                    <Settings className="h-4 w-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-500" />
                    Control Center
                </Link>
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — Desktop: always visible, Mobile: slide-in drawer */}
            <aside className={`
                fixed md:relative top-0 left-0 h-full md:h-auto
                w-64 glass-card border-none flex flex-col z-40 overflow-hidden
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:m-4 md:mr-0
            `}>
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden p-2 sm:p-4">
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center gap-3 p-3 mb-2 glass-card rounded-2xl border-none flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-blue-100/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary rounded-lg">
                            <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-black tracking-tight text-white text-sm">HOPI SYNC</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card border-none overflow-y-auto p-4 sm:p-6 lg:p-8 relative rounded-2xl">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
