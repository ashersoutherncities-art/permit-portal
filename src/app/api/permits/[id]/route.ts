import { getServerSession } from 'next-auth/next'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()

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

    return Response.json(permit)
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const body = await req.json()

  try {
    const { data: permit, error } = await supabase
      .from('permits')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !permit) {
      return Response.json({ error: 'Permit not found' }, { status: 404 })
    }

    return Response.json(permit)
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
