'use client'

import { createClientComponentClient } from "@/lib/supabase"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingFormData } from "@/types"

export default function Onboarding() {
  const [formData, setFormData] = useState<OnboardingFormData>({
    consent_data_processing: false,
    name: "",
    year_of_birth: undefined,
    birth_time: "",
    birth_place: "",
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.consent_data_processing) {
      setError("Bitte stimmen Sie der Datenverarbeitung zu, um fortzufahren.")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("Benutzer nicht authentifiziert.")
      return
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id: user.id,
      name: formData.name,
      year_of_birth: formData.year_of_birth ? parseInt(formData.year_of_birth as any) : null,
      birth_time: formData.birth_time || null,
      birth_place: formData.birth_place || null,
      consent_data_processing: formData.consent_data_processing,
    })

    if (profileError) {
      console.error("Profile update error:", profileError)
      setError("Fehler beim Speichern Ihrer Profilinformationen.")
    } else {
      router.push("/chat") // Redirect to chat after onboarding
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Willkommen bei Marvin! Lass uns starten.
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Dein Name (optional)
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="year_of_birth" className="block text-sm font-medium leading-6 text-gray-900">
              Geburtsjahr (optional)
            </label>
            <div className="mt-2">
              <input
                id="year_of_birth"
                name="year_of_birth"
                type="number"
                value={formData.year_of_birth || ""}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birth_time" className="block text-sm font-medium leading-6 text-gray-900">
              Geburtszeit (optional, für Human Design)
            </label>
            <div className="mt-2">
              <input
                id="birth_time"
                name="birth_time"
                type="time"
                value={formData.birth_time}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birth_place" className="block text-sm font-medium leading-6 text-gray-900">
              Geburtsort (optional, für Human Design)
            </label>
            <div className="mt-2">
              <input
                id="birth_place"
                name="birth_place"
                type="text"
                value={formData.birth_place}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="consent_data_processing"
              name="consent_data_processing"
              type="checkbox"
              checked={formData.consent_data_processing}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="consent_data_processing" className="ml-2 block text-sm text-gray-900">
              Ich stimme der Speicherung meiner Daten zu, um eine personalisierte Begleitung zu erhalten.
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Speichern und Starten
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}


