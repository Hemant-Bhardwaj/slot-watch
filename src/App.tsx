import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { AvailableNow } from './components/AvailableNow'
import { MonitoringSection } from './components/MonitoringSection'
import { LoadingState, ErrorState } from './components/LoadingState'
import { useSlots } from './hooks/useSlots'

export default function App() {
  const { available, monitoring, loading, error, refresh, data } = useSlots()

  return (
    <div className="min-h-screen bg-dark-900 text-white font-mono">
      <Header dataUpdatedAt={data?.updatedAt ?? null} />

      <HeroSection totalAvailable={available.length} totalCountries={data?.countries.length ?? 0} />

      <div className="border-t border-dark-500 mx-4 max-w-6xl md:mx-auto" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {available.length > 0 ? (
                <AvailableNow countries={available} />
              ) : (
                <NoSlotsPlaceholder />
              )}
            </div>
            <div>
              <MonitoringSection countries={monitoring} />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-dark-500 px-4 py-6 mt-8">
        <p className="max-w-6xl mx-auto text-xs text-[#333] text-center sm:text-left">
          Slot Watch — Schengen visa tracker for London · checks every hour
        </p>
      </footer>
    </div>
  )
}

function NoSlotsPlaceholder() {
  return (
    <div className="border border-dark-500 rounded-lg p-6 text-center">
      <div className="w-2 h-2 rounded-full bg-[#333] mx-auto mb-3" />
      <p className="text-xs text-[#444]">No slots available right now</p>
      <p className="text-xs text-[#333] mt-1">Checking every hour</p>
    </div>
  )
}
