'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, Loader2, Clock, RefreshCw, ArrowRight, Home } from 'lucide-react'

type PageStatus = 'verifying' | 'success' | 'pending' | 'failed'

interface VerifyResponse {
  success: boolean
  status: string
  amount?: number
  bonusAmount?: number
  totalCredits?: number
  balanceUpdated?: boolean
  message?: string
}

export default function TopupSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, refreshBalance } = useAuth()

  const [status, setStatus] = useState<PageStatus>('verifying')
  const [paymentData, setPaymentData] = useState<{
    amount: number
    bonusAmount: number
    totalCredits: number
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Track initial balance for change detection
  const initialBalanceRef = useRef<number | null>(null)
  const verificationAttemptedRef = useRef(false)

  const checkoutId = searchParams.get('checkout_id')
  const isDev = searchParams.get('dev') === 'true'

  // Set initial balance on mount
  useEffect(() => {
    if (profile?.balance !== undefined && initialBalanceRef.current === null) {
      initialBalanceRef.current = profile.balance
    }
  }, [profile?.balance])

  // Detect balance changes (real-time from Firebase)
  useEffect(() => {
    if (
      status === 'pending' &&
      initialBalanceRef.current !== null &&
      profile?.balance !== undefined &&
      profile.balance > initialBalanceRef.current
    ) {
      // Balance increased - webhook processed!
      setStatus('success')
    }
  }, [profile?.balance, status])

  // Main verification effect
  useEffect(() => {
    if (verificationAttemptedRef.current) return
    verificationAttemptedRef.current = true

    const verifyPayment = async () => {
      // Development mode simulation
      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setPaymentData({
          amount: parseFloat(searchParams.get('amount') || '250'),
          bonusAmount: parseFloat(searchParams.get('bonus') || '25'),
          totalCredits: parseFloat(searchParams.get('total') || '275'),
        })
        setStatus('success')
        return
      }

      // No checkout ID - redirect to topup
      if (!checkoutId) {
        router.push('/topup')
        return
      }

      // Must have user
      if (!user) {
        setStatus('failed')
        setErrorMessage('Kullanıcı oturumu bulunamadı')
        return
      }

      try {
        // Call verify endpoint (Polar API + Firebase check)
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutId,
            userId: user.uid,
          }),
        })

        const data: VerifyResponse = await response.json()

        if (data.success) {
          // Payment verified by Polar API
          setPaymentData({
            amount: data.amount || 0,
            bonusAmount: data.bonusAmount || 0,
            totalCredits: data.totalCredits || 0,
          })

          if (data.balanceUpdated) {
            // Webhook already processed - show success
            setStatus('success')
            // Refresh balance to ensure UI is in sync
            if (refreshBalance) {
              await refreshBalance()
            }
          } else {
            // Payment confirmed but webhook not yet processed
            // Show pending state and wait for real-time balance update
            setStatus('pending')
            // Start polling as backup
            startBalancePolling()
          }
        } else {
          // Payment not successful
          if (data.status === 'expired' || data.status === 'failed') {
            router.push(`/topup/failed?reason=${data.status}&checkout_id=${checkoutId}`)
          } else {
            setStatus('pending')
            setErrorMessage(data.message || 'Ödeme doğrulanıyor...')
            startBalancePolling()
          }
        }
      } catch (error) {
        console.error('[Success] Verification error:', error)
        setStatus('pending')
        setErrorMessage('Bağlantı hatası, otomatik tekrar deneniyor...')
        startBalancePolling()
      }
    }

    verifyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Polling for balance updates (backup for real-time)
  const startBalancePolling = () => {
    let attempts = 0
    const maxAttempts = 24 // 2 minutes max
    const interval = setInterval(async () => {
      attempts++

      if (refreshBalance) {
        await refreshBalance()
      }

      // Check if balance changed
      if (
        initialBalanceRef.current !== null &&
        profile?.balance !== undefined &&
        profile.balance > initialBalanceRef.current
      ) {
        setStatus('success')
        clearInterval(interval)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        // Keep showing pending with support info
      }
    }, 5000) // Every 5 seconds

    // Cleanup
    return () => clearInterval(interval)
  }

  const handleManualRefresh = async () => {
    if (refreshBalance) {
      await refreshBalance()
    }
  }

  // Verifying State
  if (status === 'verifying') {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <Loader2 className="w-12 h-12 animate-spin text-foreground mx-auto mb-4" />
        <h1 className="text-xl font-light text-foreground mb-2">
          Ödeme doğrulanıyor...
        </h1>
        <p className="text-muted-foreground">
          Lütfen bekleyin, bu işlem birkaç saniye sürebilir.
        </p>
      </div>
    )
  }

  // Pending State
  if (status === 'pending') {
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-4">
        {/* Pulsing Clock Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 dash-animate">
          <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50" />
          <div className="relative w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-2xl font-light text-foreground mb-2 dash-animate dash-animate-delay-1">
          Ödeme Alındı
        </h1>
        <p className="text-muted-foreground mb-8 dash-animate dash-animate-delay-2">
          {errorMessage || 'Ödemeniz alındı. Bakiyeniz birkaç dakika içinde hesabınıza yansıyacaktır.'}
        </p>

        {/* Payment Info if available */}
        {paymentData && (
          <div className="mb-8 p-4 bg-muted/30 border border-border text-left dash-animate dash-animate-delay-3">
            <p className="text-xs text-muted-foreground mb-2">İşlem Detayları</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tutar</span>
                <span className="text-foreground">{formatCurrency(paymentData.amount)}</span>
              </div>
              {paymentData.bonusAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bonus</span>
                  <span>+{formatCurrency(paymentData.bonusAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium pt-1 border-t border-border">
                <span className="text-foreground">Toplam</span>
                <span className="text-foreground">{formatCurrency(paymentData.totalCredits)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Refresh */}
        <button
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground border border-border hover:bg-muted/30 transition-colors dash-animate dash-animate-delay-4"
        >
          <RefreshCw className="w-4 h-4" />
          Bakiyeyi Kontrol Et
        </button>

        {/* Support Info */}
        <p className="mt-8 text-xs text-muted-foreground dash-animate dash-animate-delay-5">
          Endişelenmeyin - ödemeniz güvende.
          Sorun devam ederse{' '}
          <a href="mailto:destek@smaryo.app" className="underline hover:text-foreground">
            destek@smaryo.app
          </a>
          {' '}adresinden bize ulaşın.
        </p>
      </div>
    )
  }

  // Failed State
  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-4">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-light text-foreground mb-2">
          Doğrulama Başarısız
        </h1>
        <p className="text-muted-foreground mb-8">
          {errorMessage || 'Ödemeniz doğrulanamadı. Lütfen tekrar deneyin.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/topup"
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-border text-foreground px-6 py-3 font-medium hover:bg-muted/30 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Link>
        </div>
      </div>
    )
  }

  // Success State
  return (
    <div className="max-w-lg mx-auto text-center py-12 px-4">
      {/* Success Animation */}
      <div className="relative w-24 h-24 mx-auto mb-6 dash-animate">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-light text-foreground mb-2 dash-animate dash-animate-delay-1">
        Ödeme Başarılı!
      </h1>
      <p className="text-muted-foreground mb-8 dash-animate dash-animate-delay-2">
        Bakiyeniz başarıyla yüklendi.
      </p>

      {/* Summary Card */}
      {paymentData && (
        <div className="mb-8 p-6 bg-card border border-border text-left dash-animate dash-animate-delay-3">
          <h2 className="font-medium text-foreground mb-4">İşlem Özeti</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yükleme Tutarı</span>
              <span className="font-medium text-foreground">{formatCurrency(paymentData.amount)}</span>
            </div>
            {paymentData.bonusAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Bonus</span>
                <span className="font-medium">+{formatCurrency(paymentData.bonusAmount)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-border flex justify-between">
              <span className="font-medium text-foreground">Eklenen Bakiye</span>
              <span className="font-bold text-xl text-foreground">
                {formatCurrency(paymentData.totalCredits)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Balance */}
      {profile?.balance !== undefined && (
        <div className="mb-8 p-4 bg-muted/30 border border-border dash-animate dash-animate-delay-4">
          <p className="text-xs text-muted-foreground mb-1">Yeni Bakiyeniz</p>
          <p className="text-2xl font-light text-foreground">
            {formatCurrency(profile.balance)}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 dash-animate dash-animate-delay-5">
        <Link
          href="/activation"
          className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Aktivasyon Başlat
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 font-medium hover:bg-muted/30 transition-colors"
        >
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
      </div>

      {/* Dev Mode Warning */}
      {isDev && (
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 text-sm dash-animate dash-animate-delay-6">
          Bu bir geliştirme modundaki simülasyondur. Gerçek ödeme işlenmemiştir.
        </div>
      )}
    </div>
  )
}
