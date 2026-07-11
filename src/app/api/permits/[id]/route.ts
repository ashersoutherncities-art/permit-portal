import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const ADMIN_EMAIL = 'dariuswalton906@gmail.com'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const { data: permit, error } = await supabase
      .from('permits')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !permit) {
      return Response.json({ error: 'Permit not found' }, { status: 404 })
    }

    // Non-admin: verify ownership
    if (session.user.email !== ADMIN_EMAIL) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (!customer || permit.customer_id !== customer.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return Response.json(permit)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()
  const body = await req.json()

  const { status, denial_reason, admin_notes, priority, estimated_completion_date } = body
  const allowedStatuses = ['processing', 'active', 'completed', 'denied', 'declined']

  if (status && !allowedStatuses.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (status) updatePayload.status = status
  if (denial_reason !== undefined) updatePayload.denial_reason = denial_reason
  if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes
  if (priority !== undefined) updatePayload.priority = priority
  if (estimated_completion_date !== undefined) updatePayload.estimated_completion_date = estimated_completion_date

  try {
    // Fetch existing permit to get current timeline
    const { data: existing } = await supabase
      .from('permits')
      .select('admin_timeline')
      .eq('id', params.id)
      .single()

    // Append timeline entry if status is changing
    if (status) {
      const timelineEntry = {
        event: status === 'active' ? 'Approved' : status === 'denied' || status === 'declined' ? 'Denied' : status === 'completed' ? 'Completed' : 'Status Updated',
        date: new Date().toISOString(),
        note: denial_reason || admin_notes || null,
      }
      const existingTimeline = Array.isArray(existing?.admin_timeline) ? existing.admin_timeline : []
      updatePayload.admin_timeline = [...existingTimeline, timelineEntry]
    }

    const { data: permit, error } = await supabase
      .from('permits')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error || !permit) {
      return Response.json({ error: 'Permit not found or update failed' }, { status: 404 })
    }

    return Response.json(permit)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
