'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeroProps {
  heroData?: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    ctaButton?: string | null;
    ctaLink?: string | null;
  } | null;
  colorPalette?: string[];
}

export default function Hero({
  heroData,
  colorPalette = ['#3B82F6', '#10B981', '#F59E0B']
}: HeroProps) {
  // Fallback content when hero fields are not set
  const fallbackTitle = heroData?.title || 'Welcome to Our Platform';
  const fallbackSubtitle = heroData?.subtitle || 'Your Success Story Starts Here';
  const fallbackDescription = heroData?.description || 'Discover amazing products and services tailored just for you. Join thousands of satisfied customers who have transformed their experience with us.';
  const fallbackCtaButton = heroData?.ctaButton || 'Get Started';
  const fallbackCtaLink = heroData?.ctaLink || '/products';

  // Use primary color from palette for styling
  const primaryColor = colorPalette[0] || '#3B82F6';

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {heroData?.videoUrl ? (
          // Video background takes priority
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroData.videoUrl} type="video/mp4" />
          </video>
        ) : heroData?.imageUrl ? (
          // Image background
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroData.imageUrl})` }}
          />
        ) : (
          // Gradient fallback
          <div
            className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}99, ${colorPalette[1] || '#10B981'}99, ${colorPalette[2] || '#F59E0B'}99)`
            }}
          />
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Subtitle/Badge */}
        {fallbackSubtitle && (
          <div className="mb-6">
            <span 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-white/20 backdrop-blur-sm"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              {fallbackSubtitle}
            </span>
          </div>
        )}

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          {fallbackTitle}
        </h1>

        {/* Description */}
        {fallbackDescription && (
          <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {fallbackDescription}
          </p>
        )}

        {/* CTA Button */}
        {fallbackCtaButton && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={fallbackCtaLink}>
              <Button 
                size="lg" 
                className="text-white border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${primaryColor}80`,
                  borderColor: 'white'
                }}
              >
                {fallbackCtaButton}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
} 