'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Stethoscope, User, Mail, Award, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

export default function NewDoctorPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const fullName = formData.get('fullName') as string
        const specialization = formData.get('specialization') as string
        const password = 'TemporaryPassword123!' // In a real app, this would be sent via email

        try {
            // 1. Create the Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'doctor'
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('Failed to create user')

            // 2. The profile should be created by the database trigger (if configured)
            // But let's ensure the doctor entry is created.
            // Note: In our current schema, we might need to wait for the profile or create it manually if no trigger.

            // Wait a moment for trigger if it exists
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 3. Create Doctor Entry
            const { error: doctorError } = await supabase
                .from('doctors')
                .insert({
                    id: authData.user.id,
                    specialization: specialization
                })

            if (doctorError) throw doctorError

            router.push('/dashboard/doctors')
            router.refresh()
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <header className="flex items-center gap-4">
                <Link href="/dashboard/doctors">
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-100/40 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-1">Register Specialist</h1>
                    <p className="text-blue-100/60 font-medium text-sm">Onboard new medical staff to the system</p>
                </div>
            </header>

            <Card className="glass-card border-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="pt-10 pb-6 px-10">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        Staff Credentials
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Full Identity Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        placeholder="e.g. Dr. Sarah Jenkins"
                                        required
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Clinical Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="s.jenkins@hospital.com"
                                        required
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="specialization" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Specialization Field</Label>
                                <div className="relative group">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="specialization"
                                        name="specialization"
                                        placeholder="e.g. Cardiology, Neurology"
                                        required
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing Protocol...
                                    </>
                                ) : (
                                    'Execute Registration'
                                )}
                            </button>
                            <p className="text-center text-[10px] text-blue-100/20 font-bold uppercase tracking-widest mt-6">
                                Securing credentials via encrypted handshake
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
