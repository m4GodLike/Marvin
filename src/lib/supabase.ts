import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const createClientComponentClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client for Server Components
export const createServerComponentClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Server-side Supabase client for Route Handlers
export const createRouteHandlerClient = (request: Request) => {
  const response = new Response()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.headers.get('cookie')?.split(';')
          .find(c => c.trim().startsWith(`${name}=`))
          ?.split('=')[1]
      },
      set(name: string, value: string, options: any) {
        response.headers.append('Set-Cookie', `${name}=${value}; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`)
      },
      remove(name: string, options: any) {
        response.headers.append('Set-Cookie', `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`)
      },
    },
  })
}

// Admin client with service role key
export const createAdminClient = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          year_of_birth: number | null
          birth_time: string | null
          birth_place: string | null
          birth_coordinates: unknown | null
          hd_type: string | null
          hd_strategy: string | null
          hd_authority: string | null
          astro_sun_sign: string | null
          astro_moon_sign: string | null
          astro_rising_sign: string | null
          consent_data_processing: boolean
          consent_timestamp: string | null
          privacy_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          year_of_birth?: number | null
          birth_time?: string | null
          birth_place?: string | null
          birth_coordinates?: unknown | null
          hd_type?: string | null
          hd_strategy?: string | null
          hd_authority?: string | null
          astro_sun_sign?: string | null
          astro_moon_sign?: string | null
          astro_rising_sign?: string | null
          consent_data_processing?: boolean
          consent_timestamp?: string | null
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          year_of_birth?: number | null
          birth_time?: string | null
          birth_place?: string | null
          birth_coordinates?: unknown | null
          hd_type?: string | null
          hd_strategy?: string | null
          hd_authority?: string | null
          astro_sun_sign?: string | null
          astro_moon_sign?: string | null
          astro_rising_sign?: string | null
          consent_data_processing?: boolean
          consent_timestamp?: string | null
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          started_at: string
          ended_at: string | null
          message_count: number
          total_tokens: number
          session_type: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          started_at?: string
          ended_at?: string | null
          message_count?: number
          total_tokens?: number
          session_type?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          started_at?: string
          ended_at?: string | null
          message_count?: number
          total_tokens?: number
          session_type?: string
          is_active?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          tokens: number | null
          model: string | null
          temperature: number | null
          created_at: string
          metadata: any | null
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          tokens?: number | null
          model?: string | null
          temperature?: number | null
          created_at?: string
          metadata?: any | null
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          tokens?: number | null
          model?: string | null
          temperature?: number | null
          created_at?: string
          metadata?: any | null
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          category: string | null
          importance_score: number
          last_referenced: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          tags?: string[]
          category?: string | null
          importance_score?: number
          last_referenced?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          category?: string | null
          importance_score?: number
          last_referenced?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      affirmations: {
        Row: {
          id: string
          user_id: string
          text: string
          category: string | null
          is_active: boolean
          usage_count: number
          last_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          category?: string | null
          is_active?: boolean
          usage_count?: number
          last_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          category?: string | null
          is_active?: boolean
          usage_count?: number
          last_used?: string | null
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          original_name: string
          file_path: string
          file_size: number
          mime_type: string
          upload_status: string
          processing_error: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          original_name: string
          file_path: string
          file_size: number
          mime_type: string
          upload_status?: string
          processing_error?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          original_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          upload_status?: string
          processing_error?: string | null
          created_at?: string
          processed_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          filename: string
          content: string
          chunk_count: number
          file_size: number
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          content: string
          chunk_count?: number
          file_size: number
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          content?: string
          chunk_count?: number
          file_size?: number
          file_type?: string
          created_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          user_id: string
          content: string
          chunk_index: number
          token_count: number
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          content: string
          chunk_index: number
          token_count?: number
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          content?: string
          chunk_index?: number
          token_count?: number
          embedding?: number[] | null
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          emotion: string | null
          energy_level: number | null
          focus_area: string | null
          consciousness_level: string | null
          current_challenge: string | null
          next_step: string | null
          breakthrough_moment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          emotion?: string | null
          energy_level?: number | null
          focus_area?: string | null
          consciousness_level?: string | null
          current_challenge?: string | null
          next_step?: string | null
          breakthrough_moment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          emotion?: string | null
          energy_level?: number | null
          focus_area?: string | null
          consciousness_level?: string | null
          current_challenge?: string | null
          next_step?: string | null
          breakthrough_moment?: string | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_language: string
          timezone: string
          notification_settings: any
          quick_actions: string[]
          coaching_style: string
          session_reminder_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_language?: string
          timezone?: string
          notification_settings?: any
          quick_actions?: string[]
          coaching_style?: string
          session_reminder_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_language?: string
          timezone?: string
          notification_settings?: any
          quick_actions?: string[]
          coaching_style?: string
          session_reminder_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

