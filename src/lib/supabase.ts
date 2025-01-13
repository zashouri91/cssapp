// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a default client without auth headers
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create a client with auth headers for authenticated requests
export const createSupabaseClient = (clerkToken?: string) => {
  console.log('Creating Supabase client with token:', !!clerkToken);
  
  if (!clerkToken) {
    console.warn('No Clerk token provided for Supabase client');
    return supabase;
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    }
  });

  // Test the connection
  client.from('users').select('count').limit(1)
    .then(({ data, error }) => {
      console.log('Supabase connection test:', {
        success: !error,
        error: error?.message,
        data,
        headers: client.rest.headers
      });
    })
    .catch(err => {
      console.error('Supabase connection error:', err);
    });

  return client;
}