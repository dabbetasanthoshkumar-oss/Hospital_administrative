import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                        Welcome, {profile?.full_name} ({profile?.role})
                    </span>
                    <LogoutButton />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Placeholder for dynamic widgets based on role */}
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2 text-primary">Overview</h3>
                    <p className="text-2xl font-bold">...</p>
                </div>
            </div>
        </div>
    )
}
