import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/clerk-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create the main Supabase client following the React documentation pattern
export const supabase = createClient(supabaseUrl, supabaseKey)

// Create a custom Supabase client that can be used with Clerk authentication
export function createClerkSupabaseClient(clerkToken = null) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: clerkToken ? {
        Authorization: `Bearer ${clerkToken}`
      } : {}
    }
  })
}

// Hook to get a Clerk-integrated Supabase client
export function useSupabase() {
  const { session } = useSession()
  
  const getSupabaseClient = async () => {
    if (session) {
      const token = await session.getToken()
      return createClerkSupabaseClient(token)
    }
    return supabase
  }
  
  return { supabase, getSupabaseClient }
} 