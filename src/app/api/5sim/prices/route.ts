import { NextRequest, NextResponse } from 'next/server'
import { fetchPricing } from '@/lib/5sim-client'

export const revalidate = 30 // Cache for 30 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const product = searchParams.get('product')

    if (!country || !product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: country and product',
        },
        { status: 400 }
      )
    }

    const pricing = await fetchPricing(country, product)

    return NextResponse.json({
      success: true,
      data: {
        country,
        product,
        ...pricing,
      },
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pricing',
      },
      { status: 500 }
    )
  }
}
