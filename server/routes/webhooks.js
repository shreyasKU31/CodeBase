const express = require('express')
const { verifyWebhook } = require('@clerk/backend/webhooks')
const { createClerkSupabaseClient } = require('../config/supabase')

const router = express.Router()

// Clerk webhook endpoint for user synchronization
router.post('/clerk', async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    const event = await verifyWebhook(req, { signingSecret: webhookSecret })
    
    // Create Supabase client with service role key for webhook operations
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured')
      return res.status(500).json({ error: 'Supabase credentials not configured' })
    }
    
    const supabase = createClerkSupabaseClient(null, supabaseServiceKey)

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'user.created': {
        // Handle user creation
        const { data: user, error } = await supabase
          .from('users')
          .insert([
            {
              id: event.data.id,
              email: event.data.email_addresses?.[0]?.email_address || '',
              username: event.data.username || `user_${Date.now()}`,
              display_name: event.data.first_name && event.data.last_name 
                ? `${event.data.first_name} ${event.data.last_name}`
                : event.data.first_name || event.data.last_name || 'User',
              profile_picture: event.data.image_url || null,
              is_profile_complete: false,
              created_at: new Date(event.data.created_at).toISOString(),
              updated_at: new Date(event.data.updated_at).toISOString(),
            },
          ])
          .select()
          .single()

        if (error) {
          console.error('Error creating user:', error)
          return res.status(500).json({ error: error.message })
        }

        console.log('User created successfully:', user.id)
        return res.json({ user })
      }

      case 'user.updated': {
        // Handle user update
        const { data: user, error } = await supabase
          .from('users')
          .update({
            email: event.data.email_addresses?.[0]?.email_address || '',
            username: event.data.username || `user_${Date.now()}`,
            display_name: event.data.first_name && event.data.last_name 
              ? `${event.data.first_name} ${event.data.last_name}`
              : event.data.first_name || event.data.last_name || 'User',
            profile_picture: event.data.image_url || null,
            updated_at: new Date(event.data.updated_at).toISOString(),
          })
          .eq('id', event.data.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating user:', error)
          return res.status(500).json({ error: error.message })
        }

        console.log('User updated successfully:', user.id)
        return res.json({ user })
      }

      case 'user.deleted': {
        // Handle user deletion
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', event.data.id)

        if (error) {
          console.error('Error deleting user:', error)
          return res.status(500).json({ error: error.message })
        }

        console.log('User deleted successfully:', event.data.id)
        return res.json({ success: true })
      }

      default: {
        // Unhandled event type
        console.log('Unhandled event type:', event.type)
        return res.json({ success: true })
      }
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
})

module.exports = router 