'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChatMessage, ChatSession, ApiResponse, ChatResponse } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { Send, Menu, Settings, User, MessageCircle } from 'lucide-react'
import PWAInstaller from '@/components/PWAInstaller'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load or create initial session
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get the most recent session
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        setCurrentSession(session)
        loadMessages(session.id)
      } else {
        // Create new session
        await createNewSession()
      }
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Neue Unterhaltung' })
      })

      const result: ApiResponse<ChatSession> = await response.json()
      if (result.success && result.data) {
        setCurrentSession(result.data)
        setMessages([])
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`)
      const result: ApiResponse<ChatMessage[]> = await response.json()
      
      if (result.success && result.data) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentSession) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSession.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: currentSession.id
        })
      })

      const result: ApiResponse<ChatResponse> = await response.json()
      
      if (result.success && result.data) {
        // Remove temp message and add real messages
        setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
        
        // Add both user and assistant messages
        const realUserMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          session_id: currentSession.id,
          role: 'user',
          content: userMessage,
          created_at: new Date().toISOString()
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          session_id: currentSession.id,
          role: 'assistant',
          content: result.data.message,
          created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, realUserMessage, assistantMessage])
      } else {
        console.error('Chat API error:', result.error)
        // Remove temp message on error
        setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { icon: '👋', label: 'Intro', action: 'Kurzvorstellung' },
    { icon: '🫁', label: 'Atem', action: '2-Min Atem' },
    { icon: '⚡', label: 'Boost', action: '7-Tage-Booster' },
    { icon: '🎯', label: 'Fokus', action: 'Heute Fokus setzen' }
  ]

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Marvin</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              <button
                onClick={createNewSession}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                Neue Unterhaltung
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="md:hidden mr-3">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                Chat mit Marvin
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <a href="/profile" className="p-2 text-gray-600 hover:text-gray-900" title="Profil">
                <User className="h-5 w-5" />
              </a>
              <a href="/documents" className="p-2 text-gray-600 hover:text-gray-900" title="Dokumente">
                <Settings className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌟</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Willkommen bei Marvin
                </h2>
                <p className="text-gray-600 mb-8">
                  Dein persönlicher Bewusstseins-Coach ist bereit, dich zu begleiten.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <span className="text-2xl mb-2">{action.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatRelativeTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white text-gray-900 shadow-sm border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Schreibe eine Nachricht an Marvin..."
                  className="block w-full resize-none border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <PWAInstaller />
    </div>
  )
}

