import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Smaryo account. Access SMS verification services and verify accounts securely with virtual numbers.',
  keywords: ['smaryo login', 'sms verification login', 'account login', 'sign in'],
  openGraph: {
    title: 'Sign In | Smaryo',
    description: 'Sign in to your Smaryo account and access SMS verification services.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
