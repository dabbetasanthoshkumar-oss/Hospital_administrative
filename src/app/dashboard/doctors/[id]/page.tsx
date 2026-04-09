 'use client'
'use client'

import React, { use, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DoctorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [doctor, setDoctor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        const res = await supabase
          .from('doctors')
          .select('*, profiles(full_name, role)')
          .eq('id', id)
          .maybeSingle()
        if (res.error) {
          setError(res.error.message)
        } else {
          setDoctor(res.data || null)
        }
      } catch (err: any) {
        setError(err?.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">Failed to load doctor: {error}</p>
        <Link href="/dashboard/doctors" className="mt-4 inline-block text-primary underline">Back to roster</Link>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="py-20 text-center">
        <p className="text-blue-100/40">Doctor not found.</p>
        <Link href="/dashboard/doctors" className="mt-4 inline-block text-primary underline">Back to roster</Link>
      </div>
    )
  }

  const profile = doctor.profiles || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{profile.full_name || 'Doctor'}</h1>
          <p className="text-blue-100/60">Specialization: <span className="font-bold">{doctor.specialization}</span></p>
        </div>
        <Link href="/dashboard/doctors" className="flex items-center gap-2 text-sm text-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-blue-100/40">Role</p>
              <p className="font-bold text-white mt-1">{profile.role || 'N/A'}</p>

              <p className="text-sm text-blue-100/40 mt-4">Contact</p>
              <p className="font-medium text-white mt-1">{profile.email || '—'}</p>
              <p className="font-medium text-white mt-1">{profile.phone || '—'}</p>
            </div>

            <div>
              <p className="text-sm text-blue-100/40">Office</p>
              <p className="font-medium text-white mt-1">{doctor.office || '—'}</p>

              <p className="text-sm text-blue-100/40 mt-4">Address</p>
              <p className="font-medium text-white mt-1">{profile.address || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/dashboard/doctors/${id}/edit`} className="px-4 py-2 bg-primary text-white rounded-xl">Edit</Link>
        <Link href="/dashboard/doctors" className="px-4 py-2 bg-white/5 rounded-xl">Close</Link>
      </div>
    </div>
  )
}
