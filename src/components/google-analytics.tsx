'use client'

import { useEffect } from 'react'
import { useTenant } from '@/contexts/tenant-context'

export function GoogleAnalytics() {
  const { currentSite } = useTenant()

  useEffect(() => {
    // Only proceed if we have a site and a Google Analytics tag
    if (!currentSite?.googleAnalyticsTag || currentSite.googleAnalyticsTag.trim() === '') {
      return
    }

    const tag = currentSite.googleAnalyticsTag.trim()

    // Check if the script is already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${tag}"]`)) {
      return
    }

    // Create and inject the Google Analytics script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${tag}`
    document.head.appendChild(script1)

    // Create and inject the configuration script
    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${tag}');
    `
    document.head.appendChild(script2)

    // Cleanup function to remove scripts when component unmounts or tag changes
    return () => {
      // Remove the scripts we added
      const existingScript1 = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${tag}"]`)
      const existingScript2 = document.querySelector(`script:not([src])`)
      
      if (existingScript1) {
        existingScript1.remove()
      }
      
      if (existingScript2 && existingScript2.innerHTML.includes(`gtag('config', '${tag}')`)) {
        existingScript2.remove()
      }
    }
  }, [currentSite?.googleAnalyticsTag])

  // This component doesn't render anything visible
  return null
} 