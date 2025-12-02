'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  FiveSimActivation,
  FiveSimCountry,
} from '@/types/fivesim'

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface TransformedProduct {
  id: string
  name: string
  icon: string
  price: number
  priceUsd: number
  count: number
  operator: string
  isPopular: boolean
}

interface PricingData {
  country: string
  product: string
  price: number
  priceUsd: number
  count: number
  operators: string[]
}

interface TransformedCountry extends FiveSimCountry {
  flag?: string
}

// ============================================================================
// Query Keys
// ============================================================================

export const fiveSimKeys = {
  all: ['5sim'] as const,
  countries: () => [...fiveSimKeys.all, 'countries'] as const,
  products: (country: string, operator?: string) =>
    [...fiveSimKeys.all, 'products', country, operator ?? 'any'] as const,
  pricing: (country: string, product: string) =>
    [...fiveSimKeys.all, 'pricing', country, product] as const,
  servicePrices: (product: string) =>
    [...fiveSimKeys.all, 'service-prices', product] as const,
  activation: (id: number) =>
    [...fiveSimKeys.all, 'activation', id] as const,
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all available countries
 * Cache: 1 hour (data rarely changes)
 */
export function useCountries() {
  return useQuery({
    queryKey: fiveSimKeys.countries(),
    queryFn: async (): Promise<TransformedCountry[]> => {
      const res = await fetch('/api/5sim/countries')
      const json: ApiResponse<TransformedCountry[]> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch countries')
      }

      return json.data
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
  })
}

/**
 * Fetch products/services for a country
 * Cache: 5 minutes
 */
export function useProducts(country: string, operator: string = 'any') {
  return useQuery({
    queryKey: fiveSimKeys.products(country, operator),
    queryFn: async (): Promise<TransformedProduct[]> => {
      const params = new URLSearchParams({ country, operator })
      const res = await fetch(`/api/5sim/products?${params}`)
      const json: ApiResponse<TransformedProduct[]> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch products')
      }

      return json.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    enabled: !!country,
  })
}

/**
 * Fetch pricing for a specific country + product combo
 * Cache: 30 seconds, refetch every minute
 */
export function usePricing(country: string, product: string) {
  return useQuery({
    queryKey: fiveSimKeys.pricing(country, product),
    queryFn: async (): Promise<PricingData> => {
      const params = new URLSearchParams({ country, product })
      const res = await fetch(`/api/5sim/prices?${params}`)
      const json: ApiResponse<PricingData> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch pricing')
      }

      return json.data
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute
    enabled: !!country && !!product,
  })
}

/**
 * Fetch prices for ALL countries for a specific service/product
 * Cache: 1 minute
 */
export interface CountryWithPrice {
  iso: string
  name: string
  flag: string
  price: number
  priceUsd: number
  count: number
}

export function useServicePrices(product: string) {
  return useQuery({
    queryKey: fiveSimKeys.servicePrices(product),
    queryFn: async (): Promise<CountryWithPrice[]> => {
      const params = new URLSearchParams({ product })
      const res = await fetch(`/api/5sim/service-prices?${params}`)
      const json: ApiResponse<CountryWithPrice[]> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch service prices')
      }

      return json.data
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!product,
  })
}

/**
 * Poll for activation status / SMS
 * Polling: 5 seconds when PENDING, stops on RECEIVED/FINISHED/CANCELED
 */
export function useActivation(id: number | null) {
  return useQuery({
    queryKey: fiveSimKeys.activation(id!),
    queryFn: async (): Promise<FiveSimActivation> => {
      const res = await fetch(`/api/5sim/check?id=${id}`)
      const json: ApiResponse<FiveSimActivation> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to check activation')
      }

      return json.data
    },
    enabled: id !== null && id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Stop polling if SMS received or finished/canceled
      if (status === 'RECEIVED' || status === 'FINISHED' || status === 'CANCELED' || status === 'TIMEOUT') {
        return false
      }
      return 5000 // Poll every 5 seconds while PENDING
    },
  })
}

/**
 * Buy a phone number mutation
 */
export function useBuyNumber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      country,
      product,
      operator = 'any',
    }: {
      country: string
      product: string
      operator?: string
    }): Promise<FiveSimActivation> => {
      const res = await fetch('/api/5sim/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, product, operator }),
      })

      const json: ApiResponse<FiveSimActivation> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to buy number')
      }

      return json.data
    },
    onSuccess: (activation) => {
      // Pre-populate the activation cache
      queryClient.setQueryData(
        fiveSimKeys.activation(activation.id),
        activation
      )
    },
  })
}

/**
 * Finish activation mutation
 */
export function useFinishActivation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<FiveSimActivation> => {
      const res = await fetch('/api/5sim/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json: ApiResponse<FiveSimActivation> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to finish activation')
      }

      return json.data
    },
    onSuccess: (activation) => {
      queryClient.setQueryData(
        fiveSimKeys.activation(activation.id),
        activation
      )
    },
  })
}

/**
 * Cancel activation mutation
 */
export function useCancelActivation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<FiveSimActivation> => {
      const res = await fetch('/api/5sim/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json: ApiResponse<FiveSimActivation> = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to cancel activation')
      }

      return json.data
    },
    onSuccess: (activation) => {
      queryClient.setQueryData(
        fiveSimKeys.activation(activation.id),
        activation
      )
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get popular products from a country
 */
export function usePopularProducts(country: string) {
  const { data: products, ...rest } = useProducts(country)

  const popularProducts = products?.filter((p) => p.isPopular) ?? []

  return {
    ...rest,
    data: popularProducts,
  }
}

/**
 * Search products by name
 */
export function useSearchProducts(country: string, searchTerm: string) {
  const { data: products, ...rest } = useProducts(country)

  const filteredProducts =
    products?.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? []

  return {
    ...rest,
    data: filteredProducts,
  }
}
