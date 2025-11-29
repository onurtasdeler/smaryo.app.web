import { Polar } from '@polar-sh/sdk'

// Polar client singleton for server-side use
let polarClient: Polar | null = null

export function getPolarClient(): Polar {
  if (!polarClient) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN

    if (!accessToken) {
      throw new Error('POLAR_ACCESS_TOKEN environment variable is not set')
    }

    polarClient = new Polar({
      accessToken,
      // Use sandbox for development, production for live
      server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    })
  }

  return polarClient
}

// Helper to check if Polar is configured
export function isPolarConfigured(): boolean {
  return !!process.env.POLAR_ACCESS_TOKEN
}
