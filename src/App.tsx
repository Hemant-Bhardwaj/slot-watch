import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { AvailableNow } from './components/AvailableNow'
import { MonitoringSection } from './components/MonitoringSection'
import { InfoDrawer } from './components/InfoDrawer'
import { LoadingState, ErrorState } from './components/LoadingState'
import { useSlots } from './hooks/useSlots'

export default function App() {
  const { available, monitoring, loading, error, lastFetch, refresh, data } = useSlots()
  const [infoOpen, setInfoOpen] = useState(false)
  const [subscribedCountries, setSubscribedCountries] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('slot-watch-subscribed')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const handleSubscribe = useCallback(
    async (countryCode: string, email: string) => {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase not configured — see README.')
      }
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email, countries: [countryCode] }),
      })
      if (!res.ok) throw new Error('Subscription failed')

      const updated = Array.from(new Set([...subscribedCountries, countryCode]))
      setSubscribedCountries(updated)
      localStorage.setItem('slot-watch-subscribed', JSON.stringify(updated))
    },
    [subscribedCountries]
  )

  const totalCountries = (data?.countries.length ?? 0)

  return (
    <div className="min-h-screen bg-dark-900 text-white font-mono">
      <Header lastChecked={lastFetch} onMenuClick={() => setInfoOpen(true)} />

      {/* Hero */}
      <HeroSection totalAvailable={available.length} totalCountries={totalCountries} />

      {/* Divider */}
      <div className="border-t border-dark-500 mx-4 max-w-6xl md:mx-auto" />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Available Now */}
            <div>
              {available.length > 0 ? (
                <AvailableNow countries={available} />
              ) : (
                <NoSlotsPlaceholder />
              )}
            </div>

            {/* Right: Monitoring */}
            <div>
              <MonitoringSection
                countries={monitoring}
                subscribedCountries={subscribedCountries}
                onSubscribe={(code, email) => handleSubscribe(code, email)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-500 px-4 py-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#333]">
          <span>Slot Watch — Schengen visa tracker for London</span>
          <div className="flex items-center gap-4">
            <span>Checks every 30 min</span>
            <button
              onClick={() => setInfoOpen(true)}
              className="hover:text-[#666] transition-colors"
            >
              How it works
            </button>
          </div>
        </div>
      </footer>

      <InfoDrawer isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}

function NoSlotsPlaceholder() {
  return (
    <div className="border border-dark-500 rounded-lg p-6 text-center">
      <div className="w-2 h-2 rounded-full bg-[#333] mx-auto mb-3" />
      <p className="text-xs text-[#444]">No slots available right now</p>
      <p className="text-xs text-[#333] mt-1">Checking every 30 minutes</p>
    </div>
  )
}
