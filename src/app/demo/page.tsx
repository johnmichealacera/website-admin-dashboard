'use client'

import Hero from '@/components/hero/hero'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DemoPage() {
  // Sample data representing what would come from a tenant site's Hero model
  const sampleHeroData = {
    title: "Welcome to Our Amazing Business",
    subtitle: "Your Success Partner Since 2024",
    description: "We provide exceptional products and services tailored to meet your unique needs. Join thousands of satisfied customers who have transformed their experience with our premium offerings.",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop",
    videoUrl: null, // Set to a video URL to test video background
    ctaButton: "Explore Our Products",
    ctaLink: "/admin/products"
  }

  const sampleColorPalette = ["#3B82F6", "#10B981", "#F59E0B"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero 
        heroData={sampleHeroData}
        colorPalette={sampleColorPalette}
      />

      {/* Demo Information Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Hero Section Migration Demo
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            This page demonstrates the new Hero component using the Hero model that has been 
            created in the database. In a real tenant site, these values would 
            be fetched from the Hero table for each specific site.
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ✅ Migration Complete
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Hero table created with one-to-one site relation</li>
                <li>✓ Database migration applied safely (no data loss)</li>
                <li>✓ Hero component created</li>
                <li>✓ TypeScript types updated</li>
                <li>✓ Responsive design implemented</li>
                <li>✓ Multi-tenant color palette support</li>
                <li>✓ Fallback content for empty fields</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🎨 Features Demonstrated
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Background image support</li>
                <li>• Video background capability</li>
                <li>• Gradient fallback</li>
                <li>• Dynamic color palette integration</li>
                <li>• Responsive typography</li>
                <li>• Call-to-action button</li>
                <li>• Scroll indicator animation</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <Link href="/admin">
              <Button>
                View Admin Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">For Developers:</h4>
                        <p className="text-blue-800 text-sm">
              To implement this on tenant sites, fetch the Hero data using `site.hero` relation 
              or query the Hero table by siteId, then pass the data to the Hero component. 
              The component handles null values gracefully with built-in fallbacks.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 