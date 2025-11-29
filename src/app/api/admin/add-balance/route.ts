/**
 * DEVELOPMENT ONLY - Admin endpoint to add balance
 * This should be removed or protected in production
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'

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
      // Development fallback
      initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    }
  }
  return { db: getDatabase(), auth: getAuth() }
}

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { email, amount } = await request.json()

    if (!email || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      )
    }

    const { db, auth } = getFirebaseAdmin()

    // Get user by email
    const userRecord = await auth.getUserByEmail(email)
    const userId = userRecord.uid

    // Get current balance
    const balanceRef = db.ref(`users/${userId}/profile/balance`)
    const snapshot = await balanceRef.get()
    const currentBalance = snapshot.val() || 0

    // Update balance
    const newBalance = currentBalance + amount
    await balanceRef.set(newBalance)

    // Record transaction
    const transactionRef = db.ref(`users/${userId}/balance_transactions`).push()
    await transactionRef.set({
      type: 'admin_credit',
      amount: amount,
      bonusAmount: 0,
      totalCredits: amount,
      previousBalance: currentBalance,
      newBalance: newBalance,
      source: 'admin_api',
      note: 'Test balance added via admin API',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      email,
      userId,
      previousBalance: currentBalance,
      addedAmount: amount,
      newBalance,
    })
  } catch (error) {
    console.error('Error adding balance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
