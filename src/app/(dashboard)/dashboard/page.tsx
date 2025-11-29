'use client'

import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { usePopularProducts } from '@/hooks/use5sim'

// Time-based Turkish greeting
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const { data: popularProducts, isLoading } = usePopularProducts('russia')

  // Get first name from email
  const firstName = user?.email?.split('@')[0] || 'Kullanıcı'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <header className="dash-animate">
        <p className="dash-stat-label mb-2">{getGreeting()}</p>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground">
          {firstName}
        </h1>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 dash-animate dash-animate-delay-1">
        <div className="dash-stat">
          <p className="dash-stat-label">Bakiye</p>
          <p className="dash-stat-value">{formatCurrency(profile?.balance || 0)}</p>
          <Link href="/topup" className="dash-link mt-3">
            Yükle <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="dash-stat">
          <p className="dash-stat-label">Aktif</p>
          <p className="dash-stat-value">0</p>
          <p className="dash-stat-trend positive">Bekleyen yok</p>
        </div>

        <div className="dash-stat">
          <p className="dash-stat-label">Toplam</p>
          <p className="dash-stat-value">0</p>
          <p className="dash-stat-trend">Aktivasyon</p>
        </div>

        <div className="dash-stat">
          <p className="dash-stat-label">Başarı</p>
          <p className="dash-stat-value">%100</p>
          <p className="dash-stat-trend positive">Oran</p>
        </div>
      </section>

      {/* Quick Action */}
      <section className="dash-animate dash-animate-delay-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-y border-border">
          <p className="dash-section-title mb-0">Hızlı İşlem</p>
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select className="dash-quick-select" defaultValue="">
              <option value="" disabled>Servis seç</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="google">Google</option>
              <option value="instagram">Instagram</option>
            </select>
            <select className="dash-quick-select" defaultValue="">
              <option value="" disabled>Ülke seç</option>
              <option value="russia">Rusya</option>
              <option value="ukraine">Ukrayna</option>
              <option value="indonesia">Endonezya</option>
            </select>
            <div className="flex items-center gap-3">
              <span className="text-lg font-light text-muted-foreground">~₺12.50</span>
              <Link href="/activation" className="dash-btn">
                Satın Al <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="dash-animate dash-animate-delay-3">
        <div className="flex items-center justify-between mb-6">
          <p className="dash-section-title mb-0">Popüler Servisler</p>
          <Link href="/activation" className="dash-link">
            Tümünü gör <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="dash-service">
                <div className="dash-skeleton w-8 h-8 mx-auto mb-2" />
                <div className="dash-skeleton h-3 w-16 mx-auto mb-1" />
                <div className="dash-skeleton h-2 w-12 mx-auto" />
              </div>
            ))
          ) : (
            <>
              {/* Hardcoded popular services with emojis */}
              {[
                { id: 'telegram', name: 'Telegram', icon: '📨', price: popularProducts?.find(p => p.id === 'telegram')?.priceTry || 12.5 },
                { id: 'whatsapp', name: 'WhatsApp', icon: '💬', price: popularProducts?.find(p => p.id === 'whatsapp')?.priceTry || 15.0 },
                { id: 'google', name: 'Google', icon: '🔍', price: popularProducts?.find(p => p.id === 'google')?.priceTry || 18.0 },
                { id: 'instagram', name: 'Instagram', icon: '📷', price: popularProducts?.find(p => p.id === 'instagram')?.priceTry || 14.0 },
                { id: 'facebook', name: 'Facebook', icon: '👤', price: popularProducts?.find(p => p.id === 'facebook')?.priceTry || 16.0 },
                { id: 'tiktok', name: 'TikTok', icon: '🎵', price: popularProducts?.find(p => p.id === 'tiktok')?.priceTry || 13.0 },
              ].map((service, i) => (
                <Link
                  key={service.id}
                  href={`/activation?service=${service.id}`}
                  className={`dash-service dash-animate dash-animate-delay-${i + 4}`}
                >
                  <span className="dash-service-icon">{service.icon}</span>
                  <span className="dash-service-name">{service.name}</span>
                  <span className="dash-service-price">~{formatCurrency(service.price)}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="dash-animate dash-animate-delay-5">
        <div className="flex items-center justify-between mb-6">
          <p className="dash-section-title mb-0">Son Aktiviteler</p>
          <Link href="/history" className="dash-link">
            Geçmiş <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="border-t border-border">
          {/* Empty state */}
          <div className="dash-empty">
            <div className="dash-empty-icon">📭</div>
            <p className="dash-empty-text">
              Henüz aktivasyon yok.
              <br />
              <Link href="/activation" className="dash-link mt-2 inline-flex">
                İlk numaranızı alın <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {/* Example activity items (hidden for now) */}
          {/*
          <div className="dash-activity">
            <span className="dash-activity-time">12:34</span>
            <div className="dash-activity-dot active" />
            <span className="flex-1">Telegram • Rusya</span>
            <span className="dash-badge dash-badge-success">Alındı</span>
          </div>
          */}
        </div>
      </section>

      {/* How it works - Minimal */}
      <section className="dash-animate dash-animate-delay-6 pb-8">
        <p className="dash-section-title mb-8">Nasıl Çalışır?</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: '01', title: 'Servis Seç', desc: 'Doğrulama yapacağınız platformu seçin' },
            { num: '02', title: 'Ülke Seç', desc: 'Telefon numarası konumunu belirleyin' },
            { num: '03', title: 'Numara Al', desc: 'Saniyeler içinde numaranız hazır' },
            { num: '04', title: 'Kod Al', desc: 'SMS kodunu alın ve işlemi tamamlayın' },
          ].map((step) => (
            <div key={step.num} className="group">
              <p className="text-4xl font-extralight text-muted-foreground/30 group-hover:text-foreground/20 transition-colors mb-3">
                {step.num}
              </p>
              <h3 className="text-sm font-medium text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
