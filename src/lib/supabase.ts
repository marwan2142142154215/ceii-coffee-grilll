import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL dan Anon Key harus diatur di .env.local')
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

export function createServerClient() {
  return getClient()
}

function createLazyProxy(): SupabaseClient {
  const cache: Record<string, any> = {}
  return new Proxy({} as SupabaseClient, {
    get(_, prop: string | symbol) {
      if (cache[prop as string]) return cache[prop as string]
      const client = getClient()
      const value = (client as any)[prop]
      if (typeof value === 'function') {
        const bound = (...args: any[]) => value.apply(client, args)
        cache[prop as string] = bound
        return bound
      }
      cache[prop as string] = value
      return value
    },
  })
}

export const supabase = createLazyProxy()
