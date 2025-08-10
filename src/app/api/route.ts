export const dynamic = 'force-static'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Marvin PWA',
    version: '1.0.0',
    message: 'Static version - API functionality requires server deployment'
  })
}

