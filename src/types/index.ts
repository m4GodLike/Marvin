// User and Profile Types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
}

export interface Profile {
  id: string
  user_id: string
  name?: string
  year_of_birth?: number
  birth_time?: string
  birth_place?: string
  birth_coordinates?: { lat: number; lng: number }
  hd_type?: string
  hd_strategy?: string
  hd_authority?: string
  astro_sun_sign?: string
  astro_moon_sign?: string
  astro_rising_sign?: string
  consent_data_processing: boolean
  consent_timestamp?: string
  privacy_level: 'minimal' | 'standard' | 'full'
  created_at: string
  updated_at: string
}

// Chat Types
export interface ChatSession {
  id: string
  user_id: string
  title?: string
  started_at: string
  ended_at?: string
  message_count: number
  total_tokens: number
  session_type: 'chat' | 'onboarding' | 'assessment'
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  model?: string
  temperature?: number
  created_at: string
  metadata?: Record<string, any>
}

// Memory Types
export interface Memory {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category?: 'goal' | 'insight' | 'pattern' | 'trigger' | 'strength'
  importance_score: number
  last_referenced: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Affirmation {
  id: string
  user_id: string
  text: string
  category?: 'self_love' | 'abundance' | 'health' | 'relationships'
  is_active: boolean
  usage_count: number
  last_used?: string
  created_at: string
}

// File and Document Types
export interface UploadedFile {
  id: string
  user_id: string
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  upload_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error?: string
  created_at: string
  processed_at?: string
}

export interface Document {
  id: string
  user_id: string
  filename: string
  content: string
  chunk_count: number
  file_size: number
  file_type: string
  created_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  user_id: string
  content: string
  chunk_index: number
  token_count: number
  embedding?: number[]
  created_at: string
}

// Insight Types
export interface Insight {
  id: string
  user_id: string
  session_id?: string
  emotion?: string
  energy_level?: number
  focus_area?: string
  consciousness_level?: 'A' | 'B' | 'C' | 'D'
  current_challenge?: string
  next_step?: string
  breakthrough_moment?: string
  created_at: string
}

// User Preferences
export interface UserPreferences {
  id: string
  user_id: string
  preferred_language: string
  timezone: string
  notification_settings: Record<string, any>
  quick_actions: string[]
  coaching_style: 'gentle' | 'balanced' | 'direct'
  session_reminder_enabled: boolean
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ChatResponse {
  message: string
  session_id: string
  consciousness_level?: 'A' | 'B' | 'C' | 'D'
  insights?: {
    emotions: string[]
    topics: string[]
    patterns: string[]
    goals: string[]
  }
  rag_sources?: Array<{
    content: string
    source: string
    page?: number
  }>
}

// RAG Types
export interface RAGSource {
  content: string
  source: string
  similarity?: number
  page?: number
  metadata?: Record<string, any>
}

export interface EmbeddingResult {
  embedding: number[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

// Component Props Types
export interface ChatBubbleProps {
  message: ChatMessage
  isTyping?: boolean
}

export interface QuickActionProps {
  icon: string
  label: string
  action: string
  onClick: () => void
}

export interface MemoryCardProps {
  memory: Memory
  onEdit?: (memory: Memory) => void
  onDelete?: (id: string) => void
}

export interface ConsciousnessLevelProps {
  level: 'A' | 'B' | 'C' | 'D'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Form Types
export interface OnboardingFormData {
  consent_data_processing: boolean
  name?: string
  year_of_birth?: number
  birth_time?: string
  birth_place?: string
}

export interface ProfileFormData {
  name?: string
  year_of_birth?: number
  birth_time?: string
  birth_place?: string
  privacy_level: 'minimal' | 'standard' | 'full'
}

// Admin Types
export interface AdminStats {
  total_users: number
  active_sessions: number
  messages_today: number
  uploaded_files: number
  system_status: 'healthy' | 'warning' | 'error'
}

export interface AdminUser {
  id: string
  email: string
  name?: string
  created_at: string
  last_login?: string
  message_count: number
  file_count: number
  is_active: boolean
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
}

// Utility Types
export type ConsciousnessLevel = 'A' | 'B' | 'C' | 'D'
export type MessageRole = 'user' | 'assistant' | 'system'
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PrivacyLevel = 'minimal' | 'standard' | 'full'
export type CoachingStyle = 'gentle' | 'balanced' | 'direct'

// Context Types
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export interface ChatContextType {
  currentSession: ChatSession | null
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  startNewSession: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
}

// PWA Types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Human Design Types
export interface HumanDesignData {
  type: 'Generator' | 'Manifestor' | 'Projector' | 'Reflector' | 'Manifesting Generator'
  strategy: string
  authority: string
  profile: string
  definition: string
  centers: {
    head: boolean
    ajna: boolean
    throat: boolean
    g: boolean
    heart: boolean
    spleen: boolean
    sacral: boolean
    solar_plexus: boolean
    root: boolean
  }
}

// Astrology Types
export interface AstrologyData {
  sun_sign: string
  moon_sign: string
  rising_sign: string
  birth_chart?: Record<string, any>
}

