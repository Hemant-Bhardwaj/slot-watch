export function LoadingState() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-dark-500 rounded-lg p-4 bg-dark-700 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-dark-500" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-dark-500 rounded" />
                <div className="h-2.5 w-16 bg-dark-600 rounded" />
              </div>
            </div>
            <div className="h-2.5 w-40 bg-dark-500 rounded mb-2" />
            <div className="h-2.5 w-28 bg-dark-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <p className="text-xs text-[#555] mb-2">Failed to load slot data</p>
      <p className="text-xs text-[#333] mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 border border-dark-400 rounded text-xs text-[#555] hover:text-[#888] hover:border-dark-300 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
