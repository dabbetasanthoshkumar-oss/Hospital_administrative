'use client'

import { logout } from '@/app/login/actions'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="p-3 glass-button jelly rounded-xl hover:text-red-400 transition-colors"
            title="Logout"
        >
            <LogOut className="h-5 w-5" />
        </button>
    )
}
