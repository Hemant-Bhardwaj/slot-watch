import { CountrySlot } from '../types'
import { formatDate } from '../utils/formatDate'

interface AvailableNowProps {
  countries: CountrySlot[]
}

export function AvailableNow({ countries }: AvailableNowProps) {
  if (countries.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="pulse-dot w-2 h-2 rounded-full bg-lime-400 inline-block" />
        <h2 className="text-xs font-bold tracking-[0.2em] text-lime-400 uppercase">
          Available Now
        </h2>
        <span className="text-xs text-[#444]">({countries.length})</span>
      </div>

      <div className="space-y-3">
        {countries.map(c => (
          <AvailableCard key={c.code} country={c} />
        ))}
      </div>
    </section>
  )
}

function AvailableCard({ country }: { country: CountrySlot }) {
  const sortedSlots = [...country.slots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const firstSlot = sortedSlots[0]
  const otherSlots = sortedSlots.slice(1, 3)
  return (
    <div className="border border-dark-400 rounded-lg p-4 bg-dark-700 fade-in hover:border-dark-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{country.flag}</span>
          <div>
            <p className="text-sm font-bold text-white">{country.name}</p>
            <p className="text-xs text-[#555]">{country.visaCenter} · London</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded">
            slots available
          </span>
        </div>
      </div>

      {firstSlot && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-lime-400">
            First available: {formatDate(firstSlot.date)}
          </p>
          {otherSlots.length > 0 && (
            <p className="text-xs text-lime-400/70">
              Also:{' '}
              {otherSlots
                .map(s => `${formatDate(s.date)}`)
                .join(', ')}
            </p>
          )}
        </div>
      )}

      <a
        href={country.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 border border-lime-400/40 bg-lime-400/5 hover:bg-lime-400/10 hover:border-lime-400/70 rounded text-xs text-lime-400 font-bold tracking-wide transition-all"
      >
        Book now ↗
      </a>
    </div>
  )
}
