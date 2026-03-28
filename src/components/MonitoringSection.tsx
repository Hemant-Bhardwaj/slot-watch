import { useState } from 'react'
import { CountrySlot } from '../types'
import { NotifyModal } from './NotifyModal'

interface MonitoringSectionProps {
  countries: CountrySlot[]
  subscribedCountries: string[]
  onSubscribe: (countryCode: string, email: string) => Promise<void>
}

export function MonitoringSection({ countries, subscribedCountries, onSubscribe }: MonitoringSectionProps) {
  const [modalCountry, setModalCountry] = useState<CountrySlot | null>(null)
  const [query, setQuery] = useState('')

  if (countries.length === 0) return null

  const filtered = query.trim()
    ? countries.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : countries

  return (
    <>
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#333] inline-block" />
          <h2 className="text-xs font-bold tracking-[0.2em] text-[#555] uppercase">
            Monitoring · No slots yet
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-xs pointer-events-none">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search countries..."
            className="w-full bg-dark-800 border border-dark-500 rounded px-8 py-2 text-xs text-[#ccc] placeholder-[#444] focus:outline-none focus:border-dark-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#777] text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filtered.length > 0 ? filtered.map(c => (
            <MonitoringRow
              key={c.code}
              country={c}
              isSubscribed={subscribedCountries.includes(c.code)}
              onNotify={() => setModalCountry(c)}
            />
          )) : (
            <p className="text-xs text-[#444] px-1 py-3">No countries match "{query}"</p>
          )}
        </div>
      </section>

      {modalCountry && (
        <NotifyModal
          country={modalCountry}
          onClose={() => setModalCountry(null)}
          onSubscribe={async (email) => {
            await onSubscribe(modalCountry.code, email)
            setModalCountry(null)
          }}
        />
      )}
    </>
  )
}

function MonitoringRow({
  country,
  isSubscribed,
  onNotify,
}: {
  country: CountrySlot
  isSubscribed: boolean
  onNotify: () => void
}) {
  const label = country.waitlist ? 'Waitlist open' : country.tracked ? null : 'No data'

  return (
    <div className="flex items-center justify-between px-4 py-3 border border-dark-500 rounded-lg hover:border-dark-400 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{country.flag}</span>
        <div>
          <p className="text-sm text-[#ccc]">{country.name}</p>
          <p className="text-xs text-[#444]">
            {country.visaCenter}
            {label && (
              <span className={`ml-2 ${country.waitlist ? 'text-yellow-500/70' : 'text-[#333]'}`}>
                · {label}
              </span>
            )}
          </p>
        </div>
      </div>

      {country.tracked ? (
        <button
          onClick={onNotify}
          className={`px-3 py-1.5 rounded border text-xs tracking-wide transition-all ${
            isSubscribed
              ? 'border-lime-400/40 text-lime-400 bg-lime-400/5'
              : 'border-dark-400 text-[#555] hover:border-dark-300 hover:text-[#888]'
          }`}
        >
          {isSubscribed ? 'Notify me ✓' : '+ Notify me'}
        </button>
      ) : (
        <a
          href={country.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded border border-dark-500 text-xs text-[#444] hover:text-[#666] transition-colors"
        >
          Check directly ↗
        </a>
      )}
    </div>
  )
}
