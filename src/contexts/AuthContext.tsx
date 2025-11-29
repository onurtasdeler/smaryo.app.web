'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  Auth,
} from 'firebase/auth'
import { ref, get, set, onValue, Database } from 'firebase/database'
import { getAuth, getDatabase } from '@/lib/firebase'

interface UserProfile {
  email: string
  displayName?: string | null
  photoURL?: string | null
  balance: number
  createdAt: string
  lastLoginAt?: string
  provider?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshBalance: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)
  const [database, setDatabase] = useState<Database | null>(null)

  // Initialize Firebase on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const firebaseAuth = getAuth()
      const firebaseDb = getDatabase()
      setAuth(firebaseAuth)
      setDatabase(firebaseDb)
    } catch (err) {
      console.error('Firebase initialization error:', err)
      setLoading(false)
    }
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    if (!auth || !database) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch or create user profile
        const profileRef = ref(database, `users/${user.uid}/profile`)
        const snapshot = await get(profileRef)

        if (snapshot.exists()) {
          setProfile(snapshot.val())
          // Update last login
          await set(ref(database, `users/${user.uid}/profile/lastLoginAt`), new Date().toISOString())
        } else {
          // Create new profile
          const newProfile: UserProfile = {
            email: user.email || '',
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            balance: 0,
            createdAt: new Date().toISOString(),
            provider: user.providerData[0]?.providerId || 'email',
          }
          await set(profileRef, newProfile)
          setProfile(newProfile)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, database])

  // Listen to balance changes in real-time
  useEffect(() => {
    if (!user || !database) return

    const balanceRef = ref(database, `users/${user.uid}/profile/balance`)
    const unsubscribe = onValue(balanceRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile((prev) => prev ? { ...prev, balance: snapshot.val() } : null)
      }
    })

    return () => unsubscribe()
  }, [user, database])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu'
      setError(message)
      throw err
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kayıt olurken bir hata oluştu'
      setError(message)
      throw err
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google ile giriş yapılırken bir hata oluştu'
      setError(message)
      throw err
    }
  }

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Çıkış yapılırken bir hata oluştu'
      setError(message)
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu'
      setError(message)
      throw err
    }
  }

  const refreshBalance = async () => {
    if (!user || !database) return

    const balanceRef = ref(database, `users/${user.uid}/profile/balance`)
    const snapshot = await get(balanceRef)

    if (snapshot.exists()) {
      setProfile((prev) => prev ? { ...prev, balance: snapshot.val() } : null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
