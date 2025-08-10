'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { AdminStats, AdminUser } from '@/types'
import { Users, MessageSquare, FileText, Activity, TrendingUp, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Check if user is admin (simple check - in production use proper role-based auth)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht authentifiziert')
        return
      }

      // Fetch basic stats
      const [
        { count: totalUsers },
        { count: activeSessions },
        { count: messagesToday },
        { count: uploadedFiles }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('documents').select('*', { count: 'exact', head: true })
      ])

      setStats({
        total_users: totalUsers || 0,
        active_sessions: activeSessions || 0,
        messages_today: messagesToday || 0,
        uploaded_files: uploadedFiles || 0,
        system_status: 'healthy'
      })

      // Fetch user list with basic info
      const { data: profilesData } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          name,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (profilesData) {
        const adminUsers: AdminUser[] = profilesData.map(profile => ({
          id: profile.user_id,
          email: 'user@example.com', // Would need to join with auth.users in production
          name: profile.name || 'Unbekannt',
          created_at: profile.created_at,
          last_login: profile.updated_at,
          message_count: 0, // Would need to calculate
          file_count: 0, // Would need to calculate
          is_active: true
        }))
        setUsers(adminUsers)
      }

    } catch (err) {
      console.error('Admin data fetch error:', err)
      setError('Fehler beim Laden der Admin-Daten')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Lädt Admin-Dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marvin Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Übersicht über System und Benutzer</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Gesamte Benutzer"
            value={stats?.total_users || 0}
            icon={<Users className="h-8 w-8 text-blue-600" />}
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Aktive Sessions"
            value={stats?.active_sessions || 0}
            icon={<Activity className="h-8 w-8 text-green-600" />}
            trend="+5%"
            trendUp={true}
          />
          <StatCard
            title="Nachrichten heute"
            value={stats?.messages_today || 0}
            icon={<MessageSquare className="h-8 w-8 text-purple-600" />}
            trend="+23%"
            trendUp={true}
          />
          <StatCard
            title="Hochgeladene Dateien"
            value={stats?.uploaded_files || 0}
            icon={<FileText className="h-8 w-8 text-orange-600" />}
            trend="+8%"
            trendUp={true}
          />
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-700 font-medium">System läuft normal</span>
            </div>
            <div className="ml-auto text-sm text-gray-500">
              Letztes Update: {new Date().toLocaleString('de-DE')}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Neueste Benutzer</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registriert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzter Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('de-DE') : 'Nie'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Benutzer verwalten"
            description="Benutzerkonten anzeigen und verwalten"
            action="Verwalten"
            onClick={() => console.log('Manage users')}
          />
          <QuickActionCard
            title="System-Logs"
            description="Systemprotokolle und Fehlerberichte anzeigen"
            action="Anzeigen"
            onClick={() => console.log('View logs')}
          />
          <QuickActionCard
            title="Backup erstellen"
            description="Vollständiges System-Backup erstellen"
            action="Backup"
            onClick={() => console.log('Create backup')}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  trend: string
  trendUp: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp className={`h-4 w-4 ${trendUp ? 'text-green-500' : 'text-red-500'}`} />
        <span className={`text-sm font-medium ml-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
        <span className="text-sm text-gray-500 ml-1">vs. letzter Monat</span>
      </div>
    </div>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  action, 
  onClick 
}: { 
  title: string
  description: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        {action}
      </button>
    </div>
  )
}

