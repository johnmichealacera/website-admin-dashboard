import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth0 } from '@/lib/auth0'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth0.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteId = id

    const site = await db.site.findUnique({
      where: { id: siteId },
      include: {
        features: true,
        hero: true,
        users: {
          include: {
            user: true
          }
        }
      }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Check if user has access to this site
    const userSite = site.users.find(us => us.user.auth0UserId === session.user.sub)
    if (!userSite) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Error fetching site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 