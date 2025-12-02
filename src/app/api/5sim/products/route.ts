import { NextRequest, NextResponse } from 'next/server'
import { fetchProducts, POPULAR_SERVICES, rubToUsd } from '@/lib/5sim-client'

export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'indonesia'
    const operator = searchParams.get('operator') || 'any'

    const products = await fetchProducts(country, operator)

    // Transform products with popular service info
    const transformedProducts = products.map((product) => {
      const popularService = POPULAR_SERVICES.find(
        (s) => s.id === product.product
      )

      return {
        id: product.product,
        name: popularService?.name || product.product,
        price: product.price,
        priceUsd: rubToUsd(product.price),
        count: product.count,
        operator: product.operator,
        isPopular: !!popularService,
      }
    })

    // Sort: popular first, then by count
    transformedProducts.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1
      if (!a.isPopular && b.isPopular) return 1
      return b.count - a.count
    })

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      country,
      operator,
    })
  } catch (error) {
    console.error('Error fetching products:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}
