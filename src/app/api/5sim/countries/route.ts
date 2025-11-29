import { NextResponse } from 'next/server'
import { fetchCountries } from '@/lib/5sim-client'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    const countries = await fetchCountries()

    // Sort by Turkish name
    countries.sort((a, b) => a.name.localeCompare(b.name, 'tr'))

    return NextResponse.json({
      success: true,
      data: countries,
    })
  } catch (error) {
    console.error('Error fetching countries:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch countries',
      },
      { status: 500 }
    )
  }
}
