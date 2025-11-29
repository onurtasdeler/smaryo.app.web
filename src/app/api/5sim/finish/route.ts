import { NextRequest, NextResponse } from 'next/server'
import { finishActivation } from '@/lib/5sim-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      )
    }

    const activation = await finishActivation(parseInt(id, 10))

    return NextResponse.json({
      success: true,
      data: activation,
    })
  } catch (error) {
    console.error('Error finishing activation:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to finish activation',
      },
      { status: 500 }
    )
  }
}
