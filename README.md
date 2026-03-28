# Slot Watch — Schengen Visa Tracker London

Know the moment a Schengen visa appointment slot opens in London.

**Free. No account. Checks every 30 minutes.**

---

## Features

- Tracks all Schengen countries at London visa centres (VFS Global, TLScontact, BLS International)
- Shows available slots with first available date
- "Notify me" via:
  - **Push notifications** (via [ntfy.sh](https://ntfy.sh) — free, no account)
  - **Email** (via Resend — free 3,000 emails/month)
- Runs entirely on free infrastructure: GitHub Pages + GitHub Actions

---

## Quick start (local)

```bash
npm install
npm run dev
```

---

## Deploy to GitHub Pages

### 1. Create a GitHub repository

Push this code to a new public GitHub repository.

### 2. Enable GitHub Pages

Go to **Settings → Pages → Source** and set it to **GitHub Actions**.

### 3. Set the base path

If your repo is `github.com/username/slot-watch`, add a **repository variable**:

- Go to **Settings → Secrets and variables → Actions → Variables**
- Add: `VITE_BASE_PATH` = `/slot-watch/`

### 4. Push to main

The deploy workflow (`.github/workflows/deploy.yml`) will build and deploy automatically.

### 5. Enable the slot checker

The slot checker workflow (`.github/workflows/check-slots.yml`) runs every 30 minutes and commits updated slot data. It will start automatically once the repo is on GitHub.

---

## Setting up real slot checking

The checker currently uses **mock data**. To connect to real visa centre APIs:

### VFS Global (Germany, Italy, Netherlands, Portugal, Greece, Austria, Belgium, Czech Republic, Sweden)

1. Create a free account at [visa.vfsglobal.com](https://visa.vfsglobal.com)
2. Add GitHub Actions secrets:
   - `VFS_EMAIL` — your VFS account email
   - `VFS_PASSWORD` — your VFS account password
3. Update `scripts/check-slots.js` → `checkVfsGlobal()` to use the real API

### TLScontact (France, Switzerland)

1. Create a free account at [uk.tlscontact.com](https://uk.tlscontact.com)
2. Add secrets: `TLSC_EMAIL`, `TLSC_PASSWORD`
3. Update `checkTlsContact()` in the checker script

### BLS International (Spain)

1. Create account at [blsspainuk.com](https://blsspainuk.com)
2. Add secrets: `BLS_EMAIL`, `BLS_PASSWORD`
3. Update `checkBls()` in the checker script

---

## Setting up notifications (optional)

### Push notifications — ntfy.sh (completely free)

No setup needed. When users click "Notify me" they get a unique ntfy topic. They install the [ntfy app](https://ntfy.sh) and subscribe to that topic. The checker script posts to ntfy.sh when slots appear.

### Email notifications — Resend

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month)
2. Verify your sending domain
3. Update the `from` address in `scripts/check-slots.js`
4. Add secret: `RESEND_API_KEY`

### Subscriber storage — Supabase

For email notifications to work across sessions, subscribers must be stored:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor
3. Add GitHub Actions secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Add repository secrets for the frontend:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## Architecture

```
GitHub Actions (cron every 30 min)
  └─ scripts/check-slots.js
       ├─ checks VFS Global / TLScontact / BLS APIs
       ├─ writes public/data/slots.json (committed to repo)
       └─ sends notifications:
            ├─ ntfy.sh (push) — no account needed
            └─ Resend (email) — via Supabase subscriber list

GitHub Pages (static hosting)
  └─ React app
       ├─ reads public/data/slots.json every 5 min
       └─ shows available slots + notify me modals
```

---

## Countries tracked

| Country | Visa Centre |
|---------|------------|
| France | TLScontact |
| Germany | VFS Global |
| Italy | VFS Global |
| Spain | BLS International |
| Netherlands | VFS Global |
| Portugal | VFS Global |
| Greece | VFS Global |
| Austria | VFS Global |
| Belgium | VFS Global |
| Switzerland | TLScontact |
| Czech Republic | VFS Global |
| Sweden | VFS Global |

---

## License

MIT
