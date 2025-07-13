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

  console.log('🔄 TenantProvider - Auth0 loading:', auth0Loading)
  console.log('🔄 TenantProvider - Auth0 user:', auth0User)

  // Fetch user data and sites when Auth0 user is available
  useEffect(() => {
    console.log('🔄 TenantProvider useEffect - Auth0 loading:', auth0Loading, 'Auth0 user:', !!auth0User)
    if (!auth0Loading && auth0User) {
      console.log('✅ TenantProvider - Calling fetchUserData')
      fetchUserData()
    } else {
      console.log('⏳ TenantProvider - Waiting for Auth0 user or still loading')
    }
  }, [auth0User, auth0Loading])

  const fetchUserData = async () => {
    try {
      console.log('🔍 Fetching user data...')
      // Fetch current user and their sites
      const response = await fetch('/api/user/profile')
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 API Response data:', data)
        
        setCurrentUser(data.user)
        setUserSites(data.sites)
        
        console.log('👤 Current user:', data.user)
        console.log('🏢 User sites:', data.sites)
        
        // Auto-select first site or previously selected site from localStorage
        const savedSiteId = localStorage.getItem('selectedSiteId')
        console.log('savedSiteId', savedSiteId)

        const siteToSelect = savedSiteId 
          ? data.sites.find((userSite: UserSite) => userSite.siteId === savedSiteId)?.site
          : data.sites[0]?.site

        console.log('🎯 Site to select:', siteToSelect)
        
        if (siteToSelect) {
          setCurrentSite(siteToSelect)
          console.log('✅ Current site set to:', siteToSelect)
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