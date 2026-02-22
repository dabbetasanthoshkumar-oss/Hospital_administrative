import { createAdminClient } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function DoctorDetail({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select(`*, profiles(full_name, role)`)
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400">Failed to load doctor: {error.message}</p>
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

  const profile = (doctor as any).profiles || {}

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
        <Link href={`/dashboard/doctors/${params.id}/edit`} className="px-4 py-2 bg-primary text-white rounded-xl">Edit</Link>
        <Link href="/dashboard/doctors" className="px-4 py-2 bg-white/5 rounded-xl">Close</Link>
      </div>
    </div>
  )
}
