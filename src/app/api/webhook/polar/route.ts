import { Webhooks } from '@polar-sh/nextjs'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // For production, use service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    } else {
      // Development fallback - use application default credentials
      initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    }
  }
  return getDatabase()
}

// Handle checkout completed event with idempotency protection
async function handleCheckoutCompleted(
  data: {
    id: string
    metadata?: Record<string, string>
    amount?: number
  },
  eventType: string
) {
  const checkoutId = data.id
  const { metadata } = data

  if (!metadata?.userId) {
    console.error('[Webhook] Missing userId in checkout metadata:', checkoutId)
    return
  }

  const userId = metadata.userId
  const amount = parseFloat(metadata.amount || '0')
  const bonusAmount = parseFloat(metadata.bonusAmount || '0')
  const totalCredits = parseFloat(metadata.totalCredits || '0')

  console.log('[Webhook] Processing checkout:', {
    checkoutId,
    eventType,
    userId,
    amount,
    bonusAmount,
    totalCredits,
  })

  try {
    const db = getFirebaseAdmin()

    // IDEMPOTENCY CHECK: Check if this checkout was already processed
    const processedRef = db.ref(`processed_checkouts/${checkoutId}`)
    const existingSnapshot = await processedRef.get()

    if (existingSnapshot.exists()) {
      console.log('[Webhook] Duplicate webhook ignored - already processed:', {
        checkoutId,
        eventType,
        originalProcessedAt: existingSnapshot.val().processedAt,
      })
      return // Already processed, skip
    }

    // Get current balance
    const balanceRef = db.ref(`users/${userId}/profile/balance`)
    const balanceSnapshot = await balanceRef.get()
    const currentBalance = balanceSnapshot.val() || 0
    const newBalance = currentBalance + totalCredits

    // Generate transaction ID
    const transactionId = db.ref(`users/${userId}/balance_transactions`).push().key

    // Prepare transaction data
    const transactionData = {
      type: 'topup',
      amount,
      bonusAmount,
      totalCredits,
      previousBalance: currentBalance,
      newBalance,
      checkoutId,
      packageId: metadata.packageId || 'custom',
      source: 'polar',
      createdAt: new Date().toISOString(),
    }

    // Prepare idempotency record
    const processedRecord = {
      processedAt: new Date().toISOString(),
      eventType,
      userId,
      totalCredits,
      transactionId,
    }

    // ATOMIC MULTI-PATH UPDATE: Update all locations at once
    const updates: Record<string, unknown> = {
      [`users/${userId}/profile/balance`]: newBalance,
      [`users/${userId}/balance_transactions/${transactionId}`]: transactionData,
      [`processed_checkouts/${checkoutId}`]: processedRecord,
    }

    await db.ref().update(updates)

    console.log('[Webhook] Successfully credited balance:', {
      checkoutId,
      userId,
      totalCredits,
      previousBalance: currentBalance,
      newBalance,
      transactionId,
    })
  } catch (error) {
    console.error('[Webhook] Error processing checkout:', {
      checkoutId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

// Webhook handler using Polar's Next.js adapter
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log('Received Polar webhook:', payload.type)

    // Use type assertion for payload.type to handle all possible event types
    const eventType = payload.type as string

    switch (eventType) {
      case 'checkout.created':
        console.log('Checkout created:', (payload.data as { id: string }).id)
        break

      case 'checkout.updated':
        console.log('Checkout updated:', (payload.data as { id: string; status?: string }).id)
        break

      case 'order.paid':
        console.log('[Webhook] Order paid:', (payload.data as { id: string }).id)
        // Handle successful payment - add balance to user
        await handleCheckoutCompleted(
          payload.data as {
            id: string
            metadata?: Record<string, string>
            amount?: number
          },
          'order.paid'
        )
        break

      case 'order.created':
        console.log('[Webhook] Order created:', (payload.data as { id: string }).id)
        // Log only, don't process yet - wait for order.paid
        break

      case 'subscription.created':
        console.log('Subscription created:', (payload.data as { id: string }).id)
        break

      case 'subscription.updated':
        console.log('Subscription updated:', (payload.data as { id: string }).id)
        break

      case 'subscription.canceled':
        console.log('Subscription canceled:', (payload.data as { id: string }).id)
        break

      default:
        console.log('Unhandled webhook event:', eventType)
    }
  },
})

// Alternative manual handler - kept as reference but not exported
// async function handleWebhookManually(request: NextRequest) { ... }
