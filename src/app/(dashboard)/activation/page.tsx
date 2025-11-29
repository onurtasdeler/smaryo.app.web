'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Copy, Check, Search, X, Loader2, ChevronDown, Globe } from 'lucide-react'
import { ServiceIcon } from '@/components/service-icons'
import { POPULAR_SERVICES } from '@/lib/5sim-client'
import {
  useServicePrices,
  usePricing,
  useActivation,
  useBuyNumber,
  useFinishActivation,
  useCancelActivation,
} from '@/hooks/use5sim'

type ActivationState = 'idle' | 'purchasing' | 'waiting' | 'received' | 'finished' | 'canceled' | 'timeout'

export default function ActivationPage() {
  const searchParams = useSearchParams()
  const { profile } = useAuth()

  // Selection state
  const [selectedService, setSelectedService] = useState<string>(searchParams.get('service') || '')
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // Activation state
  const [activationState, setActivationState] = useState<ActivationState>('idle')
  const [activationId, setActivationId] = useState<number | null>(null)
  const [copied, setCopied] = useState<'phone' | 'code' | null>(null)

  // API hooks - fetch prices for all countries when service is selected
  const { data: countriesWithPrices, isLoading: pricesLoading } = useServicePrices(selectedService)
  const { data: pricing } = usePricing(selectedCountry, selectedService)
  const { data: activation } = useActivation(activationId)
  const buyNumber = useBuyNumber()
  const finishActivation = useFinishActivation()
  const cancelActivation = useCancelActivation()

  // Filter services by search
  const filteredServices = POPULAR_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected service details
  const selectedServiceDetails = POPULAR_SERVICES.find((s) => s.id === selectedService)
  const selectedCountryDetails = countriesWithPrices?.find((c) => c.iso === selectedCountry)

  // Update activation state based on API response
  useEffect(() => {
    if (activation) {
      if (activation.status === 'RECEIVED' && activation.sms && activation.sms.length > 0) {
        setActivationState('received')
      } else if (activation.status === 'FINISHED') {
        setActivationState('finished')
      } else if (activation.status === 'CANCELED') {
        setActivationState('canceled')
      } else if (activation.status === 'TIMEOUT') {
        setActivationState('timeout')
      } else if (activation.status === 'PENDING') {
        setActivationState('waiting')
      }
    }
  }, [activation])

  // Handle purchase
  const handlePurchase = useCallback(async () => {
    if (!selectedService || !selectedCountry) return

    const price = pricing?.priceTry || 0
    if ((profile?.balance || 0) < price) {
      return
    }

    setActivationState('purchasing')

    try {
      const result = await buyNumber.mutateAsync({
        country: selectedCountry,
        product: selectedService,
      })
      setActivationId(result.id)
      setActivationState('waiting')
    } catch (error) {
      console.error('Purchase error:', error)
      setActivationState('idle')
    }
  }, [selectedService, selectedCountry, pricing, profile?.balance, buyNumber])

  // Handle finish
  const handleFinish = useCallback(async () => {
    if (!activationId) return
    try {
      await finishActivation.mutateAsync(activationId)
      setActivationState('finished')
    } catch (error) {
      console.error('Finish error:', error)
    }
  }, [activationId, finishActivation])

  // Handle cancel
  const handleCancel = useCallback(async () => {
    if (!activationId) return
    try {
      await cancelActivation.mutateAsync(activationId)
      setActivationState('canceled')
    } catch (error) {
      console.error('Cancel error:', error)
    }
  }, [activationId, cancelActivation])

  // Handle copy
  const handleCopy = useCallback((text: string, type: 'phone' | 'code') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  // Reset for new activation
  const handleNewActivation = useCallback(() => {
    setActivationId(null)
    setActivationState('idle')
    setSelectedService('')
    setSelectedCountry('')
  }, [])

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!activation?.expires) return null
    const expires = new Date(activation.expires).getTime()
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((expires - now) / 1000))
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Use price from dropdown data (faster) or pricing API (fallback)
  const price = selectedCountryDetails?.priceTry || pricing?.priceTry || 0
  const hasEnoughBalance = (profile?.balance || 0) >= price
  const canPurchase = selectedService && selectedCountry && hasEnoughBalance && activationState === 'idle' && price > 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6 dash-animate">
        <p className="dash-stat-label mb-1">Aktivasyon</p>
        <h1 className="text-2xl sm:text-3xl font-light text-foreground">
          Servis Seçin
        </h1>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6 dash-animate dash-animate-delay-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Servis ara... (örn: Telegram, WhatsApp, Google)"
          className="w-full h-12 pl-12 pr-12 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-border dash-animate dash-animate-delay-2">
        {filteredServices.length === 0 ? (
          <div className="col-span-full bg-card p-12 text-center">
            <p className="text-muted-foreground">Servis bulunamadı</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setSelectedService(service.id)
                setSelectedCountry('')
              }}
              className={`
                bg-card p-4 text-left transition-all hover:bg-muted/30
                ${selectedService === service.id ? 'ring-2 ring-inset ring-foreground bg-muted/50' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <ServiceIcon serviceId={service.id} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {service.name}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom Action Bar - Fixed */}
      {(selectedService || activationState !== 'idle') && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-56 bg-card border-t border-border p-4 z-30 dash-animate">
          <div className="max-w-7xl mx-auto">
            {/* Idle State - Show Service + Country Selection */}
            {activationState === 'idle' && selectedServiceDetails && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Service Info */}
                <div className="flex items-center gap-3">
                  <ServiceIcon serviceId={selectedService} size={32} />
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedServiceDetails.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Ülke seçin</p>
                  </div>
                </div>

                {/* Country Selector */}
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border hover:border-foreground transition-colors min-w-[200px] w-full sm:w-auto"
                  >
                    {selectedCountryDetails ? (
                      <>
                        <span className="text-lg">{selectedCountryDetails.flag}</span>
                        <span className="flex-1 text-left text-sm">{selectedCountryDetails.name}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-left text-sm text-muted-foreground">Ülke Seç</span>
                      </>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCountryDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCountryDropdown(false)}
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 w-80 max-h-80 overflow-y-auto bg-card border border-border shadow-lg z-50">
                        {pricesLoading ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            <p className="text-xs text-muted-foreground mt-2">Fiyatlar yükleniyor...</p>
                          </div>
                        ) : !countriesWithPrices?.length ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Bu servis için ülke bulunamadı
                          </div>
                        ) : (
                          countriesWithPrices.map((country) => (
                            <button
                              key={country.iso}
                              onClick={() => {
                                setSelectedCountry(country.iso)
                                setShowCountryDropdown(false)
                              }}
                              className={`
                                flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0
                                ${selectedCountry === country.iso ? 'bg-muted/50 font-medium' : ''}
                              `}
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              <div className="text-right">
                                <span className="font-medium text-foreground">
                                  {formatCurrency(country.priceTry)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({country.count})
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Price & Purchase */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {selectedCountry && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Fiyat</p>
                      <p className="text-lg font-medium text-foreground">
                        {price > 0 ? formatCurrency(price) : '—'}
                      </p>
                    </div>
                  )}

                  {!selectedCountry ? (
                    <button
                      disabled
                      className="dash-btn justify-center flex-1 sm:flex-none opacity-50 cursor-not-allowed"
                    >
                      Ülke Seçin
                    </button>
                  ) : !hasEnoughBalance && price > 0 ? (
                    <Link href="/topup" className="dash-btn justify-center flex-1 sm:flex-none">
                      Bakiye Yükle <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!canPurchase}
                      className="dash-btn justify-center flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Numarayı Al <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Purchasing State */}
            {activationState === 'purchasing' && (
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-muted-foreground">Numara alınıyor...</span>
              </div>
            )}

            {/* Waiting State */}
            {activationState === 'waiting' && activation && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">SMS Bekleniyor</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-muted-foreground">
                        +{activation.phone}
                      </code>
                      <button
                        onClick={() => handleCopy(activation.phone, 'phone')}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {copied === 'phone' ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="dash-badge dash-badge-waiting">
                    {getRemainingTime()}
                  </span>
                  <button
                    onClick={handleCancel}
                    disabled={cancelActivation.isPending}
                    className="dash-btn-secondary justify-center flex-1 sm:flex-none"
                  >
                    {cancelActivation.isPending ? 'İptal Ediliyor...' : 'İptal Et'}
                  </button>
                </div>
              </div>
            )}

            {/* Received State */}
            {activationState === 'received' && activation && activation.sms && activation.sms.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-green-500">SMS Alındı!</p>
                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-mono font-bold text-foreground">
                        {activation.sms[0].code}
                      </code>
                      <button
                        onClick={() => handleCopy(activation.sms![0].code, 'code')}
                        className="p-1.5 hover:bg-muted rounded"
                      >
                        {copied === 'code' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleFinish}
                    disabled={finishActivation.isPending}
                    className="dash-btn justify-center flex-1 sm:flex-none"
                  >
                    {finishActivation.isPending ? 'Tamamlanıyor...' : 'Tamamla'}
                  </button>
                </div>
              </div>
            )}

            {/* Finished/Canceled/Timeout State */}
            {(activationState === 'finished' || activationState === 'canceled' || activationState === 'timeout') && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {activationState === 'finished' && '✅'}
                    {activationState === 'canceled' && '❌'}
                    {activationState === 'timeout' && '⏰'}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {activationState === 'finished' && 'Aktivasyon Tamamlandı'}
                      {activationState === 'canceled' && 'Aktivasyon İptal Edildi'}
                      {activationState === 'timeout' && 'Süre Doldu'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activationState === 'finished' && 'SMS başarıyla alındı.'}
                      {activationState === 'canceled' && 'Bakiyeniz iade edildi.'}
                      {activationState === 'timeout' && 'SMS alınamadı, bakiyeniz iade edildi.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNewActivation}
                  className="dash-btn justify-center w-full sm:w-auto"
                >
                  Yeni Aktivasyon <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Spacer for Fixed Bar */}
      {(selectedService || activationState !== 'idle') && (
        <div className="h-28 sm:h-24" />
      )}
    </div>
  )
}
