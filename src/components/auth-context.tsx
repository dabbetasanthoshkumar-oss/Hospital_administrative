'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab_tech' | 'pharmacist' | 'patient'

export interface UserProfile {
    id: string
    full_name: string
    role: UserRole
    email: string
}

interface AuthContextType {
    user: any | null
    profile: UserProfile | null
    isLoading: boolean
    hasPermission: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    hasPermission: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function loadUser() {
            try {
                // Check for development bypass cookie first
                const isDevAuth = document.cookie.includes('dev-auth=true')
                
                if (isDevAuth) {
                    setUser({ id: 'dev-admin-id', email: 'admin@hospital.com' })
                    setProfile({
                        id: 'dev-admin-id',
                        full_name: 'System Administrator (Dev)',
                        role: 'admin',
                        email: 'admin@hospital.com'
                    })
                    setIsLoading(false)
                    return
                }

                const { data: { user: supabaseUser } } = await supabase.auth.getUser()
                setUser(supabaseUser)

                if (supabaseUser) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', supabaseUser.id)
                        .single()
                    
                    if (profileData) {
                        setProfile(profileData as UserProfile)
                    }
                }
            } catch (error) {
                console.error('Error loading user profile:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                loadUser()
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const hasPermission = (allowedRoles: UserRole | UserRole[]) => {
        if (!profile) return false
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
        return roles.includes(profile.role)
    }

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, hasPermission }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
