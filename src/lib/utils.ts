import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Format relative time
export function formatRelativeTime(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'gerade eben'
  if (diffInSeconds < 3600) return `vor ${Math.floor(diffInSeconds / 60)} Min`
  if (diffInSeconds < 86400) return `vor ${Math.floor(diffInSeconds / 3600)} Std`
  if (diffInSeconds < 604800) return `vor ${Math.floor(diffInSeconds / 86400)} Tagen`
  
  return formatDate(d)
}

// Truncate text
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Validate email
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sleep utility
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Chunk text for RAG processing
export function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 100) {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    let end = start + maxChunkSize
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastExclamation = text.lastIndexOf('!', end)
      const lastQuestion = text.lastIndexOf('?', end)
      
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
      
      if (lastSentenceEnd > start + maxChunkSize * 0.5) {
        end = lastSentenceEnd + 1
      }
    }
    
    chunks.push(text.slice(start, end).trim())
    start = end - overlap
  }
  
  return chunks.filter(chunk => chunk.length > 0)
}

// Calculate cosine similarity between vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Extract text from PDF buffer (simplified)
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // This would typically use pdf-parse or similar library
    // For now, return placeholder
    return "PDF text extraction would be implemented here"
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Validate consciousness level
export function isValidConsciousnessLevel(level: string): level is 'A' | 'B' | 'C' | 'D' {
  return ['A', 'B', 'C', 'D'].includes(level)
}

// Format consciousness level for display
export function formatConsciousnessLevel(level: 'A' | 'B' | 'C' | 'D'): string {
  const levels = {
    A: 'Suchend',
    B: 'Erwachend',
    C: 'Auf dem Weg',
    D: 'Hochbewusst'
  }
  return levels[level]
}

// Get consciousness level progress percentage
export function getConsciousnessProgress(level: 'A' | 'B' | 'C' | 'D'): number {
  const progress = {
    A: 25,
    B: 50,
    C: 75,
    D: 100
  }
  return progress[level]
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 2000) // Limit length
}

// Generate session title from first message
export function generateSessionTitle(firstMessage: string): string {
  const cleaned = sanitizeInput(firstMessage)
  const truncated = truncateText(cleaned, 50)
  
  if (truncated.length === 0) {
    return 'Neue Unterhaltung'
  }
  
  return truncated
}

// Check if user is admin (placeholder)
export function isAdmin(userId: string): boolean {
  // This would check against admin user list
  return false
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file type for PDF upload
export function isValidPDFFile(file: File): boolean {
  return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024 // 10MB limit
}

