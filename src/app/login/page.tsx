'use client'

import { useActionState, useState } from 'react'
import { login } from './actions'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Bubbles from '@/components/bubbles'
import {
    ShieldCheck,
    Activity,
    Loader2,
    Lock,
    Mail,
    ChevronRight,
    Stethoscope,
    Heart,
    Pill,
    UserPlus,
    ArrowLeft,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Zap
} from 'lucide-react'

type AuthRole = 'admin' | 'doctor' | 'pharmacist' | 'receptionist' | 'patient'

const ROLE_CONFIG: Record<AuthRole, {
    label: string,
    description: string,
    icon: any,
    color: string,
    bgLight: string,
    darkBg: string,
    borderColor: string,
    accentColor: string,
    placeholder: string
}> = {
    admin: {
        label: 'Administrator',
        description: 'Hospital System Manager',
        icon: ShieldCheck,
        color: 'text-blue-600 dark:text-blue-400',
        bgLight: 'bg-blue-50 dark:bg-blue-950/30',
        darkBg: 'bg-blue-500',
        borderColor: 'border-blue-200 dark:border-blue-800',
        accentColor: 'bg-blue-500/20 dark:bg-blue-500/10',
        placeholder: 'admin@hospital.com'
    },
    doctor: {
        label: 'Doctor',
        description: 'Medical Professional',
        icon: Stethoscope,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
        darkBg: 'bg-emerald-500',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        accentColor: 'bg-emerald-500/20 dark:bg-emerald-500/10',
        placeholder: 'doctor@hospital.com'
    },
    receptionist: {
        label: 'Receptionist',
        description: 'Front Desk Staff',
        icon: UserPlus,
        color: 'text-cyan-600 dark:text-cyan-400',
        bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
        darkBg: 'bg-cyan-500',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        accentColor: 'bg-cyan-500/20 dark:bg-cyan-500/10',
        placeholder: 'receptionist@hospital.com'
    },
    pharmacist: {
        label: 'Pharmacist',
        description: 'Pharmacy Staff',
        icon: Pill,
        color: 'text-amber-600 dark:text-amber-400',
        bgLight: 'bg-amber-50 dark:bg-amber-950/30',
        darkBg: 'bg-amber-500',
        borderColor: 'border-amber-200 dark:border-amber-800',
        accentColor: 'bg-amber-500/20 dark:bg-amber-500/10',
        placeholder: 'pharmacist@hospital.com'
    },
    patient: {
        label: 'Patient',
        description: 'Patient Portal',
        icon: Heart,
        color: 'text-rose-600 dark:text-rose-400',
        bgLight: 'bg-rose-50 dark:bg-rose-950/30',
        darkBg: 'bg-rose-500',
        borderColor: 'border-rose-200 dark:border-rose-800',
        accentColor: 'bg-rose-500/20 dark:bg-rose-500/10',
        placeholder: 'patient@hospital.com'
    }
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)
    const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError('Email is required')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Please enter a valid email address')
        } else {
            setEmailError('')
        }
        setEmail(value)
    }

    const validatePassword = (value: string) => {
        if (!value) {
            setPasswordError('Password is required')
        } else if (value.length < 6) {
            setPasswordError('Password must be at least 6 characters')
        } else {
            setPasswordError('')
        }
        setPassword(value)
    }

    // Role Selection Screen
    if (!selectedRole) {
        return (
            <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Bubbles />
                <main className="relative z-10 w-full max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-16 text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
                        <div className="inline-flex items-center justify-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-75 animate-pulse" />
                                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                    <Activity className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                                    HOPI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 ml-2">SYNC</span>
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 tracking-widest">Healthcare Operations Platform</p>
                            </div>
                        </div>
                        <p className="text-xl text-slate-700 dark:text-slate-300 font-semibold max-w-2xl mx-auto">
                            Hospital Administration System
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Select your role to access the system
                        </p>
                    </div>

                    {/* Role Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {(Object.keys(ROLE_CONFIG) as AuthRole[]).map((role, index) => {
                            const config = ROLE_CONFIG[role]
                            return (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className={`group relative p-6 rounded-2xl transition-all duration-300 border-2 ${config.borderColor} ${config.bgLight} hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4`}
                                >
                                    {/* Animated background gradient on hover */}
                                    <div className={`absolute inset-0 ${config.accentColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-lg`} />
                                    
                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                                        {/* Icon Container */}
                                        <div className={`relative p-3 rounded-lg ${config.accentColor} transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6`}>
                                            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                                            <config.icon className={`h-6 w-6 ${config.color} relative z-10`} />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1">
                                            <h3 className={`text-sm font-black tracking-tight text-slate-900 dark:text-white group-hover:${config.color.split(' ')[0]} transition-colors duration-300`}>
                                                {config.label}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                                {config.description}
                                            </p>
                                        </div>

                                        {/* Hover indicator arrow */}
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                                            <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>

                                    {/* Border glow on hover */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300" />
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-500 dark:text-slate-400 animate-in fade-in duration-700 delay-500">
                        <p className="font-semibold tracking-widest uppercase">HOPI SYNC Hospital Management System v2.4.0</p>
                        <p className="mt-2 text-slate-400 dark:text-slate-600">© 2024-2026 All Rights Reserved | Secure System</p>
                    </div>
                </main>
            </div>
        )
    }

    const config = ROLE_CONFIG[selectedRole]

    // Login Form Screen
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Bubbles />

            <main className="relative z-10 w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-700">
                {/* Back button */}
                <button 
                    onClick={() => setSelectedRole(null)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-6 group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="tracking-wide">Back to Roles</span>
                </button>

                {/* Login Card */}
                <div className={`rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/20 dark:border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700}`}>
                    {/* Gradient header bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${config.darkBg} brightness-110`} />

                    <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        {/* Icon & Title */}
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center justify-center p-4 ${config.accentColor} rounded-2xl mb-4 ring-2 ring-white/20 dark:ring-white/10`}>
                                <config.icon className={`h-7 w-7 ${config.color}`} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                                {config.label} Login
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-widest">
                                Secure Access to HOPI SYNC
                            </p>
                        </div>

                        {/* Error Alert */}
                        {state?.error && (
                            <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{state.error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form action={formAction} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-400 transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={config.placeholder}
                                        value={email}
                                        onChange={(e) => validateEmail(e.target.value)}
                                        required
                                        className="pl-10 py-2.5 h-11 w-full bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                    />
                                    {email && !emailError && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                    )}
                                </div>
                                {emailError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3 w-3" /> {emailError}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-400 transition-colors pointer-events-none" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => validatePassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10 py-2.5 h-11 w-full bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                    {password && !passwordError && (
                                        <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                    )}
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3 w-3" /> {passwordError}
                                    </p>
                                )}
                            </div>

                            {/* Demo Credentials Hint */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                                <p className="font-semibold mb-1">Demo Credentials:</p>
                                <p className="text-blue-600 dark:text-blue-400">Email: {config.placeholder}</p>
                                <p className="text-blue-600 dark:text-blue-400">Password: password123</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isPending || !email || !password || !!emailError || !!passwordError}
                                className={`w-full py-3 px-4 rounded-lg font-black text-sm uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    `bg-gradient-to-r ${config.darkBg} hover:brightness-110 active:scale-95 shadow-lg`
                                }`}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Verifying Credentials...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <Zap className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Note */}
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 tracking-wide">
                            🔐 This is a secure, HIPAA-compliant system
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
