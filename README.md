# Marvin - Dein Taschencoach PWA

Eine responsive Progressive Web App (PWA), die als KI-basierter Bewusstseins-Coach und therapeutischer Begleiter fungiert.

## Features

- 🤖 **AI-Coach Marvin**: Personalisierter Bewusstseins-Coach basierend auf GPT-4o
- 💾 **Persistente Erinnerung**: Speichert Nutzerprofil, Ziele und Erkenntnisse
- 📚 **RAG Wissensbasis**: PDF-Upload für personalisierte Antworten
- 🔒 **DSGVO-konform**: EU-Hosting und Datenschutz-Features
- 📱 **Mobile-First**: Responsive Design für alle Geräte
- ⚡ **PWA**: Offline-Funktionalität und App-Installation

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI GPT-4o, text-embedding-3-large
- **Auth**: Supabase Auth
- **Deployment**: Vercel (EU)

## Getting Started

### Prerequisites

- Node.js 18+
- npm oder yarn
- Supabase Account
- OpenAI API Key

### Installation

1. Clone das Repository:
```bash
git clone <repository-url>
cd marvin-pwa
```

2. Installiere Dependencies:
```bash
npm install
```

3. Kopiere Environment Variables:
```bash
cp .env.example .env.local
```

4. Fülle die Environment Variables aus:
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

5. Richte die Supabase Datenbank ein:
   - Führe das SQL-Schema aus `database_schema.sql` aus
   - Aktiviere die pgvector Extension
   - Konfiguriere Row Level Security

6. Starte den Development Server:
```bash
npm run dev
```

Die App ist nun unter `http://localhost:3000` verfügbar.

## Projektstruktur

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth-geschützte Routen
│   ├── api/            # API Routes
│   ├── globals.css     # Globale Styles
│   ├── layout.tsx      # Root Layout
│   └── page.tsx        # Homepage
├── components/         # React Components
│   ├── ui/            # UI Components (Shadcn/UI)
│   ├── chat/          # Chat-spezifische Components
│   ├── profile/       # Profil Components
│   └── admin/         # Admin Components
├── lib/               # Utility Libraries
│   ├── supabase.ts    # Supabase Client
│   ├── openai.ts      # OpenAI Client
│   └── utils.ts       # Helper Functions
└── types/             # TypeScript Type Definitions
```

## Entwicklung

### Database Schema

Das Datenbankschema umfasst:
- `users` - Basis-Nutzerdaten
- `profiles` - Erweiterte Profile mit HD/Astro-Daten
- `sessions` - Chat-Sessions
- `messages` - Einzelne Nachrichten
- `memories` - Persistente Erinnerungen
- `documents` - RAG-Dokumente mit Embeddings
- `insights` - Bewusstseins-Tracking

### API Endpoints

- `POST /api/chat` - Chat mit Marvin
- `POST /api/upload` - PDF Upload
- `GET /api/profile` - Nutzerprofil abrufen
- `POST /api/profile` - Profil aktualisieren
- `GET /api/memories` - Erinnerungen abrufen
- `POST /api/admin/*` - Admin-Funktionen

### Bewusstseinslevel

Marvin erkennt automatisch das Bewusstseinslevel:
- **A**: Suchend - Probleme, festgefahren, reaktiv
- **B**: Erwachend - Fragen stellen, suchen, öffnen
- **C**: Auf dem Weg - Wachstum, Selbstreflexion, Muster
- **D**: Hochbewusst - Spirituelle Sprache, Integration

## Deployment

### Vercel Deployment

1. Verbinde Repository mit Vercel
2. Konfiguriere Environment Variables
3. Deploy automatisch bei Git Push

### Supabase Setup

1. Erstelle neues Supabase Projekt (EU Region)
2. Führe Database Schema aus
3. Konfiguriere Storage für PDF-Dateien
4. Aktiviere Row Level Security

## DSGVO Compliance

- ✅ Explizite Einverständniserklärung
- ✅ EU-Hosting (Supabase EU, Vercel EU)
- ✅ Datenlöschung auf Anfrage
- ✅ Datenexport-Funktionalität
- ✅ Audit-Logging
- ✅ Verschlüsselung (at rest & in transit)

## Contributing

1. Fork das Repository
2. Erstelle Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit Changes (`git commit -m 'Add amazing feature'`)
4. Push Branch (`git push origin feature/amazing-feature`)
5. Öffne Pull Request

## License

Dieses Projekt ist unter der MIT License lizenziert.

## Support

Bei Fragen oder Problemen erstelle ein Issue im Repository oder kontaktiere das Entwicklungsteam.
