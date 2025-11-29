import { NextRequest, NextResponse } from 'next/server'
import { fetchServicePrices, getCountryDisplayName, getCountryFlag } from '@/lib/5sim-client'

export const revalidate = 60 // Cache for 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product = searchParams.get('product')

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: product',
        },
        { status: 400 }
      )
    }

    const prices = await fetchServicePrices(product)

    // Transform to include country names and flags, sorted by price
    const countriesWithPrices = Object.entries(prices)
      .map(([iso, priceInfo]) => ({
        iso,
        name: getCountryDisplayName(iso),
        flag: getCountryFlag(iso),
        ...priceInfo,
      }))
      .sort((a, b) => a.priceTry - b.priceTry) // Sort by price ascending

    return NextResponse.json({
      success: true,
      data: countriesWithPrices,
      product,
    })
  } catch (error) {
    console.error('Error fetching service prices:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service prices',
      },
      { status: 500 }
    )
  }
}
