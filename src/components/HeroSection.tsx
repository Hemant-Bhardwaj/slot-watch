interface HeroSectionProps {
  totalAvailable: number
  totalCountries: number
}

export function HeroSection({ totalAvailable, totalCountries }: HeroSectionProps) {
  return (
    <section className="px-4 py-10 sm:py-16 max-w-6xl mx-auto">
      <p className="text-xs tracking-[0.25em] text-[#555] uppercase mb-4">
        Visa Appointment Tracker
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white mb-4">
        Know the moment a{' '}
        <span className="text-lime-400">Schengen slot</span>
        <br />
        opens in London.
      </h1>
      <p className="text-sm sm:text-base text-[#555] leading-relaxed max-w-xl">
        Pick your countries. Add your contact. We notify you the second a slot
        appears.{' '}
        <span className="text-[#444]">
          No account. No cost. Checks every hour.
        </span>
      </p>
      {totalAvailable > 0 && (
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded border border-lime-400/30 bg-lime-400/5">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 pulse-dot" />
          <span className="text-xs text-lime-400 tracking-wide">
            {totalAvailable} of {totalCountries} countries have slots right now
          </span>
        </div>
      )}
    </section>
  )
}
