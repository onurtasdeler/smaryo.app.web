import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { getPolarClient } from '@/lib/polar'

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    } else {
      initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    }
  }
  return getDatabase()
}

export async function POST(request: NextRequest) {
  try {
    const { checkoutId, userId } = await request.json()

    // Validate required parameters
    if (!checkoutId) {
      return NextResponse.json(
        { success: false, error: 'Checkout ID gerekli' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı kimliği gerekli' },
        { status: 400 }
      )
    }

    console.log('[Verify] Checking checkout:', { checkoutId, userId })

    // 1. Get checkout status from Polar API
    const polar = getPolarClient()
    let checkout: {
      id: string
      status: string
      metadata?: Record<string, string | number | boolean> | null
    }

    try {
      checkout = await polar.checkouts.get({ id: checkoutId })
    } catch (polarError) {
      console.error('[Verify] Polar API error:', polarError)
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Ödeme durumu kontrol edilemedi'
        },
        { status: 500 }
      )
    }

    // 2. Security: Verify userId matches metadata
    const metadataUserId = checkout.metadata?.userId ? String(checkout.metadata.userId) : undefined
    if (metadataUserId && metadataUserId !== userId) {
      console.warn('[Verify] User ID mismatch:', {
        requestedUserId: userId,
        metadataUserId,
        checkoutId,
      })
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    // 3. Check checkout status
    const validStatuses = ['succeeded', 'confirmed']
    if (!validStatuses.includes(checkout.status)) {
      console.log('[Verify] Checkout not completed:', {
        checkoutId,
        status: checkout.status,
      })
      return NextResponse.json({
        success: false,
        status: checkout.status,
        message: getStatusMessage(checkout.status),
      })
    }

    // 4. Check if webhook already processed (balance updated)
    const db = getFirebaseAdmin()
    const transactionsRef = db.ref(`users/${userId}/balance_transactions`)
    const snapshot = await transactionsRef
      .orderByChild('checkoutId')
      .equalTo(checkoutId)
      .once('value')

    const balanceUpdated = snapshot.exists()

    // 5. Get payment details from metadata (trusted source)
    const amount = parseFloat(String(checkout.metadata?.amount ?? '0'))
    const bonusAmount = parseFloat(String(checkout.metadata?.bonusAmount ?? '0'))
    const totalCredits = parseFloat(String(checkout.metadata?.totalCredits ?? '0'))
    const packageId = String(checkout.metadata?.packageId ?? 'custom')

    console.log('[Verify] Checkout verified:', {
      checkoutId,
      userId,
      status: checkout.status,
      balanceUpdated,
      amount,
      totalCredits,
    })

    return NextResponse.json({
      success: true,
      status: checkout.status,
      amount,
      bonusAmount,
      totalCredits,
      packageId,
      balanceUpdated,
    })
  } catch (error) {
    console.error('[Verify] Error:', error)
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Doğrulama sırasında bir hata oluştu'
      },
      { status: 500 }
    )
  }
}

// Helper function to get Turkish status message
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    open: 'Ödeme henüz tamamlanmadı',
    expired: 'Ödeme oturumu süresi doldu',
    failed: 'Ödeme başarısız oldu',
    pending: 'Ödeme işleniyor',
  }
  return messages[status] || 'Ödeme durumu bilinmiyor'
}
