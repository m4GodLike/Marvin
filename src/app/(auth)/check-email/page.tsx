import Link from "next/link"

export default function CheckEmail() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Bestätige deine E-Mail-Adresse
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <p className="mt-4 text-center text-sm text-gray-600">
          Wir haben dir eine Bestätigungs-E-Mail gesendet. Bitte überprüfe deinen Posteingang (und Spam-Ordner),
          um deine Registrierung abzuschließen.
        </p>
        <p className="mt-4 text-center text-sm text-gray-600">
          Nach der Bestätigung kannst du dich <Link href="/signin" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">hier anmelden</Link>.
        </p>
      </div>
    </div>
  )
}

