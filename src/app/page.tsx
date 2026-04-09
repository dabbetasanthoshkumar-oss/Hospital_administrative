'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Activity,
    BarChart3,
    Clock,
    Heart,
    Pill,
    Stethoscope,
    Users,
    Shield,
    Zap,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    FileText,
    Calendar,
    Bell
} from 'lucide-react'

const features = [
    {
        icon: Users,
        title: 'Multi-Role Management',
        description: 'Support for Admin, Doctors, Receptionists, Pharmacists, and Patients',
        color: 'text-blue-600'
    },
    {
        icon: Calendar,
        title: 'Smart Scheduling',
        description: 'Intelligent appointment booking and management system',
        color: 'text-emerald-600'
    },
    {
        icon: FileText,
        title: 'Medical Records',
        description: 'Comprehensive patient health records and history tracking',
        color: 'text-purple-600'
    },
    {
        icon: Pill,
        title: 'Prescription Management',
        description: 'Digital prescriptions with pharmacy integration',
        color: 'text-amber-600'
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Real-time business intelligence and reporting',
        color: 'text-cyan-600'
    },
    {
        icon: Shield,
        title: 'HIPAA Compliance',
        description: 'Secure data handling and role-based access control',
        color: 'text-red-600'
    }
]

const stats = [
    { label: 'Users', value: '5+', icon: Users },
    { label: 'Modules', value: '8+', icon: Zap },
    { label: 'Security', value: 'HIPAA', icon: Shield },
    { label: 'Uptime', value: '99.9%', icon: Activity }
]

export default function Home() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg' 
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            HOPI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">SYNC</span>
                        </h1>
                    </div>
                    <Link
                        href="/login"
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                    >
                        Sign In
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 h-80 w-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                            Healthcare Administration Built Modern
                        </span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-4">
                        <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                            Hospital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Administration</span>
                        </h2>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-600 dark:text-slate-400">
                            Simplified. Streamlined. Secure.
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Comprehensive healthcare management platform designed for hospitals and clinics. Manage patients, appointments, prescriptions, and operations all in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-lg transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 group"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-8 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            Learn More
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-white dark:border-slate-700">
                                <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/20 dark:border-slate-800/20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Everything your hospital needs to operate efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/20 dark:border-slate-700/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-8"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`p-4 rounded-lg ${feature.color} text-white w-fit bg-opacity-10 mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            Multiple Roles
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            Tailored dashboards for each role
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { role: 'Administrator', icon: Shield, color: 'from-blue-600 to-blue-700' },
                            { role: 'Doctor', icon: Stethoscope, color: 'from-emerald-600 to-emerald-700' },
                            { role: 'Receptionist', icon: Bell, color: 'from-cyan-600 to-cyan-700' },
                            { role: 'Pharmacist', icon: Pill, color: 'from-amber-600 to-amber-700' },
                            { role: 'Patient', icon: Heart, color: 'from-rose-600 to-rose-700' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 text-center animate-in fade-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {item.role}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-5xl font-black tracking-tight">
                        Ready to Transform Your Hospital?
                    </h2>
                    <p className="text-lg opacity-90 font-medium">
                        Join hospitals worldwide using HOPI SYNC for efficient operations
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg group"
                    >
                        Sign In Now
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/20 dark:border-slate-800/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <span className="font-black text-slate-900 dark:text-white">HOPI SYNC</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Modern healthcare management platform
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Compliance</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/20 dark:border-slate-800/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                        <p>© 2024-2026 HOPI SYNC. All rights reserved.</p>
                        <p>HIPAA Compliant • Secure • Reliable</p>
                    </div>
                </div>
            </footer>

            {/* Global animation styles */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main> */}
    </div>
  );
}
