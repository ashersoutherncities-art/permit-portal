import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { analyzePhotos, PhotoInput } from '@/lib/visionAnalysis'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const photos: PhotoInput[] = body.photos

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return Response.json({ error: 'No photos provided' }, { status: 400 })
    }

    if (photos.length > 45) {
      return Response.json({ error: 'Maximum 45 photos allowed' }, { status: 400 })
    }

    const analysis = await analyzePhotos(photos)
    return Response.json(analysis)
  } catch (error) {
    console.error('Photo analysis error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
