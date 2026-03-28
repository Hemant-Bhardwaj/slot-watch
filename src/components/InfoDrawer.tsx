interface InfoDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoDrawer({ isOpen, onClose }: InfoDrawerProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-dark-700 border-l border-dark-400 h-full overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
          <span className="text-xs tracking-[0.2em] text-[#888] uppercase">About</span>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-[#999] text-xl w-7 h-7 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-6 space-y-6 text-xs text-[#555] leading-relaxed">
          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">How it works</h3>
            <p>
              A script runs every 30 minutes via GitHub Actions. It checks appointment
              availability at VFS Global, TLScontact, and BLS International for Schengen
              countries in London. Results are written to a JSON file served alongside
              this app.
            </p>
          </div>

          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">Notifications</h3>
            <p className="mb-2">
              <span className="text-white">Push (ntfy):</span> Uses{' '}
              <a href="https://ntfy.sh" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
                ntfy.sh
              </a>
              , a free open-source push notification service. Install the ntfy app on your
              phone, subscribe to the topic we give you, and receive instant push notifications.
            </p>
            <p>
              <span className="text-white">Email:</span> Requires Supabase + Resend setup
              (both have free tiers). See the README for instructions.
            </p>
          </div>

          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">Privacy</h3>
            <p>
              Push notifications via ntfy require no personal data. If you choose email,
              your address is stored in Supabase only. No analytics, no tracking, no ads.
            </p>
          </div>

          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">Data accuracy</h3>
            <p>
              Slot data is up to 30 minutes old. Always verify availability on the official
              visa center website before making travel plans. Slots can disappear quickly.
            </p>
          </div>

          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">Visa Centers</h3>
            <ul className="space-y-1">
              <li>France → TLScontact</li>
              <li>Germany, Italy, Netherlands, Portugal, Greece, Austria, Belgium, Czech Republic, Sweden → VFS Global</li>
              <li>Spain → BLS International</li>
              <li>Switzerland → TLScontact</li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#888] mb-2 uppercase tracking-wide text-[11px]">Source</h3>
            <p>
              Open source.{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-400 hover:underline"
              >
                View on GitHub →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
