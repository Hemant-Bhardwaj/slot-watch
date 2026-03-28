import { useState } from 'react'
import { CountrySlot } from '../types'

interface NotifyModalProps {
  country: CountrySlot
  onClose: () => void
  onSubscribe: (email: string) => Promise<void>
}

export function NotifyModal({ country, onClose, onSubscribe }: NotifyModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSubscribe(email.trim())
      setDone(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-dark-700 border border-dark-400 rounded-lg fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{country.flag}</span>
            <div>
              <p className="text-sm font-bold text-white">{country.name}</p>
              <p className="text-xs text-[#555]">{country.visaCenter} · London</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-[#999] text-xl leading-none w-7 h-7 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          {done ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-3">✓</p>
              <p className="text-sm text-white font-bold mb-1">You're on the list</p>
              <p className="text-xs text-[#555]">
                We'll email <span className="text-white">{email}</span> the moment a slot opens for {country.name}.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2 border border-dark-400 rounded text-xs text-[#555] hover:text-[#888] hover:border-dark-300 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#555] mb-4">
                We'll email you the moment a slot opens for {country.name}.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#555] mb-2 tracking-wide uppercase">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full bg-dark-900 border border-dark-400 rounded px-4 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-lime-400/50 transition-colors"
                    required
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-lime-400 hover:bg-lime-500 text-dark-900 font-bold text-xs tracking-[0.15em] uppercase rounded transition-colors disabled:opacity-40"
                >
                  {loading ? 'Saving...' : 'Notify me'}
                </button>

                <p className="text-xs text-[#444] text-center">
                  One email per slot. Unsubscribe any time.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
