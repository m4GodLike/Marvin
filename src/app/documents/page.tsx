
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Document, ApiResponse } from '@/types'
import { toast } from 'react-hot-toast'

export default function DocumentsPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
    if (error) {
      toast.error('Fehler beim Laden der Dokumente: ' + error.message)
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast.error('Bitte wählen Sie eine Datei aus.')
      return
    }

    setLoading(true)
    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result: ApiResponse = await response.json()

      if (result.success) {
        toast.success(result.message || 'Dokument erfolgreich hochgeladen und verarbeitet!')
        setFiles(null)
        fetchDocuments()
      } else {
        toast.error(result.error || 'Fehler beim Hochladen des Dokuments.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ein unerwarteter Fehler ist aufgetreten.')
    }
    setLoading(false)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      })
      const result: ApiResponse = await response.json()

      if (result.success) {
        toast.success(result.message || 'Dokument erfolgreich gelöscht!')
        fetchDocuments()
      } else {
        toast.error(result.error || 'Fehler beim Löschen des Dokuments.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ein unerwarteter Fehler ist aufgetreten.')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ihre Dokumente</h1>

      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Neues Dokument hochladen (PDF)</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {loading ? 'Wird hochgeladen...' : 'Hochladen'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Hochgeladene Dokumente</h2>
        {loading && <p>Dokumente werden geladen...</p>}
        {!loading && documents.length === 0 && <p>Noch keine Dokumente hochgeladen.</p>}
        {!loading && documents.length > 0 && (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center p-3 border rounded-md shadow-sm">
                <span>{doc.filename} ({Math.round(doc.file_size / 1024)} KB)</span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


