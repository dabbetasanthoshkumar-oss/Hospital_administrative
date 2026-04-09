'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const billingSchema = z.object({
    appointment_id: z.string().uuid(),
    consultation_fee: z.number().min(0),
    lab_charges: z.number().min(0),
    medicine_charges: z.number().min(0),
    payment_status: z.enum(['pending', 'paid', 'partially_paid']),
})

export async function createOrUpdateBilling(data: z.infer<typeof billingSchema>) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('billing')
        .upsert(data, { onConflict: 'appointment_id' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true }
}

export async function updatePaymentStatus(id: string, status: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('billing')
        .update({ payment_status: status })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true }
}

/**
 * Process a simulated payment transaction
 */
export async function processTransaction(billingId: string, method: string, transactionId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('billing')
        .update({
            payment_status: 'paid',
            payment_method: method,
            transaction_id: transactionId,
            paid_at: new Date().toISOString()
        })
        .eq('id', billingId)

    if (error) {
        console.error('Payment processing error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true }
}
