/**
 * Slot Checker — runs every 30 minutes via GitHub Actions
 *
 * Source: schengenappointments.com/in/london/tourism
 * Single fetch, server-side rendered — no headless browser needed.
 *
 * Countries NOT covered by the source site (marked tracked:false in output):
 *   France, Germany, Spain, Greece, Belgium, Sweden
 *   These use TLScontact / BLS International which the site doesn't scrape.
 *
 * Optional secrets for email notifications:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY
 */

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../public/data/slots.json')
const SCRAPE_URL = 'https://schengenappointments.com/in/london/tourism'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Country definitions ─────────────────────────────────────────────────────
// tracked: true  → scraped from schengenappointments.com
// tracked: false → site doesn't cover this country; shown as "No data source"

const COUNTRIES = [
  // ── Tracked by schengenappointments.com ──────────────────────────────────
  { code: 'at', name: 'Austria',        flag: '🇦🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/aut/schedule-appointment', tracked: true,  siteName: 'Austria'      },
  { code: 'bg', name: 'Bulgaria',       flag: '🇧🇬', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/bgr/schedule-appointment', tracked: true,  siteName: 'Bulgaria'     },
  { code: 'hr', name: 'Croatia',        flag: '🇭🇷', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/hrv/schedule-appointment', tracked: true,  siteName: 'Croatia'      },
  { code: 'cy', name: 'Cyprus',         flag: '🇨🇾', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/cyp/schedule-appointment', tracked: true,  siteName: 'Cyprus'       },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/cze/schedule-appointment', tracked: true,  siteName: 'Czechia'      },
  { code: 'dk', name: 'Denmark',        flag: '🇩🇰', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/dnk/schedule-appointment', tracked: true,  siteName: 'Denmark'      },
  { code: 'ee', name: 'Estonia',        flag: '🇪🇪', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/est/schedule-appointment', tracked: true,  siteName: 'Estonia'      },
  { code: 'fi', name: 'Finland',        flag: '🇫🇮', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/fin/schedule-appointment', tracked: true,  siteName: 'Finland'      },
  { code: 'hu', name: 'Hungary',        flag: '🇭🇺', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/hun/schedule-appointment', tracked: true,  siteName: 'Hungary'      },
  { code: 'is', name: 'Iceland',        flag: '🇮🇸', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/isl/schedule-appointment', tracked: true,  siteName: 'Iceland'      },
  { code: 'it', name: 'Italy',          flag: '🇮🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/ita/schedule-appointment', tracked: true,  siteName: 'Italy'        },
  { code: 'lv', name: 'Latvia',         flag: '🇱🇻', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/lva/schedule-appointment', tracked: true,  siteName: 'Latvia'       },
  { code: 'lt', name: 'Lithuania',      flag: '🇱🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/ltu/schedule-appointment', tracked: true,  siteName: 'Lithuania'    },
  { code: 'mt', name: 'Malta',          flag: '🇲🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/mlt/schedule-appointment', tracked: true,  siteName: 'Malta'        },
  { code: 'nl', name: 'Netherlands',    flag: '🇳🇱', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/nld/schedule-appointment', tracked: true,  siteName: 'Netherlands'  },
  { code: 'no', name: 'Norway',         flag: '🇳🇴', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/nor/schedule-appointment', tracked: true,  siteName: 'Norway'       },
  { code: 'pt', name: 'Portugal',       flag: '🇵🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/prt/schedule-appointment', tracked: true,  siteName: 'Portugal'     },
  { code: 'si', name: 'Slovenia',       flag: '🇸🇮', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/svn/schedule-appointment', tracked: true,  siteName: 'Slovenia'     },
  { code: 'ch', name: 'Switzerland',    flag: '🇨🇭', visaCenter: 'TLScontact',       bookingUrl: 'https://uk.tlscontact.com/appointment/gb/ldn2ch/login',       tracked: true,  siteName: 'Switzerland'  },

  // ── Not tracked — no data source for London ──────────────────────────────
  { code: 'be', name: 'Belgium',  flag: '🇧🇪', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/bel/schedule-appointment', tracked: false, siteName: null },
  { code: 'fr', name: 'France',   flag: '🇫🇷', visaCenter: 'TLScontact',       bookingUrl: 'https://uk.tlscontact.com/appointment/gb/ldn2fr/login',       tracked: false, siteName: null },
  { code: 'de', name: 'Germany',  flag: '🇩🇪', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/deu/schedule-appointment', tracked: false, siteName: null },
  { code: 'gr', name: 'Greece',   flag: '🇬🇷', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/grc/schedule-appointment', tracked: false, siteName: null },
  { code: 'es', name: 'Spain',    flag: '🇪🇸', visaCenter: 'BLS International', bookingUrl: 'https://blsspainuk.com/appointment',                          tracked: false, siteName: null },
  { code: 'se', name: 'Sweden',   flag: '🇸🇪', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/swe/schedule-appointment', tracked: false, siteName: null },
]

// ─── HTML → plain text ───────────────────────────────────────────────────────

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Date parsing ─────────────────────────────────────────────────────────────

function parseDate(day, monthStr) {
  const monthIdx = MONTHS.indexOf(monthStr)
  if (monthIdx === -1) return null
  const dayNum = parseInt(day)
  const now = new Date()
  let year = now.getFullYear()
  // If this month/day is already in the past, assume next year
  const candidate = new Date(year, monthIdx, dayNum)
  if (candidate < now) year++
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
}

// ─── Scraper ─────────────────────────────────────────────────────────────────

async function scrapeSchengenSite() {
  const res = await fetch(SCRAPE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-GB,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${SCRAPE_URL}`)

  const html = await res.text()
  const text = stripHtml(html)

  // Narrow to just the appointments table (ignore nav, footer, testimonials)
  const tableStart = text.indexOf('Destination Country')
  const tableEnd   = text.indexOf('User testimonials')
  if (tableStart === -1) throw new Error('Could not find appointments table — site layout may have changed')
  const tableText = text.slice(tableStart, tableEnd !== -1 ? tableEnd : undefined)

  // Collect the position of every tracked country name in the table text,
  // then bound each country's segment by the NEXT country's position.
  // This prevents a 400-char window from bleeding into a neighbouring country's
  // "No availability" text and producing false negatives.
  const trackedInPage = COUNTRIES
    .filter(c => c.tracked && c.siteName)
    .map(c => ({ ...c, idx: tableText.indexOf(c.siteName) }))
    .filter(c => c.idx !== -1)
    .sort((a, b) => a.idx - b.idx)

  if (trackedInPage.length === 0) throw new Error('No countries found in table — site layout may have changed')

  const scraped = {}

  for (let i = 0; i < trackedInPage.length; i++) {
    const country = trackedInPage[i]
    const nextIdx = trackedInPage[i + 1]?.idx ?? (country.idx + 300)
    const segment = tableText.slice(country.idx, nextIdx)

    if (segment.includes('No availability')) {
      scraped[country.code] = { available: false, slots: [], waitlist: false }
    } else if (segment.includes('Waitlist Open')) {
      scraped[country.code] = { available: false, slots: [], waitlist: true }
    } else {
      const dateMatch = segment.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)
      const slotMatch = segment.match(/(\d+)\s*\+\s*slots?/i)

      if (dateMatch) {
        const isoDate = parseDate(dateMatch[1], dateMatch[2])
        scraped[country.code] = {
          available: true,
          slots: isoDate ? [{ date: isoDate, count: slotMatch ? parseInt(slotMatch[1]) : 1 }] : [],
          waitlist: false,
        }
      } else {
        scraped[country.code] = { available: false, slots: [], waitlist: false }
      }
    }
  }

  return scraped
}

// ─── Notification helpers ────────────────────────────────────────────────────

async function sendEmail(to, country, firstDate) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('  [skip] RESEND_API_KEY not set')
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Slot Watch <${process.env.RESEND_FROM_EMAIL || 'notifications@slotwatch.app'}>`,
        to: [to],
        subject: `${country.flag} ${country.name} visa slot open — ${firstDate}`,
        html: `
<div style="font-family:monospace;background:#0a0a0a;color:#e8e8e8;padding:32px;max-width:520px;margin:0 auto">
  <p style="color:#555;font-size:11px;margin:0 0 24px;letter-spacing:0.15em">SLOT WATCH · LONDON</p>
  <h2 style="color:#c8ff00;margin:0 0 4px;font-size:22px">${country.flag} ${country.name}</h2>
  <p style="color:#888;margin:0 0 24px;font-size:13px">${country.visaCenter} · London</p>
  <p style="color:#e8e8e8;margin:0 0 6px;font-size:13px">First available</p>
  <p style="color:#c8ff00;font-size:20px;font-weight:bold;margin:0 0 28px">${firstDate}</p>
  <a href="${country.bookingUrl}"
     style="display:inline-block;background:#c8ff00;color:#0a0a0a;padding:12px 28px;text-decoration:none;font-weight:bold;border-radius:4px;font-size:13px;letter-spacing:0.05em">
    Book now →
  </a>
  <p style="color:#333;margin:32px 0 0;font-size:11px">
    You're receiving this because you subscribed to Slot Watch alerts for ${country.name}.
  </p>
</div>`,
      }),
    })
    if (res.ok) console.log(`  ✓ email → ${to}`)
    else {
      const body = await res.text()
      console.error(`  ✗ email failed ${res.status}: ${body}`)
    }
  } catch (err) {
    console.error(`  ✗ email error: ${err.message}`)
  }
}

async function notifySubscribers(newlyAvailable) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n[skip] Supabase not configured — no notifications sent')
    return
  }
  if (newlyAvailable.length === 0) return

  console.log('\nNotifying subscribers...')
  for (const country of newlyAvailable) {
    const firstDate = country.slots[0]?.date
    if (!firstDate) continue

    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/subscribers?countries=cs.{"${country.code}"}&select=email`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      if (!res.ok) {
        console.error(`  ✗ Supabase query failed: ${res.status}`)
        continue
      }
      const subs = await res.json()
      console.log(`  ${country.flag} ${country.name}: ${subs.length} subscriber(s)`)
      for (const sub of subs) {
        await sendEmail(sub.email, country, firstDate)
      }
    } catch (err) {
      console.error(`  Error notifying ${country.name}: ${err.message}`)
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n[${new Date().toISOString()}] Checking slots...\n`)

  // Load previous results to detect newly available countries
  let prevAvailable = new Set()
  if (existsSync(OUTPUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
      prevAvailable = new Set(prev.countries.filter(c => c.available).map(c => c.code))
    } catch { /* ignore */ }
  }

  // Scrape — single HTTP request for all tracked countries
  console.log(`Fetching ${SCRAPE_URL}...`)
  let scraped = {}
  try {
    scraped = await scrapeSchengenSite()
    console.log(`  ✓ Scraped ${Object.keys(scraped).length} countries\n`)
  } catch (err) {
    console.error(`  ✗ Scrape failed: ${err.message}\n`)
    // Write error state and exit — don't overwrite last good data
    process.exit(1)
  }

  const now = new Date().toISOString()
  const results = COUNTRIES.map(country => {
    const data = scraped[country.code]

    if (!country.tracked) {
      // No data source — show with tracked:false so UI can display differently
      return {
        code: country.code,
        name: country.name,
        flag: country.flag,
        visaCenter: country.visaCenter,
        bookingUrl: country.bookingUrl,
        tracked: false,
        available: false,
        waitlist: false,
        slots: [],
        lastChecked: now,
      }
    }

    if (!data) {
      // Tracked but wasn't found in page (shouldn't happen)
      console.log(`  [warn] No data for tracked country: ${country.name}`)
      return {
        code: country.code,
        name: country.name,
        flag: country.flag,
        visaCenter: country.visaCenter,
        bookingUrl: country.bookingUrl,
        tracked: true,
        available: false,
        waitlist: false,
        slots: [],
        lastChecked: now,
      }
    }

    const label = data.available
      ? `✓ ${data.slots.reduce((n, s) => n + s.count, 0)} slots (${data.slots[0]?.date})`
      : data.waitlist ? '~ waitlist open' : 'no slots'
    console.log(`  ${country.flag} ${country.name.padEnd(14)} ${label}`)

    return {
      code: country.code,
      name: country.name,
      flag: country.flag,
      visaCenter: country.visaCenter,
      bookingUrl: country.bookingUrl,
      tracked: true,
      available: data.available,
      waitlist: data.waitlist ?? false,
      slots: data.slots,
      lastChecked: now,
    }
  })

  // Write output
  const output = { updatedAt: now, location: 'London, UK', countries: results }
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`\nWritten → ${OUTPUT_PATH}`)

  // Notify for newly available countries
  const newlyAvailable = results.filter(c => c.available && !prevAvailable.has(c.code))
  if (newlyAvailable.length > 0) {
    console.log(`Newly available: ${newlyAvailable.map(c => c.name).join(', ')}`)
    await notifySubscribers(newlyAvailable)
  } else {
    console.log('No new availability.')
  }

  console.log('\nDone.\n')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
