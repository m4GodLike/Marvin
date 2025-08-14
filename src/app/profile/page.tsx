'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Profile, Memory, ApiResponse } from '@/types'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [newMemory, setNewMemory] = useState({ title: '', content: '', tags: '' })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
    fetchMemories()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  const fetchMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Memories fetch error:', error)
    } else {
      setMemories(data || [])
    }
  }

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...updatedProfile,
        updated_at: new Date().toISOString()
      })

    if (error) {
      toast.error('Fehler beim Speichern des Profils')
      console.error('Profile update error:', error)
    } else {
      toast.success('Profil erfolgreich aktualisiert')
      setEditingProfile(false)
      fetchProfile()
    }
  }

  const addMemory = async () => {
    if (!newMemory.title || !newMemory.content) {
      toast.error('Titel und Inhalt sind erforderlich')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tags = newMemory.tags.split(',').map(tag => tag.trim()).filter(tag => tag)

    const { error } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        title: newMemory.title,
        content: newMemory.content,
        tags,
        importance_score: 5,
        last_referenced: new Date().toISOString()
      })

    if (error) {
      toast.error('Fehler beim Speichern der Erinnerung')
      console.error('Memory insert error:', error)
    } else {
      toast.success('Erinnerung erfolgreich hinzugefügt')
      setNewMemory({ title: '', content: '', tags: '' })
      fetchMemories()
    }
  }

  const deleteMemory = async (memoryId: string) => {
    if (!confirm('Möchten Sie diese Erinnerung wirklich löschen?')) return

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)

    if (error) {
      toast.error('Fehler beim Löschen der Erinnerung')
      console.error('Memory delete error:', error)
    } else {
      toast.success('Erinnerung erfolgreich gelöscht')
      fetchMemories()
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Lädt...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Mein Profil</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Persönliche Informationen</h2>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {editingProfile ? 'Abbrechen' : 'Bearbeiten'}
          </button>
        </div>

        {editingProfile ? (
          <ProfileEditForm 
            profile={profile} 
            onSave={updateProfile}
            onCancel={() => setEditingProfile(false)}
          />
        ) : (
          <ProfileDisplay profile={profile} />
        )}
      </div>

      {/* Memories Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Meine Erinnerungen</h2>
        
        {/* Add New Memory */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Neue Erinnerung hinzufügen</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titel"
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            <textarea
              placeholder="Inhalt"
              value={newMemory.content}
              onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
              className="w-full p-2 border rounded-md h-24"
            />
            <input
              type="text"
              placeholder="Tags (kommagetrennt)"
              value={newMemory.tags}
              onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            <button
              onClick={addMemory}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Erinnerung hinzufügen
            </button>
          </div>
        </div>

        {/* Memories List */}
        <div className="space-y-4">
          {memories.length === 0 ? (
            <p className="text-gray-500">Noch keine Erinnerungen vorhanden.</p>
          ) : (
            memories.map((memory) => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onDelete={deleteMemory}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileDisplay({ profile }: { profile: Profile | null }) {
  if (!profile) return <p>Kein Profil gefunden.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <p className="mt-1 text-sm text-gray-900">{profile.name || 'Nicht angegeben'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Geburtsjahr</label>
        <p className="mt-1 text-sm text-gray-900">{profile.year_of_birth || 'Nicht angegeben'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Geburtszeit</label>
        <p className="mt-1 text-sm text-gray-900">{profile.birth_time || 'Nicht angegeben'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Geburtsort</label>
        <p className="mt-1 text-sm text-gray-900">{profile.birth_place || 'Nicht angegeben'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Human Design Typ</label>
        <p className="mt-1 text-sm text-gray-900">{profile.hd_type || 'Nicht bestimmt'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Datenschutzlevel</label>
        <p className="mt-1 text-sm text-gray-900">{profile.privacy_level}</p>
      </div>
    </div>
  )
}

function ProfileEditForm({ 
  profile, 
  onSave, 
  onCancel 
}: { 
  profile: Profile | null
  onSave: (profile: Partial<Profile>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    year_of_birth: profile?.year_of_birth || '',
    birth_time: profile?.birth_time || '',
    birth_place: profile?.birth_place || '',
    privacy_level: profile?.privacy_level || 'standard'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      year_of_birth: formData.year_of_birth ? parseInt(formData.year_of_birth as any) : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Geburtsjahr</label>
          <input
            type="number"
            value={formData.year_of_birth}
            onChange={(e) => setFormData({ ...formData, year_of_birth: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Geburtszeit</label>
          <input
            type="time"
            value={formData.birth_time}
            onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Geburtsort</label>
          <input
            type="text"
            value={formData.birth_place}
            onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Datenschutzlevel</label>
          <select
            value={formData.privacy_level}
            onChange={(e) => setFormData({ ...formData, privacy_level: e.target.value as any })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="minimal">Minimal</option>
            <option value="standard">Standard</option>
            <option value="full">Vollständig</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}

function MemoryCard({ 
  memory, 
  onDelete 
}: { 
  memory: Memory
  onDelete: (id: string) => void
}) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-lg">{memory.title}</h4>
        <button
          onClick={() => onDelete(memory.id)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Löschen
        </button>
      </div>
      <p className="text-gray-700 mb-2">{memory.content}</p>
      {memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memory.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Erstellt: {new Date(memory.created_at).toLocaleDateString('de-DE')}
      </p>
    </div>
  )
}

