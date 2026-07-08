'use server'

import { revalidatePath } from 'next/cache'

import { isAdminUser } from '@/lib/admin'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const allowedStatuses = ['submitted', 'verified', 'rejected']

export async function updateRegistrationStatus(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdminUser(user))) return

  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  const note = String(formData.get('note') || '').trim()

  if (!id || !allowedStatuses.includes(status)) return

  if (status === 'rejected' && !note) return

  const { error } = await createServiceClient().from('competition_registrations').update({ status, note: note || null }).eq('id', id)
  if (error) return

  revalidatePath('/admin')
  revalidatePath('/admin/registrations')
  revalidatePath(`/admin/registrations/${id}`)
}
