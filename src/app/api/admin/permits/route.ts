import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const ADMIN_EMAIL = 'dariuswalton906@gmail.com'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden: admin only' }, { status: 403 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const { data: permits, error } = await supabase
      .from('permits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(permits || [])
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
