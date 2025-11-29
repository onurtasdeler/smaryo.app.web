/**
 * Script to add balance to a user account
 * Usage: node scripts/add-balance.mjs <email> <amount>
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')

    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex)
          let value = trimmed.slice(eqIndex + 1)
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          process.env[key] = value
        }
      }
    }
  } catch (error) {
    console.error('Could not load .env.local:', error.message)
  }
}

loadEnv()

const email = process.argv[2]
const amount = parseFloat(process.argv[3] || '100')

if (!email) {
  console.error('Usage: node scripts/add-balance.mjs <email> <amount>')
  process.exit(1)
}

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined

if (!serviceAccount) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local')
  process.exit(1)
}

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
})

async function addBalance() {
  try {
    // Get user by email
    const auth = getAuth()
    const userRecord = await auth.getUserByEmail(email)
    const userId = userRecord.uid

    console.log(`Found user: ${userRecord.email} (UID: ${userId})`)

    // Get database reference
    const db = getDatabase()
    const balanceRef = db.ref(`users/${userId}/profile/balance`)

    // Get current balance
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
      source: 'admin_script',
      note: 'Test balance added via script',
      createdAt: new Date().toISOString(),
    })

    console.log(`✅ Successfully added ${amount} TRY to ${email}`)
    console.log(`   Previous balance: ${currentBalance} TRY`)
    console.log(`   New balance: ${newBalance} TRY`)

    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

addBalance()
