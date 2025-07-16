import { NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 [API] Getting user profile...')
    
    // Get the authenticated user session
    const session = await auth0.getSession()
    
    if (!session || !session.user) {
      console.log('❌ [API] No session or user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const auth0UserId = session.user.sub
    console.log('👤 [API] Auth0 User ID:', auth0UserId)

    // Find or create user in our database
    let user = await db.user.findUnique({
      where: { auth0UserId },
      include: {
        sites: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
                domain: true,
                subdomain: true,
                description: true,
                isActive: true,
                packageType: true,
                features: { select: { name: true, description: true } },
                featuresOrder: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    })

    console.log('🔍 [API] User found in database:', !!user)
    console.log('🏢 [API] User sites count:', user?.sites?.length || 0)

    // If user doesn't exist in our database, create them
    if (!user) {
      user = await db.user.create({
        data: {
          email: session.user.email!,
          auth0UserId,
          name: session.user.name,
          role: 'ADMIN' // Default role
        },
        include: {
          sites: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  domain: true,
                  subdomain: true,
                  description: true,
                  isActive: true,
                  packageType: true,
                  features: { select: { name: true, description: true } },
                  featuresOrder: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          }
        }
      })
    }

    // Update user info if it has changed
    if (user.email !== session.user.email || user.name !== session.user.name) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          email: session.user.email!,
          name: session.user.name
        },
        include: {
          sites: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                  domain: true,
                  subdomain: true,
                  description: true,
                  isActive: true,
                  packageType: true,
                  features: { select: { name: true, description: true } },
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          }
        }
      })
    }

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        auth0UserId: user.auth0UserId
      },
      sites: user.sites
    }

    console.log('📤 [API] Returning user data:', responseData.user)
    console.log('📤 [API] Returning sites data:', responseData.sites)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 