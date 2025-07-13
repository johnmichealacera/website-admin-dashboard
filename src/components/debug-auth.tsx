'use client'

import { useUser } from '@auth0/nextjs-auth0'

export function DebugAuth() {
  const { user, error, isLoading } = useUser()
  
  console.log('🔍 DebugAuth - isLoading:', isLoading)
  console.log('🔍 DebugAuth - user:', user)
  console.log('🔍 DebugAuth - error:', error)
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Auth0 Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Auth0 User: {user ? user.email : 'None'}</div>
      <div>Auth0 Error: {error ? error.message : 'None'}</div>
    </div>
  )
} 