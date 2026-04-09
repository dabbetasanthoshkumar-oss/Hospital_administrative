'use client'

import React, { useState } from 'react'
import { 
    Bell, 
    AlertCircle, 
    Info, 
    CheckCircle2, 
    Clock,
    Flame
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface Notification {
    id: string
    title: string
    description: string
    time: string
    type: 'alert' | 'info' | 'success' | 'warning'
    isRead: boolean
}

export function NotificationsMenu() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Abnormal Lab Result',
            description: 'Patient "Santhosh Kumar" has elevated Glucose levels (185 mg/dL).',
            time: '2 mins ago',
            type: 'alert',
            isRead: false
        },
        {
            id: '2',
            title: 'Critical Inventory Alert',
            description: 'Insulin stock is below threshold (5 units remaining).',
            time: '15 mins ago',
            type: 'warning',
            isRead: false
        },
        {
            id: '3',
            title: 'New Appointment',
            description: 'Dr. John has a new emergency booking at 4:30 PM.',
            time: '1 hour ago',
            type: 'info',
            isRead: true
        }
    ])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 hover:bg-white/5 rounded-xl transition-all group active:scale-95">
                    <Bell className="h-5 w-5 text-blue-100/40 group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#090e1a] animate-in zoom-in">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] glass-card border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-4 bg-primary/20 flex items-center justify-between border-b border-white/5">
                    <DropdownMenuLabel className="p-0 text-sm font-black text-white uppercase italic tracking-tighter">
                        Clinical <span className="text-primary NOT-italic">Alerts</span>
                    </DropdownMenuLabel>
                    <button 
                        onClick={markAllRead}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto py-2">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <DropdownMenuItem 
                                key={n.id} 
                                className={`p-4 flex gap-4 cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors border-l-2
                                    ${n.isRead ? 'border-transparent opacity-60' : 'border-primary bg-primary/5'}
                                `}
                            >
                                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center
                                    ${n.type === 'alert' ? 'bg-red-500/20 text-red-400' : 
                                      n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                      'bg-primary/20 text-primary'}
                                `}>
                                    {n.id === '1' ? <Flame className="h-5 w-5" /> : 
                                     n.type === 'alert' ? <AlertCircle className="h-5 w-5" /> : 
                                     n.type === 'info' ? <Info className="h-5 w-5" /> : 
                                     <CheckCircle2 className="h-5 w-5" />}
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-white leading-none">{n.title}</p>
                                        <span className="text-[10px] text-blue-100/20 font-black uppercase">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-blue-100/60 leading-relaxed font-medium">
                                        {n.description}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-12 text-center opacity-20">
                            <Clock className="h-8 w-8 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No New Alerts</p>
                        </div>
                    )}
                </div>
                
                <div className="p-3 bg-white/5 text-center border-t border-white/5">
                    <button className="text-[10px] font-black text-blue-100/40 uppercase tracking-widest hover:text-white transition-colors">
                        View All Activity History
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
