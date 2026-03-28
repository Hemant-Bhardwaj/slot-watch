export interface SlotDate {
  date: string      // ISO date string e.g. "2025-04-14"
  count: number
}

export interface CountrySlot {
  code: string
  name: string
  flag: string
  visaCenter: string
  bookingUrl: string
  tracked: boolean      // false = no data source exists for this country
  available: boolean
  waitlist: boolean     // true = waitlist open (no confirmed slot but can join queue)
  slots: SlotDate[]
  lastChecked: string   // ISO datetime
}

export interface SlotsData {
  updatedAt: string
  location: string
  countries: CountrySlot[]
}

export interface Subscriber {
  id: string
  email?: string
  ntfyTopic?: string
  countries: string[]  // array of country codes
  createdAt: string
}

export type NotifyMethod = 'ntfy' | 'email'
