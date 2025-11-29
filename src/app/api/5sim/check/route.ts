import { NextRequest, NextResponse } from 'next/server'
import { checkActivation } from '@/lib/5sim-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      )
    }

    const activation = await checkActivation(parseInt(id, 10))

    return NextResponse.json({
      success: true,
      data: activation,
    })
  } catch (error) {
    console.error('Error checking activation:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check activation',
      },
      { status: 500 }
    )
  }
}
