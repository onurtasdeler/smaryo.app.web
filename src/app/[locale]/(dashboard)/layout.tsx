'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/i18n/client'
import { formatCurrency } from '@/lib/utils'
import {
  Home,
  Smartphone,
  History,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  ArrowUpRight,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale } = useTranslation()
  const { user, profile, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`)
    }
  }, [user, loading, router, locale])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push(`/${locale}`)
  }

  const navItems = [
    { href: `/${locale}/dashboard`, icon: Home, label: t('dashboard.navItems.home') },
    { href: `/${locale}/activation`, icon: Smartphone, label: t('dashboard.navItems.activation') },
    { href: `/${locale}/history`, icon: History, label: t('dashboard.navItems.history') },
    { href: `/${locale}/topup`, icon: CreditCard, label: t('dashboard.navItems.balance') },
    { href: `/${locale}/settings`, icon: Settings, label: t('dashboard.navItems.settings') },
  ]

  // Check if current path matches nav item (handle locale prefix)
  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-border hidden lg:flex flex-col z-50 bg-background">
        {/* Logo */}
        <div className="h-14 flex items-center px-6 border-b border-border">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Smaryo</span>
          </Link>
        </div>

        {/* Balance */}
        <div className="px-4 py-6 border-b border-border">
          <p className="dash-stat-label mb-1">{t('dashboard.balance')}</p>
          <p className="text-2xl font-light text-foreground mb-3">
            {formatCurrency(profile?.balance || 0, locale)}
          </p>
          <Link href={`/${locale}/topup`} className="dash-link text-xs">
            {t('dashboard.topUp')} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={isActive(item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('dashboard.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href={`/${locale}/dashboard`} className="text-sm font-semibold">
            Smaryo
          </Link>

          {/* Balance */}
          <Link
            href={`/${locale}/topup`}
            className="text-sm font-medium text-foreground"
          >
            {formatCurrency(profile?.balance || 0, locale)}
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-background border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="text-sm font-semibold">{t('dashboard.menu')}</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -mr-2 text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance */}
        <div className="px-4 py-6 border-b border-border">
          <p className="dash-stat-label mb-1">{t('dashboard.balance')}</p>
          <p className="text-2xl font-light text-foreground mb-3">
            {formatCurrency(profile?.balance || 0, locale)}
          </p>
          <Link href={`/${locale}/topup`} className="dash-link text-xs">
            {t('dashboard.topUp')} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={isActive(item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-border bg-background">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('dashboard.logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-56">
        {/* Mobile Spacer */}
        <div className="h-14 lg:hidden" />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href,
  icon: Icon,
  children,
  active,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
        ${
          active
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {children}
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground" />
      )}
    </Link>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
        ${active ? 'text-foreground' : 'text-muted-foreground'}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
