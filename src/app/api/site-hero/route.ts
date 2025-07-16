import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' }, 
        { status: 400 }
      )
    }

    // Fetch hero data for the site
    const heroData = await db.hero.findUnique({
      where: {
        siteId: siteId
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        imageUrl: true,
        videoUrl: true,
        ctaButton: true,
        ctaLink: true,
        site: {
          select: {
            id: true,
            name: true,
            colorPalette: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      hero: heroData
    })

  } catch (error) {
    console.error('Error fetching site hero data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, title, subtitle, description, imageUrl, videoUrl, ctaButton, ctaLink } = body

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' }, 
        { status: 400 }
      )
    }

    // Create or update hero data for the site
    const heroData = await db.hero.upsert({
      where: {
        siteId: siteId
      },
      update: {
        title,
        subtitle,
        description,
        imageUrl,
        videoUrl,
        ctaButton,
        ctaLink
      },
      create: {
        siteId,
        title,
        subtitle,
        description,
        imageUrl,
        videoUrl,
        ctaButton,
        ctaLink
      }
    })

    return NextResponse.json({
      success: true,
      hero: heroData
    })

  } catch (error) {
    console.error('Error creating/updating site hero data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 