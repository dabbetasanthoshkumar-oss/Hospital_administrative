'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const inventorySchema = z.object({
    medicine_name: z.string().min(2),
    quantity: z.number().int().min(0),
    expiry_date: z.string().optional(),
    supplier: z.string().optional(),
    low_stock_threshold: z.number().int().min(0).default(10),
})

export async function upsertInventory(data: z.infer<typeof inventorySchema> & { id?: string }) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('inventory')
        .upsert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/pharmacy')
    return { success: true }
}

export async function updateStock(id: string, quantity: number) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/pharmacy')
    return { success: true }
}

export async function dispensePrescriptionAction(prescriptionId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('prescriptions')
        .update({ 
            status: 'dispensed',
            dispensed_at: new Date().toISOString()
        })
        .eq('id', prescriptionId)

    if (error) {
        console.error('Dispense error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/pharmacy')
    revalidatePath('/dashboard')
    return { success: true }
}
