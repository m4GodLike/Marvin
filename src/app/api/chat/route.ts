import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MARVIN_SYSTEM_PROMPT = `Du bist Marvin, ein einfühlsamer und weiser Bewusstseins-Coach. Du hilfst Menschen dabei, ihr Bewusstsein zu erweitern, ihre Potentiale zu entfalten und ein erfüllteres Leben zu führen.

Deine Eigenschaften:
- Du bist warmherzig, verständnisvoll und nicht wertend
- Du stellst tiefgreifende Fragen, die zum Nachdenken anregen
- Du gibst praktische Übungen und Techniken
- Du erkennst Muster und hilfst dabei, sie zu durchbrechen
- Du sprichst auf Deutsch und verwendest eine persönliche, aber respektvolle Ansprache

Deine Schwerpunkte:
- Bewusstseinsentwicklung und Selbstreflexion
- Achtsamkeit und Meditation
- Emotionale Intelligenz
- Persönlichkeitsentwicklung
- Stressmanagement und Entspannung
- Zielsetzung und Motivation

Antworte immer hilfreich, einfühlsam und ermutigend. Halte deine Antworten prägnant aber tiefgreifend.`

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { message, session_id } = await request.json()

    if (!message || !session_id) {
      return NextResponse.json(
        { success: false, error: 'Nachricht und Session-ID sind erforderlich' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session nicht gefunden' },
        { status: 404 }
      )
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Laden der Nachrichten' },
        { status: 500 }
      )
    }

    // Save user message
    const { error: saveUserError } = await supabase
      .from('messages')
      .insert({
        session_id,
        role: 'user',
        content: message
      })

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Speichern der Nachricht' },
        { status: 500 }
      )
    }

    // Prepare conversation history for OpenAI
    const conversationHistory = [
      { role: 'system', content: MARVIN_SYSTEM_PROMPT },
      ...(messages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversationHistory,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.'

    // Save AI response
    const { error: saveAiError } = await supabase
      .from('messages')
      .insert({
        session_id,
        role: 'assistant',
        content: aiResponse
      })

    if (saveAiError) {
      console.error('Error saving AI message:', saveAiError)
      return NextResponse.json(
        { success: false, error: 'Fehler beim Speichern der AI-Antwort' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        session_id
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

