import Link from 'next/link'
import {
  Globe,
  Zap,
  ShieldCheck,
  CreditCard,
  Smartphone,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 landing-nav">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-foreground text-background flex items-center justify-center">
              <span className="text-base font-light">S</span>
            </div>
            <span className="text-xs font-medium tracking-[0.15em] uppercase hidden sm:block">
              Smaryo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="landing-nav-link">
              Özellikler
            </Link>
            <Link href="#pricing" className="landing-nav-link">
              Fiyatlar
            </Link>
            <Link href="#faq" className="landing-nav-link">
              SSS
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Giriş
            </Link>
            <Link
              href="/register"
              className="landing-btn-primary text-xs py-2.5 px-5"
            >
              Başla
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
              SMS Doğrulama Servisi
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.15] mb-4 landing-animate landing-animate-delay-1">
              Güvenli doğrulama
              <br />
              <span className="font-normal">saniyeler içinde.</span>
            </h1>

            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed landing-animate landing-animate-delay-2">
              170+ ülkeden geçici telefon numaraları ile hesaplarınızı
              anında doğrulayın.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center landing-animate landing-animate-delay-3">
              <Link href="/register" className="landing-btn-primary text-sm py-2.5 px-5">
                Hemen Başla
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="#features" className="landing-btn-secondary text-sm py-2.5 px-5">
                Nasıl Çalışır?
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 sm:gap-12 mt-8 pt-6 border-t border-border landing-animate landing-animate-delay-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">170+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Ülke</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">1M+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Doğrulama</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-light">99.9%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Başarı</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-14 lg:py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 landing-animate">
                Özellikler
              </p>
              <h2 className="text-2xl sm:text-3xl font-light landing-animate landing-animate-delay-1">
                Neden <span className="font-normal">Smaryo?</span>
              </h2>
              <div className="landing-divider mt-4 landing-animate landing-animate-delay-2" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <FeatureCard
                icon={Globe}
                title="Global Kapsama"
                description="Dünyanın her yerinden, 170'den fazla ülkeden numara desteği."
                delay={1}
              />
              <FeatureCard
                icon={Zap}
                title="Anında Teslimat"
                description="Kodlar saniyeler içinde panelinize düşer."
                delay={2}
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Tam Gizlilik"
                description="Kişisel numaranızı paylaşmadan güvenle işlem yapın."
                delay={3}
              />
              <FeatureCard
                icon={CreditCard}
                title="Uygun Fiyatlar"
                description="Piyasadaki en rekabetçi fiyatlar ve bonuslar."
                delay={4}
              />
              <FeatureCard
                icon={Smartphone}
                title="Kolay Arayüz"
                description="Her cihazda sorunsuz çalışan modern panel."
                delay={5}
              />
              <FeatureCard
                icon={LayoutGrid}
                title="1000+ Servis"
                description="Telegram, WhatsApp, Google ve daha fazlası."
                delay={6}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 lg:py-14">
          <div className="container max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 landing-animate">
                Fiyatlandırma
              </p>
              <h2 className="text-2xl sm:text-3xl font-light landing-animate landing-animate-delay-1">
                Yükle, <span className="font-normal">kazan.</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-2 landing-animate landing-animate-delay-2">
                Yüksek yüklemelerde ekstra bonus kazanın.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <BonusCard amount={100} bonus={5} delay={1} />
              <BonusCard amount={250} bonus={10} delay={2} popular />
              <BonusCard amount={500} bonus={15} delay={3} />
              <BonusCard amount={1000} bonus={20} delay={4} />
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
                  Hemen başlayın
                </h2>
                <p className="text-white/60 text-sm max-w-sm mx-auto mb-5">
                  Ücretsiz hesap oluşturun ve saniyeler içinde
                  ilk doğrulamanızı tamamlayın.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white text-foreground px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Ücretsiz Kayıt
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center">
                <span className="text-sm font-light">S</span>
              </div>
              <span className="text-xs tracking-[0.1em] uppercase text-muted-foreground">
                Smaryo
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                Giriş
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                Kayıt
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Şartlar
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Gizlilik
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Smaryo
            </p>
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
  delay
}: {
  amount: number
  bonus: number
  popular?: boolean
  delay: number
}) {
  const bonusAmount = amount * bonus / 100
  const total = amount + bonusAmount

  return (
    <div className={`landing-price-card ${popular ? 'popular' : ''} landing-animate landing-animate-delay-${delay}`}>
      {popular && (
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
          Popüler
        </p>
      )}

      <p className="text-2xl sm:text-3xl font-light mb-0.5">
        ₺{amount}
      </p>

      <p className="text-[10px] text-green-600 font-medium mb-3">
        +%{bonus} bonus
      </p>

      <div className="pt-3 border-t border-border text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Toplam</span>
          <span className="font-medium text-foreground">₺{total}</span>
        </div>
      </div>
    </div>
  )
}
