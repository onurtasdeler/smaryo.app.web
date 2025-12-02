// Auth pages require client-side authentication context
// Disable static generation to prevent prerender errors
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
