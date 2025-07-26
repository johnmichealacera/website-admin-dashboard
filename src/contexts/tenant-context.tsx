'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { Site, UserSite, User, type TenantContext } from '@/lib/types'

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user: auth0User, isLoading: auth0Loading } = useUser()
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [userSites, setUserSites] = useState<UserSite[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  // Fetch user data and sites when Auth0 user is available
  useEffect(() => {
    if (!auth0Loading && auth0User) {
      console.log('✅ TenantProvider - Calling fetchUserData')
      fetchUserData()
    } else {
      console.log('⏳ TenantProvider - Waiting for Auth0 user or still loading')
    }
  }, [auth0User, auth0Loading])

  const fetchUserData = async () => {
    try {
      // Fetch current user and their sites
      const response = await fetch('/api/user/profile')
      
      if (response.ok) {
        const data = await response.json()
        
        setCurrentUser(data.user)
        setUserSites(data.sites)
        
        // Auto-select first site or previously selected site from localStorage
        const savedSiteId = localStorage.getItem('selectedSiteId')

        const siteToSelect = savedSiteId 
          ? data.sites.find((userSite: UserSite) => userSite.siteId === savedSiteId)?.site
          : data.sites[0]?.site
        
        if (siteToSelect) {
          setCurrentSite(siteToSelect)
        } else {
          console.log('❌ No site to select')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to fetch user data:', response.status, errorText)
      }
    } catch (error) {
      console.error('💥 Error fetching user data:', error)
    }
  }

  const switchSite = async (siteId: string) => {
    const userSite = userSites.find(us => us.siteId === siteId)
    if (userSite?.site) {
      setCurrentSite(userSite.site)
      localStorage.setItem('selectedSiteId', siteId)
    }
  }

  const contextValue: TenantContext = {
    currentSite,
    userSites,
    currentUser,
    switchSite
  }

  return (
    <TenantContextProvider.Provider value={contextValue}>
      {children}
    </TenantContextProvider.Provider>
  )
}

const TenantContextProvider = createContext<TenantContext | null>(null)

export function useTenant() {
  const context = useContext(TenantContextProvider)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
} 