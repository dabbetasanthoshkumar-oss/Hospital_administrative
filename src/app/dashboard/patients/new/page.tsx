'use client'

import { createPatient } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User, Calendar, Phone, MapPin, ArrowLeft, Loader2, AlertCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default function NewPatientPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        try {
            const result = await createPatient(formData)
            if (result.success) {
                router.push('/dashboard/patients')
                router.refresh()
            } else {
                setError(result.error || 'Failed to register patient protocol')
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during population')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <header className="flex items-center gap-4">
                <Link href="/dashboard/patients">
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-100/40 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-1">Onboard Patient</h1>
                    <p className="text-blue-100/60 font-medium text-sm">Register new clinical entity into the hospital matrix</p>
                </div>
            </header>

            <Card className="glass-card border-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="pt-10 pb-6 px-10">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        Subject Identity
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <form action={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="full_name" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Legal Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        placeholder="e.g. Jonathan Quincy Adams"
                                        required
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="dob" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Chronological DOB</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        required
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Biological Gender</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    required
                                    className="flex h-14 w-full rounded-2xl border-none glass-input bg-transparent px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#0a0f1e]">Choose Type</option>
                                    <option value="male" className="bg-[#0a0f1e]">Male</option>
                                    <option value="female" className="bg-[#0a0f1e]">Female</option>
                                    <option value="other" className="bg-[#0a0f1e]">Non-Binary / Other</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Contact Signal</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (555) 000-0000"
                                        className="pl-12 h-14 glass-input border-none text-white focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">Residential Sector</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/20 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="City, State, Sector..."
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
                                        Syncing Record...
                                    </>
                                ) : (
                                    'Initialize Patient Protocol'
                                )}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
