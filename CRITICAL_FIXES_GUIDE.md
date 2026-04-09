# CRITICAL FIXES - Implementation Guide

## Priority 1: Fix Database Schema (CRITICAL)

### Issue
The `user_role` enum is missing the 'patient' role, causing patient login to fail.

### Fix Steps

**Step 1: Update schema.sql**
```sql
-- Open schema.sql and find the CREATE TYPE user_role line
-- Replace this:
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist');

-- With this:
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'patient');
```

**Step 2: Migrate Supabase Database**

Option A: Using Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query:
```sql
ALTER TYPE user_role ADD VALUE 'patient' BEFORE 'receptionist';
```

Option B: Using migration if available:
```bash
supabase migration new add_patient_role
# Edit the migration file and add:
# ALTER TYPE user_role ADD VALUE 'patient' BEFORE 'receptionist';
supabase migration up
```

**Step 3: Verify Fix**
```sql
-- Check the enum values:
SELECT enum_range(NULL::user_role);
-- Should return: (admin,doctor,nurse,receptionist,patient,pharmacist)
```

---

## Priority 2: Implement Password Reset (HIGH)

### Create New Page: `/forgot-password/page.tsx`

See attached implementation file: `forgotten-password-implementation.tsx`

**Key Features:**
- Email input with validation
- Reset link sent to email
- Success confirmation message
- Redirect to login after submission

---

## Priority 3: Add Session Timeout Warning (HIGH)

### Implementation in layout.tsx:

```typescript
// Add session timeout handler component
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-context'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'

export function SessionTimeoutHandler() {
    const [showWarning, setShowWarning] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(60)
    const { profile } = useAuth()
    const idleTimeout = 30 * 60 * 1000 // 30 minutes
    const warningTime = 60 * 1000 // Show warning 1 minute before timeout

    useEffect(() => {
        let timeoutId: NodeJS.Timeout
        let warningId: NodeJS.Timeout
        let countdownId: NodeJS.Timeout

        const resetTimer = () => {
            clearTimeout(timeoutId)
            clearTimeout(warningId)
            clearInterval(countdownId)
            setShowWarning(false)

            warningId = setTimeout(() => {
                setShowWarning(true)
                setTimeRemaining(60)
                countdownId = setInterval(() => {
                    setTimeRemaining(prev => prev - 1)
                }, 1000)
            }, idleTimeout - warningTime)

            timeoutId = setTimeout(() => {
                // Logout user
                window.location.href = '/login?reason=session-timeout'
            }, idleTimeout)
        }

        // Listen for user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true)
        })

        resetTimer()

        return () => {
            clearTimeout(timeoutId)
            clearTimeout(warningId)
            clearInterval(countdownId)
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true)
            })
        }
    }, [])

    return (
        <AlertDialog open={showWarning}>
            <AlertDialogContent>
                <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
                <AlertDialogDescription>
                    Your session will expire in {timeRemaining} seconds due to inactivity.
                    Click "Continue Session" to stay logged in.
                </AlertDialogDescription>
                <div className="flex gap-2">
                    <AlertDialogCancel onClick={() => window.location.href = '/login'}>
                        Logout
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => setShowWarning(false)}>
                        Continue Session
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
```

Add to layout.tsx:
```typescript
import { SessionTimeoutHandler } from '@/components/session-timeout-handler'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SessionTimeoutHandler />
            {children}
        </>
    )
}
```

---

## Priority 4: Add Login Rate Limiting (MEDIUM)

### Update `/login/actions.ts`:

```typescript
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Simple in-memory rate limiting (for production, use Redis)
const loginAttempts = new Map<string, { count: number; timestamp: number }>()

const isRateLimited = (email: string): boolean => {
    const now = Date.now()
    const attempt = loginAttempts.get(email)

    if (!attempt) return false

    // Reset after 15 minutes
    if (now - attempt.timestamp > 15 * 60 * 1000) {
        loginAttempts.delete(email)
        return false
    }

    return attempt.count >= 5
}

const recordFailedAttempt = (email: string) => {
    const now = Date.now()
    const attempt = loginAttempts.get(email)

    if (attempt) {
        attempt.count += 1
        attempt.timestamp = now
    } else {
        loginAttempts.set(email, { count: 1, timestamp: now })
    }
}

const clearAttempts = (email: string) => {
    loginAttempts.delete(email)
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Check rate limiting
    if (isRateLimited(email)) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' }
    }

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
        recordFailedAttempt(email)
        return { error: 'Invalid input' }
    }

    // Development bypass
    if (email === 'admin@hospital.com' && password === 'password123') {
        clearAttempts(email)
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set('dev-auth', 'true', { path: '/', maxAge: 60 * 60 * 24 })
        redirect('/dashboard')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        recordFailedAttempt(email)
        return { error: error.message }
    }

    clearAttempts(email)

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (profileError || !profile) {
        return { error: 'Profile not found. Please contact administrator.' }
    }

    redirect('/dashboard')
}
```

---

## Priority 5: Verify API Integration

### Checklist for API endpoints:

- [ ] GET `/api/patients` - List all patients
- [ ] POST `/api/patients` - Create new patient
- [ ] PUT `/api/patients/{id}` - Update patient
- [ ] DELETE `/api/patients/{id}` - Delete patient
- [ ] GET `/api/appointments` - List appointments
- [ ] POST `/api/appointments` - Create appointment
- [ ] GET `/api/prescriptions` - List prescriptions
- [ ] GET `/api/inventory` - List medicines
- [ ] PUT `/api/inventory/{id}` - Update medicine quantity

---

## Testing After Fixes

```bash
# 1. Test patient login
# Email: patient@hospital.com
# Password: password123

# 2. Test password reset
# Click forgot password, enter your email

# 3. Test session timeout (after 30 minutes of inactivity)

# 4. Test rate limiting (5 failed attempts)
```

---

## Deployment Checklist

- [ ] Database schema updated on Supabase
- [ ] All fixes tested locally
- [ ] No console errors
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance benchmarks acceptable
- [ ] Accessibility check passed
- [ ] Push to staging environment
- [ ] Staging testing completed
- [ ] Deploy to production
- [ ] Monitor logs for errors

---

**Estimated Time to Complete All Critical Fixes: 8-10 hours**
