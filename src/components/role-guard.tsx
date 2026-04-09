'use client'

import React from 'react'
import { useAuth, UserRole } from './auth-context'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: UserRole | UserRole[]
    fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { profile, isLoading, hasPermission } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!profile || !hasPermission(allowedRoles)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
