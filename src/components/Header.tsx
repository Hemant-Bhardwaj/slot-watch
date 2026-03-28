interface HeaderProps {
  dataUpdatedAt: string | null  // ISO string from slots.json — when scraper last ran
}

export function Header({ dataUpdatedAt }: HeaderProps) {
  const timeAgo = dataUpdatedAt ? formatTimeAgo(new Date(dataUpdatedAt)) : null

  return (
    <header className="sticky top-0 z-50 border-b border-dark-500 bg-dark-900/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot w-2 h-2 rounded-full bg-lime-400 inline-block" />
          <span className="text-sm font-bold tracking-[0.2em] text-white uppercase">
            Slot Watch
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-[#555] tracking-wide">
          <span className="hidden sm:inline">Schengen</span>
          <span className="hidden sm:inline text-[#333]">·</span>
          <span className="hidden sm:inline">London</span>
          <span className="hidden sm:inline text-[#333]">·</span>
          <span className="hidden sm:inline">checks every hour</span>
          {timeAgo && (
            <>
              <span className="hidden sm:inline text-[#333]">·</span>
              <span className="text-[#444]">updated {timeAgo}</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
