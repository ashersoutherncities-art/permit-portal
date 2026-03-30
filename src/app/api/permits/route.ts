import { getServerSession } from 'next-auth/next'
import { getSupabaseAdmin } from '@/lib/supabase'
import { analyzePermitSubmission } from '@/lib/claude-analyzer'

export async function GET(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get permits for this customer
    const { data: permits, error } = await supabase
      .from('permits')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(permits)
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const body = await req.json()

  try {
    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Analyze submission with Claude
    const aiAnalysis = await analyzePermitSubmission({
      permit_type: body.permit_type,
      property_address: body.property_address,
      contractor_info: body.contractor_info,
      scope_of_work: body.scope_of_work,
      contract_signed: body.contract_signed,
      payment_received: body.upfront_paid,
      documents: body.documents,
    })

    // Create permit
    const { data: permit, error } = await supabase
      .from('permits')
      .insert({
        customer_id: customer.id,
        permit_type: body.permit_type,
        status: 'processing',
        property_address: body.property_address,
        city: body.city,
        county: body.county,
        state: body.state,
        zip: body.zip,
        contractor_info: body.contractor_info,
        scope_of_work: body.scope_of_work,
        estimated_cost: body.estimated_cost,
        contract_signed: body.contract_signed || false,
        upfront_paid: body.upfront_paid || false,
        ai_analysis_result: aiAnalysis,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Create initial stage record
    await supabase.from('permit_stages').insert({
      permit_id: permit.id,
      stage_name: 'Submitted',
      completed_at: new Date().toISOString(),
    })

    return Response.json(permit, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
