'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('consent_data_processing')
          .eq('user_id', user.id)
          .single()

        if (profile?.consent_data_processing) {
          router.push('/chat')
        } else {
          router.push('/onboarding')
        }
      } else {
        router.push('/signin')
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marvin</h1>
        <p className="text-gray-600">Dein Taschencoach lädt...</p>
      </div>
    </div>
  )
}
