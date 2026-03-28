import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COUNTRIES: Record<string, { name: string; flag: string; visaCenter: string; bookingUrl: string }> = {
  at: { name: 'Austria',        flag: '🇦🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/aut/schedule-appointment' },
  bg: { name: 'Bulgaria',       flag: '🇧🇬', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/bgr/schedule-appointment' },
  hr: { name: 'Croatia',        flag: '🇭🇷', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/hrv/schedule-appointment' },
  cy: { name: 'Cyprus',         flag: '🇨🇾', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/cyp/schedule-appointment' },
  cz: { name: 'Czech Republic', flag: '🇨🇿', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/cze/schedule-appointment' },
  dk: { name: 'Denmark',        flag: '🇩🇰', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/dnk/schedule-appointment' },
  ee: { name: 'Estonia',        flag: '🇪🇪', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/est/schedule-appointment' },
  fi: { name: 'Finland',        flag: '🇫🇮', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/fin/schedule-appointment' },
  hu: { name: 'Hungary',        flag: '🇭🇺', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/hun/schedule-appointment' },
  is: { name: 'Iceland',        flag: '🇮🇸', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/isl/schedule-appointment' },
  it: { name: 'Italy',          flag: '🇮🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/ita/schedule-appointment' },
  lv: { name: 'Latvia',         flag: '🇱🇻', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/lva/schedule-appointment' },
  lt: { name: 'Lithuania',      flag: '🇱🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/ltu/schedule-appointment' },
  mt: { name: 'Malta',          flag: '🇲🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/mlt/schedule-appointment' },
  nl: { name: 'Netherlands',    flag: '🇳🇱', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/nld/schedule-appointment' },
  no: { name: 'Norway',         flag: '🇳🇴', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/nor/schedule-appointment' },
  pt: { name: 'Portugal',       flag: '🇵🇹', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/prt/schedule-appointment' },
  si: { name: 'Slovenia',       flag: '🇸🇮', visaCenter: 'VFS Global',       bookingUrl: 'https://visa.vfsglobal.com/gbr/en/svn/schedule-appointment' },
  ch: { name: 'Switzerland',    flag: '🇨🇭', visaCenter: 'TLScontact',       bookingUrl: 'https://uk.tlscontact.com/appointment/gb/ldn2ch/login'       },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { email, countryCode } = await req.json()
    if (!email || !countryCode) {
      return new Response(JSON.stringify({ error: 'email and countryCode required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const country = COUNTRIES[countryCode]
    if (!country) {
      return new Response(JSON.stringify({ error: 'Unknown country code' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Upsert subscriber
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ email, countries: [countryCode] }),
    })

    if (!dbRes.ok) {
      const body = await dbRes.text()
      throw new Error(`DB insert failed: ${body}`)
    }

    // Send confirmation email
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'notifications@slotwatch.app'

    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Slot Watch <${fromEmail}>`,
          to: [email],
          subject: `You're watching ${country.flag} ${country.name} — Slot Watch`,
          html: `
<div style="font-family:monospace;background:#0a0a0a;color:#e8e8e8;padding:32px;max-width:520px;margin:0 auto">
  <p style="color:#555;font-size:11px;margin:0 0 24px;letter-spacing:0.15em">SLOT WATCH · LONDON</p>
  <h2 style="color:#c8ff00;margin:0 0 16px;font-size:20px">${country.flag} ${country.name}</h2>
  <p style="color:#e8e8e8;margin:0 0 24px;font-size:14px;line-height:1.6">
    You're now watching <strong style="color:#fff">${country.name}</strong> visa appointments in London.<br>
    We'll email you the moment a slot opens up.
  </p>
  <p style="color:#333;margin:32px 0 0;font-size:11px">
    — Slot Watch
  </p>
</div>`,
        }),
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
