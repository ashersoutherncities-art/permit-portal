import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

async function getOrCreateCustomer(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  email: string,
  name?: string | null
) {
  // Try to find existing customer first
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) return existing

  // Insert new customer
  const { data: created, error } = await supabase
    .from('customers')
    .insert({ email, name: name || email })
    .select('id')
    .single()

  if (error) {
    console.error('Customer create error:', error)
    // Try select again in case of race condition
    const { data: retry } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single()
    return retry
  }

  return created
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  try {
    const customer = await getOrCreateCustomer(supabase, session.user.email, session.user.name)
    if (!customer) {
      return Response.json({ error: 'Failed to find or create customer' }, { status: 500 })
    }

    const { data: permits, error } = await supabase
      .from('permits')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(permits)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const body = await req.json()

  try {
    const customer = await getOrCreateCustomer(supabase, session.user.email, session.user.name)
    if (!customer) {
      return Response.json({ error: 'Failed to find or create customer' }, { status: 500 })
    }

    // Use the AI analysis passed from the client (vision analysis)
    // Fall back to a lightweight text-based analysis only if no vision analysis provided
    let aiAnalysis = body.ai_analysis_result || null

    if (!aiAnalysis) {
      // Lightweight fallback — just mark it as pending
      aiAnalysis = { status: 'pending', note: 'No photos uploaded — analysis not run' }
    }

    // Generate reference number: SCE-YYYY-XXXX
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('permits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)
    const seq = String((count || 0) + 1).padStart(4, '0')
    const reference_number = `SCE-${year}-${seq}`

    const insertPayload: Record<string, unknown> = {
      customer_id: customer.id,
      permit_type: body.permit_type,
      status: 'processing',
      property_address: body.property_address,
      city: body.city,
      county: body.county,
      state: body.state,
      zip: body.zip,
      scope_of_work: body.scope_of_work,
      estimated_cost: body.estimated_cost,
      has_subs: body.has_subs || false,
      property_owned: body.property_owned || false,
      under_contract: body.under_contract || false,
      contract_signed: body.contract_signed || false,
      estimate_signed: body.estimate_signed || false,
      upfront_paid: body.upfront_paid || false,
      ai_analysis_result: aiAnalysis,
      reference_number,
      photo_count: body.photo_count || 0,
      priority: 'medium',
      admin_timeline: [],
    }

    if (body.resubmitted_from) {
      insertPayload.resubmitted_from = body.resubmitted_from
    }

    const { data: permit, error } = await supabase
      .from('permits')
      .insert(insertPayload)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await supabase.from('permit_stages').insert({
      permit_id: permit.id,
      stage_name: 'Submitted',
      completed_at: new Date().toISOString(),
    })

    return Response.json(permit, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
