'use client'

import { logout } from '@/app/login/actions'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    return (
        <Button variant="outline" size="sm" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
