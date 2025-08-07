import { createContext, useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const { isSignedIn, isLoaded, user: clerkUser, session } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false) // false by default, will be set to true if first time
  const [waitingForClerkUser, setWaitingForClerkUser] = useState(false)

  console.log('UserProvider state:', { isLoaded, isSignedIn, hasClerkUser: !!clerkUser, isFirstTime, loading })

  // Fetch user data from server when Clerk session changes
  useEffect(() => {
    console.log('UserContext useEffect triggered:', { isLoaded, isSignedIn, hasSession: !!session, hasClerkUser: !!clerkUser })
    
    // THE GOLDEN RULE: Wait for Clerk to be fully loaded
    if (!isLoaded) {
      console.log('Clerk not loaded yet, waiting...')
      return
    }
    
    // If user is signed in, proceed with data fetching
    if (isSignedIn) {
      console.log('User is signed in, checking session availability...')
      
      if (session && clerkUser) {
        console.log('Session and clerkUser available, fetching user data...')
        setWaitingForClerkUser(false)
        fetchUserData()
      } else {
        console.log('Session or clerkUser not available yet, waiting...')
        setWaitingForClerkUser(true)
        setLoading(true)
      }
    } else {
      // User is not signed in
      console.log('User is not signed in, clearing data...')
      setUser(null)
      setIsFirstTime(false)
      setLoading(false)
      setWaitingForClerkUser(false)
    }
  }, [isLoaded, isSignedIn, session, clerkUser])

  // Handle timeout for waiting for session and clerkUser
  useEffect(() => {
    if (waitingForClerkUser) {
      const timeout = setTimeout(() => {
        console.log('Timeout reached while waiting for session/clerkUser, treating as first time user')
        if (clerkUser) {
          // If we have clerkUser but no session, create a basic user object
          setUser({
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            isFirstTime: true
          })
        } else {
          setUser(null)
        }
        setIsFirstTime(true)
        setLoading(false)
        setWaitingForClerkUser(false)
      }, 3000) // Reduced timeout to 3 seconds

      return () => clearTimeout(timeout)
    }
  }, [waitingForClerkUser, clerkUser])

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...')
      setLoading(true)
      
      // Ensure we have both session and clerkUser
      if (!session || !clerkUser) {
        console.log('Session or clerkUser not available yet, treating as first time user')
        setUser({
          id: clerkUser?.id,
          email: clerkUser?.primaryEmailAddress?.emailAddress,
          isFirstTime: true
        })
        setIsFirstTime(true)
        setLoading(false)
        return
      }
      
      // Use session.getToken() instead of clerkUser.getToken() for better reliability
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available')
        setUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          isFirstTime: true
        })
        setIsFirstTime(true)
        setLoading(false)
        return
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User profile fetched:', data)
        setUser(data)
        // Check if profile is complete (has required fields)
        const isProfileComplete = data.is_profile_complete && 
          data.username && 
          data.display_name && 
          data.username !== `user_${Date.now()}` // Not a default username
        setIsFirstTime(!isProfileComplete) // true if profile is NOT complete
        console.log('Profile complete:', isProfileComplete, 'isFirstTime:', !isProfileComplete)
      } else if (response.status === 404) {
        // User profile not found, definitely first time
        console.log('User profile not found (404), setting as first time user')
        setUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          isFirstTime: true
        })
        setIsFirstTime(true)
      } else {
        console.error('Error fetching user profile:', response.status)
        // Even on error, treat as first time user to allow profile setup
        setUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          isFirstTime: true
        })
        setIsFirstTime(true)
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      setUser(null)
      setIsFirstTime(true)
    } finally {
      setLoading(false)
    }
  }

  const syncUserToSupabase = async (userData) => {
    try {
      if (!session) {
        console.error('Session is not available for syncUserToSupabase')
        return { success: false, error: { message: 'User session not available' } }
      }
      
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for sync')
        return { success: false, error: { message: 'No authentication token available' } }
      }
      
      // Prepare user data for server using proper Clerk user properties
      const profileData = {
        username: userData.username || clerkUser.username || `user_${Date.now()}`,
        display_name: userData.display_name || 
          (clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : clerkUser.firstName || clerkUser.lastName || 'User'),
        email: userData.email || clerkUser.primaryEmailAddress?.emailAddress || '',
        profile_picture: userData.profile_picture || clerkUser.imageUrl || null,
        headline: userData.headline || '',
        location: userData.location || '',
        bio: userData.bio || '',
        github_url: userData.github_url || '',
        linkedin_url: userData.linkedin_url || '',
        website_url: userData.website_url || '',
        is_profile_complete: true,
        ...userData
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userData: profileData })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile sync successful:', data)
        setUser(data)
        setIsFirstTime(false) // Profile is now complete, not first time anymore
        console.log('isFirstTime set to false - profile complete')
        return { success: true, data }
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to sync user')
      }
    } catch (error) {
      console.error('Error syncing user:', error)
      return { success: false, error: { message: error.message } }
    }
  }

  const updateUser = async (updates) => {
    try {
      if (!session) {
        console.error('Session is not available for updateUser')
        return { success: false, error: { message: 'User session not available' } }
      }
      
      const token = await session.getToken()
      
      if (!token) {
        console.error('No session token available for update')
        return { success: false, error: { message: 'No authentication token available' } }
      }
      
      const formData = new FormData()
      Object.keys(updates).forEach(key => {
        if (key === 'profile_picture' && updates[key].startsWith('data:')) {
          // Convert base64 to blob for FormData
          const byteString = atob(updates[key].split(',')[1])
          const mimeString = updates[key].split(',')[0].split(':')[1].split(';')[0]
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          formData.append('image', new Blob([ab], { type: mimeString }), 'profile.png')
        } else {
          formData.append(key, updates[key])
        }
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setIsFirstTime(!data.is_profile_complete)
        return { success: true, data }
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: { message: error.message } }
    }
  }

  const value = {
    user,
    loading,
    isFirstTime,
    syncUserToSupabase,
    updateUser,
    refetchUser: fetchUserData
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
} 