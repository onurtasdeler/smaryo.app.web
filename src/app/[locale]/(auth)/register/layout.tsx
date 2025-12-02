import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Smaryo account. Get instant access to SMS verification services with virtual numbers from 170+ countries.',
  keywords: ['smaryo register', 'sms verification signup', 'create account', 'sign up'],
  openGraph: {
    title: 'Sign Up | Smaryo',
    description: 'Create your Smaryo account and start verifying accounts instantly.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
