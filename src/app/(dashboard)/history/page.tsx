'use client'

import { useState } from 'react'
import { formatCurrency, maskPhoneNumber } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Copy, Check } from 'lucide-react'

// Mock data - will be loaded from Firebase
const MOCK_HISTORY = [
  {
    id: '1',
    service: 'Telegram',
    serviceIcon: '📨',
    country: 'Rusya',
    countryFlag: '🇷🇺',
    phone: '+79321234567',
    status: 'completed',
    price: 12.5,
    code: '123456',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    service: 'WhatsApp',
    serviceIcon: '💬',
    country: 'Rusya',
    countryFlag: '🇷🇺',
    phone: '+79123456789',
    status: 'completed',
    price: 15.0,
    code: '654321',
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    service: 'Instagram',
    serviceIcon: '📷',
    country: 'Ukrayna',
    countryFlag: '🇺🇦',
    phone: '+380501234567',
    status: 'expired',
    price: 14.0,
    code: null,
    createdAt: '2024-01-13T09:20:00Z',
  },
  {
    id: '4',
    service: 'Google',
    serviceIcon: '🔍',
    country: 'Endonezya',
    countryFlag: '🇮🇩',
    phone: '+6281234567890',
    status: 'cancelled',
    price: 18.0,
    code: null,
    createdAt: '2024-01-12T14:15:00Z',
  },
]

type FilterStatus = 'all' | 'completed' | 'expired' | 'cancelled'

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [history] = useState(MOCK_HISTORY)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredHistory = history.filter((item) =>
    filter === 'all' ? true : item.status === filter
  )

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Stats calculation
  const stats = {
    total: history.length,
    completed: history.filter((h) => h.status === 'completed').length,
    totalSpent: history
      .filter((h) => h.status === 'completed')
      .reduce((sum, h) => sum + h.price, 0),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="dash-animate mb-8">
        <p className="dash-stat-label mb-2">Geçmiş</p>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground">
          Aktivasyonlar
        </h1>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-3 gap-6 mb-8 dash-animate dash-animate-delay-1">
        <div className="dash-stat">
          <p className="dash-stat-label">Toplam</p>
          <p className="dash-stat-value">{stats.total}</p>
        </div>
        <div className="dash-stat">
          <p className="dash-stat-label">Başarılı</p>
          <p className="dash-stat-value">{stats.completed}</p>
        </div>
        <div className="dash-stat">
          <p className="dash-stat-label">Harcanan</p>
          <p className="dash-stat-value">{formatCurrency(stats.totalSpent)}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="dash-animate dash-animate-delay-2 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'completed', label: 'Başarılı' },
            { value: 'expired', label: 'Süresi Doldu' },
            { value: 'cancelled', label: 'İptal' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as FilterStatus)}
              className={`
                px-4 py-2 text-sm transition-all border whitespace-nowrap
                ${
                  filter === value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-border hover:border-foreground'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* History List */}
      <section className="dash-animate dash-animate-delay-3">
        {filteredHistory.length === 0 ? (
          <div className="dash-empty py-16">
            <div className="dash-empty-icon">📭</div>
            <p className="dash-empty-text">
              Henüz kayıt yok
              <br />
              <Link href="/activation" className="dash-link mt-2 inline-flex">
                İlk aktivasyonunuzu yapın <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        ) : (
          <div className="border-t border-border">
            {filteredHistory.map((item, index) => (
              <div
                key={item.id}
                className={`
                  dash-activity group
                  dash-animate dash-animate-delay-${Math.min(index + 4, 8)}
                `}
              >
                {/* Time */}
                <span className="dash-activity-time hidden sm:block">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>

                {/* Status Dot */}
                <div
                  className={`
                    dash-activity-dot
                    ${item.status === 'completed' ? 'active' : ''}
                    ${item.status === 'expired' ? 'bg-destructive' : ''}
                    ${item.status === 'cancelled' ? 'bg-muted-foreground' : ''}
                  `}
                />

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.serviceIcon}</span>
                    <span className="font-medium text-foreground">
                      {item.service}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                      •
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {item.countryFlag} {item.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{maskPhoneNumber(item.phone)}</span>
                    <span className="sm:hidden">
                      {item.countryFlag} {item.country}
                    </span>
                  </div>
                </div>

                {/* Code (if available) */}
                {item.code && (
                  <div className="hidden sm:flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted/50 px-2 py-1">
                      {item.code}
                    </code>
                    <button
                      onClick={() => handleCopy(item.code!, item.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Price */}
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(item.price)}
                </span>

                {/* Status Badge */}
                <span
                  className={`
                    dash-badge
                    ${item.status === 'completed' ? 'dash-badge-success' : ''}
                    ${item.status === 'expired' ? 'dash-badge-error' : ''}
                    ${item.status === 'cancelled' ? 'dash-badge-neutral' : ''}
                  `}
                >
                  {item.status === 'completed' && 'Başarılı'}
                  {item.status === 'expired' && 'Süresi Doldu'}
                  {item.status === 'cancelled' && 'İptal'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
