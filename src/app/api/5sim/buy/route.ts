import { NextRequest, NextResponse } from 'next/server'
import { buyNumber } from '@/lib/5sim-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, product, operator = 'any' } = body

    if (!country || !product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: country and product',
        },
        { status: 400 }
      )
    }

    const activation = await buyNumber(country, product, operator)

    return NextResponse.json({
      success: true,
      data: activation,
    })
  } catch (error) {
    console.error('Error buying number:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to buy number'

    // Check for specific error types
    if (errorMessage.includes('no free phones')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu servis için şu anda müsait numara yok',
          code: 'NO_STOCK',
        },
        { status: 404 }
      )
    }

    if (errorMessage.includes('not enough')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Yetersiz 5sim bakiyesi',
          code: 'INSUFFICIENT_BALANCE',
        },
        { status: 402 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
