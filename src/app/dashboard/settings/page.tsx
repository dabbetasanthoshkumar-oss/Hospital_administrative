
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Bell, User } from 'lucide-react'

export default function SettingsPage() {
    const settingsGroups = [
        {
            title: 'Account Settings',
            icon: User,
            items: ['Profile Information', 'Security Preferences', 'Notification Settings']
        },
        {
            title: 'Hospital Configuration',
            icon: Settings,
            items: ['Department Management', 'Staff Roles', 'System Presets']
        },
        {
            title: 'Privacy & Security',
            icon: Shield,
            items: ['Audit Log Retention', 'Data Export', 'API Keys']
        }
    ]

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Control Center</h1>
                <p className="text-blue-100/60 font-medium">Manage your system preferences and security protocols</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {settingsGroups.map((group) => (
                    <Card key={group.title} className="glass-card border-none relative overflow-hidden group">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-xl text-primary jelly">
                                <group.icon className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-xl font-bold text-white">{group.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {group.items.map((item) => (
                                    <li key={item} className="flex justify-between items-center group/item cursor-pointer">
                                        <span className="text-blue-100/70 group-hover/item:text-white transition-colors">
                                            {item}
                                        </span>
                                        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
