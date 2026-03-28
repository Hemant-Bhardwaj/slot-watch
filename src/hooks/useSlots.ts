import { useState, useEffect, useCallback } from 'react'
import { SlotsData, CountrySlot } from '../types'

const SLOTS_URL = `${import.meta.env.BASE_URL}data/slots.json`
const REFRESH_INTERVAL = 60 * 60 * 1000 // poll every hour (matches scraper cadence)

export function useSlots() {
  const [data, setData] = useState<SlotsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`${SLOTS_URL}?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch slot data')
      const json: SlotsData = await res.json()
      setData(json)
      setLastFetch(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots()
    const interval = setInterval(fetchSlots, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchSlots])

  const available: CountrySlot[] = data?.countries.filter(c => c.available) ?? []
  const monitoring: CountrySlot[] = data?.countries.filter(c => !c.available) ?? []

  return { data, available, monitoring, loading, error, lastFetch, refresh: fetchSlots }
}
