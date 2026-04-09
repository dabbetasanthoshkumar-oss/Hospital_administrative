'use client'

import { useAuth, UserRole } from '@/components/auth-context'
import { Badge } from '@/components/ui/badge'
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
    X,
    Activity
} from 'lucide-react'

interface NavItem {
    label: string
    icon: any
    href: string
    allowedRoles?: UserRole[]
}

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Patients', icon: Users, href: '/dashboard/patients', allowedRoles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/appointments', allowedRoles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
    { label: 'Medical Records', icon: FileText, href: '/dashboard/records', allowedRoles: ['admin', 'doctor', 'nurse', 'patient'] },
    { label: 'Lab Reports', icon: Activity, href: '/dashboard/labs', allowedRoles: ['admin', 'doctor', 'nurse', 'patient'] },
    { label: 'Doctors', icon: Stethoscope, href: '/dashboard/doctors', allowedRoles: ['admin'] },
    { label: 'Pharmacy', icon: Pill, href: '/dashboard/pharmacy', allowedRoles: ['admin', 'pharmacist'] },
    { label: 'Billing', icon: Receipt, href: '/dashboard/billing', allowedRoles: ['admin', 'receptionist'] },
    { label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics', allowedRoles: ['admin'] },
    { label: 'Audit Logs', icon: ShieldAlert, href: '/dashboard/audit', allowedRoles: ['admin'] },
]

import { Chatbot } from '@/components/ai/chatbot'
import { NotificationsMenu } from '@/components/notifications-menu'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, profile, isLoading, hasPermission } = useAuth()

    // Auth guard
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login')
        }
    }, [user, isLoading, router])

    const filteredNavItems = navItems.filter(item => 
        !item.allowedRoles || hasPermission(item.allowedRoles)
    )

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
                {filteredNavItems.map((item) => {
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

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-white/10 space-y-2">
                {profile && (
                    <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/30 mb-1">Active Persona</p>
                        <p className="text-white font-bold text-sm truncate">{profile.full_name}</p>
                        <Badge variant="outline" className="mt-2 bg-primary/20 text-primary border-none text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg">
                            {profile.role}
                        </Badge>
                    </div>
                )}
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
                <div className="md:hidden flex items-center justify-between p-3 mb-2 glass-card rounded-2xl border-none flex-shrink-0">
                    <div className="flex items-center gap-3">
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
                            <span className="font-black tracking-tight text-white text-sm uppercase">Hopi Sync</span>
                        </div>
                    </div>
                    <NotificationsMenu />
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card border-none overflow-y-auto relative rounded-2xl flex flex-col">
                    {/* Floating Header Desktop */}
                    <header className="hidden md:flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#090e1a]/40 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-[0.2em]">Clinical Hub</span>
                            <span className="text-white/20">/</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{pathname.split('/').pop() || 'Dashboard'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationsMenu />
                            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-lg shadow-primary/5">
                                {profile?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </header>

                    <div className="p-4 sm:p-6 lg:p-8 relative flex-1">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
            <Chatbot />
        </div>
    )
}
