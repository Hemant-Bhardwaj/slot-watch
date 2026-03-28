import { useState } from 'react'

interface HeaderProps {
  lastChecked: Date | null
  onMenuClick: () => void
}

export function Header({ lastChecked, onMenuClick }: HeaderProps) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const timeAgo = lastChecked
    ? formatTimeAgo(lastChecked)
    : 'checking...'

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

        {/* Status bar */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#555] tracking-wide">
          <span>Schengen</span>
          <span className="text-[#333]">·</span>
          <span>London</span>
          <span className="text-[#333]">·</span>
          <span>checks every hour</span>
          {lastChecked && (
            <>
              <span className="text-[#333]">·</span>
              <span className="text-[#444]">last: {timeAgo}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="text-xs text-[#555] hover:text-[#888] transition-colors px-2 py-1"
            title="Copy link"
          >
            {copied ? 'copied ✓' : 'share'}
          </button>
          <button
            onClick={onMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded border border-dark-400 hover:border-dark-300 transition-colors"
            aria-label="Menu"
          >
            <span className="text-[#555] text-lg leading-none">···</span>
          </button>
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
  return `${hours}h ago`
}
