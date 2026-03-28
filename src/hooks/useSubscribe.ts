import { useState, useCallback } from 'react'
import { COUNTRIES } from '../data/countries'

// Subscribers are stored in localStorage only.
// Actual notifications are sent via ntfy.sh (push) or email stored in Supabase
// (see scripts/notify.js and supabase/migrations/ for the server side).

const LS_KEY = 'slot-watch-subscriptions'

interface Subscription {
  countries: string[]
  ntfyTopic: string
  email?: string
  createdAt: string
}

function loadFromStorage(): Subscription | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useSubscribe() {
  const [subscription, setSubscription] = useState<Subscription | null>(() => loadFromStorage())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const subscribe = useCallback(async (countries: string[], email?: string) => {
    if (countries.length === 0) {
      setError('Select at least one country.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Build a deterministic ntfy topic from selected countries
      const sorted = [...countries].sort().join('-')
      const hash = Math.abs(
        sorted.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0)
      ).toString(16)
      const ntfyTopic = `slot-watch-${hash}`

      const sub: Subscription = {
        countries,
        ntfyTopic,
        email: email?.trim() || undefined,
        createdAt: new Date().toISOString(),
      }

      // Persist to Supabase if configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/subscribers`, {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            email: sub.email,
            ntfy_topic: sub.ntfyTopic,
            countries: sub.countries,
          }),
        })
        if (!res.ok) throw new Error('Failed to save subscription')
      }

      localStorage.setItem(LS_KEY, JSON.stringify(sub))
      setSubscription(sub)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    setSubscription(null)
    setSuccess(false)
  }, [])

  const getCountryTopics = useCallback((countryCodes: string[]) => {
    return COUNTRIES.filter(c => countryCodes.includes(c.code)).map(c => c.ntfyTopic)
  }, [])

  return {
    subscription,
    loading,
    error,
    success,
    subscribe,
    unsubscribe,
    getCountryTopics,
  }
}
