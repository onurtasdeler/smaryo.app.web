'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/i18n/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
  TrendingUp,
  Zap,
  Star,
  Copy,
  RefreshCw,
  Wallet,
  Activity,
  Hash,
  ChevronRight
} from 'lucide-react'
import { usePopularProducts } from '@/hooks/use5sim'

// Mock data for demonstration - In production, fetch from Firebase
interface Activation {
  id: string
  service: string
  serviceIcon: string
  country: string
  countryFlag: string
  phone: string
  status: 'pending' | 'completed' | 'expired' | 'cancelled'
  price: number
  code: string | null
  createdAt: string
  expiresAt?: string
}

interface UserStats {
  totalActivations: number
  successfulActivations: number
  totalSpent: number
  activeCount: number
}

// Service icons mapping
const SERVICE_ICONS: Record<string, string> = {
  telegram: '📨',
  whatsapp: '💬',
  google: '🔍',
  instagram: '📷',
  facebook: '👤',
  tiktok: '🎵',
  twitter: '🐦',
  discord: '🎮',
  uber: '🚗',
  amazon: '📦',
}

// Country flags
const COUNTRY_FLAGS: Record<string, string> = {
  russia: '🇷🇺',
  ukraine: '🇺🇦',
  indonesia: '🇮🇩',
  philippines: '🇵🇭',
  india: '🇮🇳',
  brazil: '🇧🇷',
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const { t, locale } = useTranslation()
  const { data: popularProducts, isLoading: productsLoading } = usePopularProducts('russia')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Mock data - Replace with actual Firebase queries
  const [activations] = useState<Activation[]>([])
  const [activeActivations] = useState<Activation[]>([])

  // Time-based greeting using translations
  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.greeting.morning')
    if (hour < 18) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }

  // Calculate stats from activations
  const stats: UserStats = useMemo(() => {
    const total = activations.length
    const successful = activations.filter(a => a.status === 'completed').length
    const spent = activations.reduce((sum, a) => sum + a.price, 0)
    const active = activeActivations.length

    return {
      totalActivations: total,
      successfulActivations: successful,
      totalSpent: spent,
      activeCount: active
    }
  }, [activations, activeActivations])

  // Success rate calculation
  const successRate = stats.totalActivations > 0
    ? Math.round((stats.successfulActivations / stats.totalActivations) * 100)
    : 100

  // Get first name from email or displayName
  const firstName = profile?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || t('dashboard.defaultUser')

  // Low balance threshold (in USD)
  const LOW_BALANCE_THRESHOLD = 5
  const isLowBalance = (profile?.balance || 0) < LOW_BALANCE_THRESHOLD

  // Copy to clipboard handler
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Countdown timer component
  const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date().getTime()
        const expiry = new Date(expiresAt).getTime()
        const diff = expiry - now

        if (diff <= 0) return t('dashboard.timeExpired')

        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)

        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }

      setTimeLeft(calculateTimeLeft())
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft())
      }, 1000)

      return () => clearInterval(interval)
    }, [expiresAt])

    return (
      <span className="font-mono text-sm tabular-nums">
        {timeLeft}
      </span>
    )
  }

  // Filter services based on search
  const filteredServices = useMemo(() => {
    const services = [
      { id: 'telegram', name: 'Telegram', price: popularProducts?.find(p => p.id === 'telegram')?.priceUsd || 0.15 },
      { id: 'whatsapp', name: 'WhatsApp', price: popularProducts?.find(p => p.id === 'whatsapp')?.priceUsd || 0.18 },
      { id: 'google', name: 'Google', price: popularProducts?.find(p => p.id === 'google')?.priceUsd || 0.22 },
      { id: 'instagram', name: 'Instagram', price: popularProducts?.find(p => p.id === 'instagram')?.priceUsd || 0.17 },
      { id: 'facebook', name: 'Facebook', price: popularProducts?.find(p => p.id === 'facebook')?.priceUsd || 0.19 },
      { id: 'tiktok', name: 'TikTok', price: popularProducts?.find(p => p.id === 'tiktok')?.priceUsd || 0.16 },
      { id: 'twitter', name: 'Twitter/X', price: popularProducts?.find(p => p.id === 'twitter')?.priceUsd || 0.17 },
      { id: 'discord', name: 'Discord', price: popularProducts?.find(p => p.id === 'discord')?.priceUsd || 0.13 },
    ]

    if (!searchQuery) return services.slice(0, 6)

    return services.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, popularProducts])

  // Favorite services (mock - would come from user preferences)
  const favoriteServices = [
    { id: 'telegram', name: 'Telegram', country: 'russia', countryName: locale === 'tr' ? 'Rusya' : 'Russia' },
    { id: 'whatsapp', name: 'WhatsApp', country: 'indonesia', countryName: locale === 'tr' ? 'Endonezya' : 'Indonesia' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Low Balance Warning */}
      {isLowBalance && (
        <div className="dash-animate bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">{t('dashboard.lowBalance')}</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {t('dashboard.lowBalanceWarning', { amount: formatCurrency(profile?.balance || 0, locale) })}
            </p>
          </div>
          <Link href={`/${locale}/topup`} className="dash-btn bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0">
            {t('dashboard.topUp')}
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="dash-animate">
        <p className="dash-stat-label mb-2">{getGreeting()}</p>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground">
          {firstName}
        </h1>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 dash-animate dash-animate-delay-1">
        {/* Balance Card - Highlighted */}
        <div className="col-span-2 lg:col-span-1 bg-foreground text-background rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 opacity-60" />
              <p className="text-xs uppercase tracking-wider opacity-60">{t('dashboard.balance')}</p>
            </div>
            <p className="text-3xl font-light mb-4">{formatCurrency(profile?.balance || 0, locale)}</p>
            <Link
              href={`/${locale}/topup`}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
            >
              {t('dashboard.topUp')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Activations */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <p className="dash-stat-label">{t('dashboard.total')}</p>
          </div>
          <p className="text-2xl font-light text-foreground">{stats.totalActivations}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('dashboard.activations')}</p>
        </div>

        {/* Success Rate */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="dash-stat-label">{t('dashboard.success')}</p>
          </div>
          <p className="text-2xl font-light text-foreground">%{successRate}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('dashboard.successRate')}
          </p>
        </div>

        {/* Active Count */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <p className="dash-stat-label">{t('dashboard.active')}</p>
          </div>
          <p className="text-2xl font-light text-foreground">{stats.activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activeCount > 0 ? t('dashboard.pendingNumbers') : t('dashboard.noPending')}
          </p>
        </div>
      </section>

      {/* Active Activations Widget */}
      {activeActivations.length > 0 && (
        <section className="dash-animate dash-animate-delay-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="dash-section-title mb-0">{t('dashboard.activeNumbers')}</p>
            </div>
            <button className="dash-link flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {t('dashboard.refresh')}
            </button>
          </div>

          <div className="space-y-3">
            {activeActivations.map((activation) => (
              <div
                key={activation.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Service Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{SERVICE_ICONS[activation.service] || '📱'}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{activation.service}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>{COUNTRY_FLAGS[activation.country] || '🌍'}</span>
                        {activation.phone}
                      </p>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Timer className="w-4 h-4" />
                    {activation.expiresAt && <CountdownTimer expiresAt={activation.expiresAt} />}
                  </div>

                  {/* Code or Waiting */}
                  {activation.code ? (
                    <button
                      onClick={() => handleCopy(activation.code!, activation.id)}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-mono font-medium hover:bg-green-100 transition-colors"
                    >
                      {copiedId === activation.id ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {t('common.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {activation.code}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">{t('dashboard.smsWaiting')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions with Search */}
      <section className="dash-animate dash-animate-delay-2">
        <div className="flex items-center justify-between mb-4">
          <p className="dash-section-title mb-0">{t('dashboard.quickAction')}</p>
          <Link href={`/${locale}/activation`} className="dash-link">
            {t('dashboard.allServices')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {productsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full mx-auto mb-3" />
                <div className="h-4 bg-muted rounded w-16 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-12 mx-auto" />
              </div>
            ))
          ) : (
            filteredServices.map((service) => (
              <Link
                key={service.id}
                href={`/${locale}/activation?service=${service.id}`}
                className="group bg-card border border-border rounded-xl p-4 text-center hover:border-foreground/30 hover:shadow-sm transition-all"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                  {SERVICE_ICONS[service.id] || '📱'}
                </span>
                <p className="text-sm font-medium text-foreground mb-1">{service.name}</p>
                <p className="text-xs text-muted-foreground">~{formatCurrency(service.price, locale)}</p>
              </Link>
            ))
          )}
        </div>

        {searchQuery && filteredServices.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            {t('dashboard.noResults', { query: searchQuery })}
          </p>
        )}
      </section>

      {/* Favorite Services */}
      {favoriteServices.length > 0 && (
        <section className="dash-animate dash-animate-delay-3">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="dash-section-title mb-0">{t('dashboard.favorites')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favoriteServices.map((fav) => {
              const price = popularProducts?.find(p => p.id === fav.id)?.priceUsd || 0.15
              return (
                <Link
                  key={`${fav.id}-${fav.country}`}
                  href={`/${locale}/activation?service=${fav.id}&country=${fav.country}`}
                  className="group flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-foreground/30 transition-colors"
                >
                  <span className="text-2xl">{SERVICE_ICONS[fav.id] || '📱'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{fav.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {COUNTRY_FLAGS[fav.country]} {fav.countryName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(price, locale)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="w-3 h-3" /> {t('dashboard.quickGet')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="dash-animate dash-animate-delay-4">
        <div className="flex items-center justify-between mb-4">
          <p className="dash-section-title mb-0">{t('dashboard.recentActivity')}</p>
          <Link href={`/${locale}/history`} className="dash-link">
            {t('dashboard.seeAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {activations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-3">{t('dashboard.noActivations')}</p>
              <Link href={`/${locale}/activation`} className="dash-btn inline-flex">
                {t('dashboard.getFirstNumber')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activations.slice(0, 5).map((activation) => (
                <div key={activation.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <span className="text-xl">{SERVICE_ICONS[activation.service] || '📱'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activation.service}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {COUNTRY_FLAGS[activation.country]} {activation.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    {activation.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {t('dashboard.status.completed')}
                      </span>
                    )}
                    {activation.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> {t('dashboard.status.pending')}
                      </span>
                    )}
                    {activation.status === 'expired' && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> {t('dashboard.status.expired')}
                      </span>
                    )}
                    {activation.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> {t('dashboard.status.cancelled')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground w-20 text-right">
                    {formatCurrency(activation.price, locale)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works - Compact */}
      <section className="dash-animate dash-animate-delay-5 pb-8">
        <p className="dash-section-title mb-6">{t('dashboard.howItWorks.title')}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '01', title: t('dashboard.howItWorks.step1.title'), desc: t('dashboard.howItWorks.step1.desc'), icon: '🎯' },
            { num: '02', title: t('dashboard.howItWorks.step2.title'), desc: t('dashboard.howItWorks.step2.desc'), icon: '🌍' },
            { num: '03', title: t('dashboard.howItWorks.step3.title'), desc: t('dashboard.howItWorks.step3.desc'), icon: '📱' },
            { num: '04', title: t('dashboard.howItWorks.step4.title'), desc: t('dashboard.howItWorks.step4.desc'), icon: '✅' },
          ].map((step) => (
            <div key={step.num} className="group text-center">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-foreground group-hover:text-background transition-colors">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{step.num}</p>
              <h3 className="text-sm font-medium text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
