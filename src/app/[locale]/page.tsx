'use client'

import Link from 'next/link'
import {
  Globe,
  Zap,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ArrowRight,
} from 'lucide-react'
import { ServiceIcon } from '@/components/service-icons'
import { useTranslation } from '@/i18n/client'
import { LanguageSwitcher } from '@/components/language-switcher'

const POPULAR_SERVICES = [
  'telegram',
  'whatsapp',
  'google',
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
  'discord',
  'snapchat',
  'tinder',
  'uber',
  'openai',
]

export default function HomePage() {
  const { t, locale } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 landing-nav">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-foreground text-background flex items-center justify-center">
              <span className="text-base font-light">S</span>
            </div>
            <span className="text-xs font-medium tracking-[0.15em] uppercase hidden sm:block">
              Smaryo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="landing-nav-link">
              {t('nav.features')}
            </Link>
            <Link href="#pricing" className="landing-nav-link">
              {t('nav.pricing')}
            </Link>
            <Link href="#faq" className="landing-nav-link">
              {t('nav.faq')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href={`/${locale}/login`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              {t('nav.login')}
            </Link>
            <Link
              href={`/${locale}/register`}
              className="landing-btn-primary text-xs py-2.5 px-5"
            >
              {t('nav.getStarted')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-12 lg:py-16">
          <div className="container max-w-4xl mx-auto px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 landing-animate">
              {t('landing.hero.badge')}
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.15] mb-4 landing-animate landing-animate-delay-1">
              {t('landing.hero.title')}
              <br />
              <span className="font-normal">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed landing-animate landing-animate-delay-2">
              {t('landing.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center landing-animate landing-animate-delay-3">
              <Link href={`/${locale}/register`} className="landing-btn-primary text-sm py-2.5 px-5">
                {t('landing.hero.cta')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="#features" className="landing-btn-secondary text-sm py-2.5 px-5">
                {t('landing.hero.howItWorks')}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 sm:gap-12 mt-8 pt-6 border-t border-border landing-animate landing-animate-delay-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">170+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{t('landing.stats.countries')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">1M+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{t('landing.stats.verifications')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">99.9%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{t('landing.stats.success')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-14 lg:py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 landing-animate">
                {t('landing.features.badge')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-light landing-animate landing-animate-delay-1">
                {t('landing.features.title')} <span className="font-normal">{t('landing.features.titleHighlight')}</span>
              </h2>
              <div className="landing-divider mt-4 landing-animate landing-animate-delay-2" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <FeatureCard
                icon={Globe}
                title={t('landing.features.globalCoverage')}
                description={t('landing.features.globalCoverageDesc')}
                delay={1}
              />
              <FeatureCard
                icon={Zap}
                title={t('landing.features.instantDelivery')}
                description={t('landing.features.instantDeliveryDesc')}
                delay={2}
              />
              <FeatureCard
                icon={ShieldCheck}
                title={t('landing.features.fullPrivacy')}
                description={t('landing.features.fullPrivacyDesc')}
                delay={3}
              />
              <FeatureCard
                icon={CreditCard}
                title={t('landing.features.affordablePrices')}
                description={t('landing.features.affordablePricesDesc')}
                delay={4}
              />
              <FeatureCard
                icon={Smartphone}
                title={t('landing.features.easyInterface')}
                description={t('landing.features.easyInterfaceDesc')}
                delay={5}
              />
            </div>

            {/* Popular Services Grid */}
            <div className="mt-10 landing-animate landing-animate-delay-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-light">
                  <span className="font-normal">1000+</span> {t('landing.features.popularServices')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('landing.features.popularServicesDesc')}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {POPULAR_SERVICES.map((service, index) => (
                  <div
                    key={service}
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-xl hover:border-foreground/20 hover:shadow-sm transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ServiceIcon serviceId={service} size={24} showColor />
                  </div>
                ))}
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-muted/50 border border-border rounded-xl">
                  <span className="text-xs text-muted-foreground font-medium">+990</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 lg:py-14">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 landing-animate">
                {t('landing.pricing.badge')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-light landing-animate landing-animate-delay-1">
                {t('landing.pricing.title')} <span className="font-normal">{t('landing.pricing.titleHighlight')}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 landing-animate landing-animate-delay-2">
                {t('landing.pricing.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <BonusCard amount={5} bonus={5} delay={1} t={t} />
              <BonusCard amount={15} bonus={10} delay={2} popular t={t} />
              <BonusCard amount={30} bonus={15} delay={3} t={t} />
              <BonusCard amount={60} bonus={20} delay={4} t={t} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-14">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="landing-cta px-6 py-10 sm:px-12 sm:py-12 relative">
              <div className="landing-cta-pattern" />
              <div className="landing-shape landing-shape-1" />
              <div className="landing-shape landing-shape-2" />

              <div className="relative z-10 text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-3">
                  {t('landing.cta.title')}
                </h2>
                <p className="text-white/60 text-sm max-w-sm mx-auto mb-5">
                  {t('landing.cta.description')}
                </p>
                <Link
                  href={`/${locale}/register`}
                  className="inline-flex items-center gap-2 bg-white text-foreground px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  {t('landing.cta.button')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-muted/20">
        <div className="container max-w-6xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-foreground text-background flex items-center justify-center">
                  <span className="text-base font-light">S</span>
                </div>
                <span className="text-sm tracking-[0.1em] uppercase font-medium">
                  Smaryo
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('landing.footer.description')}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-medium mb-4">{t('landing.footer.links')}</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href={`/${locale}/login`} className="hover:text-foreground transition-colors w-fit">
                  {t('landing.footer.login')}
                </Link>
                <Link href={`/${locale}/register`} className="hover:text-foreground transition-colors w-fit">
                  {t('landing.footer.register')}
                </Link>
                <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors w-fit">
                  {t('landing.footer.terms')}
                </Link>
                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors w-fit">
                  {t('landing.footer.privacy')}
                </Link>
              </nav>
            </div>

            {/* App Download */}
            <div>
              <h4 className="text-sm font-medium mb-4">{t('landing.footer.mobileApp')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t('landing.footer.mobileAppDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* App Store */}
                <a
                  href="https://apps.apple.com/us/app/virtual-number-sms-smaryo/id6755517560"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] leading-none opacity-80">{t('landing.footer.download')}</p>
                    <p className="text-xs font-medium leading-tight">{t('landing.footer.appStore')}</p>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.smaryo.number"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.56.69.56 1.19s-.22.92-.56 1.19l-2.29 1.32-2.5-2.5 2.5-2.5 2.29 1.3M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] leading-none opacity-80">{t('landing.footer.download')}</p>
                    <p className="text-xs font-medium leading-tight">{t('landing.footer.googlePlay')}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Smaryo. {t('landing.footer.copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="mailto:support@smaryo.app" className="hover:text-foreground transition-colors">
                support@smaryo.app
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: React.ElementType
  title: string
  description: string
  delay: number
}) {
  return (
    <div className={`landing-card landing-animate landing-animate-delay-${delay}`}>
      <div className="landing-icon-box mb-3">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function BonusCard({
  amount,
  bonus,
  popular = false,
  delay,
  t
}: {
  amount: number
  bonus: number
  popular?: boolean
  delay: number
  t: (key: string) => string
}) {
  const bonusAmount = amount * bonus / 100
  const total = amount + bonusAmount

  return (
    <div className={`landing-price-card ${popular ? 'popular' : ''} landing-animate landing-animate-delay-${delay}`}>
      {popular && (
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
          {t('landing.pricing.popular')}
        </p>
      )}

      <p className="text-2xl sm:text-3xl font-light mb-0.5">
        ${amount}
      </p>

      <p className="text-[10px] text-green-600 font-medium mb-3">
        +{bonus}% {t('landing.pricing.bonus')}
      </p>

      <div className="pt-3 border-t border-border text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>{t('landing.pricing.total')}</span>
          <span className="font-medium text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
