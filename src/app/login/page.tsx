'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="relative flex h-screen w-full items-center justify-center px-4 overflow-hidden">
            {/* Background Bubbles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-primary/10 animate-bubble"
                        style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: '-10%',
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 3 + 2}s`
                        }}
                    />
                ))}
            </div>

            <Card className="mx-auto max-w-sm glass-card border-none z-10">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Hospital Admin
                    </CardTitle>
                    <CardDescription className="text-blue-100/70 text-center">
                        Enter your credentials to access the bridge
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid gap-6">
                        {state?.error && (
                            <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 backdrop-blur-md rounded-lg animate-in fade-in zoom-in duration-300">
                                {state.error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-blue-100/80">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@hospital.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-primary/50 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" title="Password" className="text-blue-100/80">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                className="bg-white/5 border-white/10 text-white focus:ring-primary/50 rounded-xl"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full glass-button hover:scale-105 jelly rounded-xl h-12 text-lg font-semibold" disabled={isPending}>
                            {isPending ? 'Syncing...' : 'Enter Dashboard'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
