import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { title } = await request.json()

    // Deactivate all existing sessions for this user
    await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        title: title || 'Neue Unterhaltung',
        is_active: true,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Erstellen der Session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: session
    })

  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden der Sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sessions
    })

  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

