'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Bubbles from '@/components/bubbles'
import { ShieldCheck, Activity, Loader2, Lock, Mail, ChevronRight, Stethoscope } from 'lucide-react'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 overflow-hidden bg-[#050810]">
            {/* Synapse Background Layer (client-only randomized bubbles) */}
            <Bubbles />

            <main className="relative z-10 w-full max-w-sm mx-auto">
                {/* Branding Header */}
                <div className="mb-8 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-3">
                        <Stethoscope className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-100/40 whitespace-nowrap">Hospital Administration</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
                        HOPI <span className="text-primary italic">SYNC</span>
                    </h1>
                    <p className="text-blue-100/30 text-[10px] font-bold uppercase tracking-widest">Clinical Intelligence Interface</p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                    {/* Top accent */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                    <div className="p-6 sm:p-8">
                        {/* Card Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center p-2.5 bg-primary/20 rounded-2xl mb-3">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Secure Access</h2>
                            <p className="text-blue-100/40 text-xs font-medium uppercase tracking-wider mt-1">
                                Authorized personnel only
                            </p>
                        </div>

                        {/* Form */}
                        <form action={formAction} className="space-y-4">
                            {state?.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                                    <div className="p-1 bg-red-500/20 rounded-lg flex-shrink-0">
                                        <Activity className="h-3.5 w-3.5" />
                                    </div>
                                    {state.error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@hospital.com"
                                        required
                                        className="pl-10 h-12 glass-input border-none text-white text-sm focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-blue-100/40 ml-1">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="pl-10 h-12 glass-input border-none text-white text-sm focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100/10">
                    Hopi Sync · Protocol v2.4.0
                </p>
            </main>
        </div>
    )
}
