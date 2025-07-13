import { NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get the authenticated user session
    const session = await auth0.getSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const auth0UserId = session.user.sub

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { auth0UserId },
      include: {
        sites: {
          include: {
            site: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user is super admin, return all sites
    if (user.role === 'SUPER_ADMIN') {
      const allSites = await db.site.findMany({
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              products: true,
              categories: true,
              events: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ sites: allSites })
    }

    // For regular admins, return only their accessible sites
    const userSites = user.sites.map(userSite => ({
      ...userSite.site,
      userRole: userSite.role
    }))

    return NextResponse.json({ sites: userSites })

  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user session
    const session = await auth0.getSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const auth0UserId = session.user.sub

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { auth0UserId }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, domain, subdomain, description } = body

    // Validate required fields
    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain are required' }, { status: 400 })
    }

    // Create new site
    const newSite = await db.site.create({
      data: {
        name,
        domain,
        subdomain,
        description,
        isActive: true
      }
    })

    return NextResponse.json({ site: newSite }, { status: 201 })

  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 