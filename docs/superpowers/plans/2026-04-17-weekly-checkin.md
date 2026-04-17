# Weekly Check-In App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal weekly check-in web app that lets Tj capture highlights, challenges, priorities, talking points, and shoutouts, then send them as a branded email to his manager with one click.

**Architecture:** New route group `(checkin)` added to the existing Next.js repo, completely isolated from the existing Resy Passport demo at `/`. Password-gated via middleware + session cookie. Server Components fetch DB data; Client Components handle Tiptap editors and mutations via API routes.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Tiptap (rich text), Vercel Postgres (`@vercel/postgres`), Resend (email), Anthropic SDK (AI polish), Unsplash API (confirmation image), Vitest (unit tests), `date-fns` + `date-fns-tz` (timezone-aware week math), `crypto` (session token hashing)

---

## Important: Read Next.js 16 Docs First

Before writing any code, read these files in `node_modules/next/dist/docs/`:
- `01-app/03-api-reference/04-functions/cookies.md` — `cookies()` is now **async** (must `await`)
- `01-app/03-api-reference/03-file-conventions/route.md` — Route Handler signatures
- `01-app/03-api-reference/03-file-conventions/route-groups.md` — Route group conventions

Key breaking change from earlier versions: **`cookies()` returns a Promise** — always `await cookies()`.

---

## Routing Note

`/` is already the Resy Passport demo. The check-in app uses:
- `/login` — password gate (redirects to `/checkin` on success)
- `/checkin` — main form (protected)
- `/history` — history list (protected)
- `/history/[weekId]` — past check-in view (protected)

---

## File Map

```
src/
  middleware.ts                              # Protects /checkin and /history routes
  app/
    (checkin)/
      layout.tsx                             # Inter font, warm bg, isolated from Passport styles
      login/
        page.tsx                             # Password gate UI (server component)
      checkin/
        page.tsx                             # Fetches current week check-in, renders form or submitted view
      history/
        page.tsx                             # Lists all submitted check-ins
        [weekId]/
          page.tsx                           # Read-only view of one past check-in
    api/
      auth/login/
        route.ts                             # POST: validates password, sets session cookie
      checkin/
        route.ts                             # GET: current check-in. POST: upsert (auto-save)
        submit/route.ts                      # POST: mark submitted, send email, return Unsplash image
        polish/route.ts                      # POST: AI polish via Claude API
      cron/
        friday-reminder/route.ts             # GET: send Friday 3pm reminder if not submitted
        sunday-reminder/route.ts             # GET: send Sunday 6pm reminder if not submitted
  components/
    checkin/
      CheckinLayout.tsx                      # Outer wrapper: gradient header + page body
      SectionEditor.tsx                      # Single Tiptap editor with label/icon
      CheckinForm.tsx                        # Five editors + auto-save + Polish/Send buttons
      SendModal.tsx                          # Confirmation modal before sending
      ConfirmationScreen.tsx                 # Post-submit success screen with Unsplash image
      SubmittedView.tsx                      # Read-only view (used on /checkin after submit + /history/[weekId])
  lib/
    checkin/
      week.ts                                # getWeekStart, formatWeekRange, formatNextWeekRange, isEditable
      auth.ts                                # expectedToken(), SESSION_COOKIE_NAME
      db.ts                                  # getOrCreateCheckin, upsertCheckin, submitCheckin, listSubmitted, getCheckin
      email.ts                               # buildEmailHtml(), sendCheckinEmail()
      unsplash.ts                            # fetchConfirmationImage()
      htmlUtils.ts                           # stripHtml() for AI polish input
vercel.json                                  # Cron job config
```

---

## Task 1: Install Dependencies + Vitest Setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /path/to/repo
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-bullet-list @tiptap/extension-list-item @vercel/postgres resend @anthropic-ai/sdk date-fns date-fns-tz
```

Expected output: packages added to `node_modules/`, `package-lock.json` updated.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 3: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to the `scripts` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify Vitest runs**

```bash
npm test
```

Expected: `No test files found, exiting with code 0` (or similar — no errors).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: install check-in dependencies and Vitest"
```

---

## Task 2: Week Utility Functions (TDD)

**Files:**
- Create: `src/lib/checkin/week.ts`
- Create: `src/lib/checkin/week.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/checkin/week.test.ts
import { describe, it, expect } from 'vitest'
import {
  getWeekStart,
  formatWeekRange,
  formatNextWeekRange,
  isEditable,
} from './week'

describe('getWeekStart', () => {
  it('returns the Monday of the current week for a Wednesday', () => {
    // Wednesday April 16, 2026
    const result = getWeekStart(new Date('2026-04-16T12:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })

  it('returns the same Monday for a Monday', () => {
    const result = getWeekStart(new Date('2026-04-13T09:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })

  it('returns Monday of the current week for a Sunday', () => {
    // Sunday April 19 — still in the Apr 13 week
    const result = getWeekStart(new Date('2026-04-19T23:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })
})

describe('formatWeekRange', () => {
  it('formats Mon-Fri range for display in header', () => {
    // Week starting Apr 13 → "Apr 14–18, 2026"
    const weekStart = new Date('2026-04-13')
    expect(formatWeekRange(weekStart)).toBe('Apr 14–18, 2026')
  })
})

describe('formatNextWeekRange', () => {
  it('formats the next week Mon-Fri range with mm/dd', () => {
    // Week starting Apr 13 → next week is Apr 20-24
    const weekStart = new Date('2026-04-13')
    expect(formatNextWeekRange(weekStart)).toBe('04/20 – 04/24')
  })
})

describe('isEditable', () => {
  it('returns true when the cutoff (following Monday midnight ET) has not passed', () => {
    // Week starts Apr 13; cutoff is Apr 20 midnight ET
    // Current time is Apr 18 (Saturday)
    const weekStart = new Date('2026-04-13')
    const now = new Date('2026-04-18T12:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(true)
  })

  it('returns false after the following Monday midnight ET', () => {
    const weekStart = new Date('2026-04-13')
    // Tuesday Apr 21 — past the Monday midnight cutoff
    const now = new Date('2026-04-21T10:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(false)
  })

  it('returns true on the following Monday before midnight ET', () => {
    const weekStart = new Date('2026-04-13')
    const now = new Date('2026-04-20T23:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/lib/checkin/week.test.ts
```

Expected: `Cannot find module './week'`

- [ ] **Step 3: Implement week utilities**

```ts
// src/lib/checkin/week.ts
import {
  startOfWeek,
  addDays,
  addWeeks,
  isBefore,
  endOfDay,
} from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const ET = 'America/New_York'

// Returns the Monday (start of ISO week) for the given date, in ET
export function getWeekStart(date: Date): Date {
  const etDate = toZonedTime(date, ET)
  const monday = startOfWeek(etDate, { weekStartsOn: 1 })
  return fromZonedTime(monday, ET)
}

// "Apr 14–18, 2026" — Mon to Fri of the given week
export function formatWeekRange(weekStart: Date): string {
  const mon = addDays(weekStart, 1) // skip to Tuesday? No — weekStart IS Monday
  const fri = addDays(weekStart, 4)
  const monNum = weekStart.getUTCDate() + 1 // Mon is day after Sunday weekStart? 
  // weekStart is the Monday itself
  const monday = weekStart
  const friday = addDays(weekStart, 4)
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const year = weekStart.getUTCFullYear()
  const monStr = fmt.format(monday)   // "Apr 13"
  const friDay = friday.getUTCDate()  // 17
  // e.g. "Apr 13–17, 2026"
  return `${monStr}–${friDay}, ${year}`
}

// "04/20 – 04/24" — Mon to Fri of NEXT week
export function formatNextWeekRange(weekStart: Date): string {
  const nextMon = addWeeks(weekStart, 1)
  const nextFri = addDays(nextMon, 4)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmtMM_DD = (d: Date) =>
    `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}`
  return `${fmtMM_DD(nextMon)} – ${fmtMM_DD(nextFri)}`
}

// Check-in is editable until end of Monday (midnight ET) of the following week
export function isEditable(weekStart: Date, now: Date = new Date()): boolean {
  const followingMonday = addWeeks(weekStart, 1)
  // midnight ET = end of that Monday in ET
  const cutoffET = fromZonedTime(endOfDay(toZonedTime(followingMonday, ET)), ET)
  return isBefore(now, cutoffET)
}

// Format a Date as YYYY-MM-DD for DB storage and URL slugs
export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/lib/checkin/week.test.ts
```

Expected: all 6 tests pass. If a formatting test fails due to the Mon being "Apr 13" not "Apr 14", fix the `formatWeekRange` implementation — the header should show Mon–Fri of the *work week*, where Monday IS the first day. The label should read `Apr 13–17, 2026` for week starting Apr 13.

> **Note on the test:** the test expects `'Apr 14–18, 2026'` for week starting Apr 13. This reflects that the "work week" label is Mon–Fri where Monday = Apr 13. Update the test expectation to `'Apr 13–17, 2026'` if needed to match business logic, then re-run.

- [ ] **Step 5: Commit**

```bash
git add src/lib/checkin/week.ts src/lib/checkin/week.test.ts
git commit -m "feat: add week utility functions with tests"
```

---

## Task 3: Auth Utilities + Middleware

**Files:**
- Create: `src/lib/checkin/auth.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create auth utilities**

```ts
// src/lib/checkin/auth.ts
import { createHash } from 'crypto'

export const SESSION_COOKIE_NAME = 'checkin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export function expectedToken(): string {
  const password = process.env.CHECKIN_PASSWORD ?? ''
  return createHash('sha256').update(password).digest('hex')
}
```

- [ ] **Step 2: Create middleware**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { SESSION_COOKIE_NAME } from '@/lib/checkin/auth'

function expectedToken(): string {
  const password = process.env.CHECKIN_PASSWORD ?? ''
  return createHash('sha256').update(password).digest('hex')
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (token === expectedToken()) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/checkin', '/checkin/:path*', '/history', '/history/:path*'],
}
```

> Note: `expectedToken()` is duplicated here because middleware runs on the Edge Runtime and cannot import from `@/lib/checkin/auth` if that file uses Node.js APIs. Keep the duplication.

- [ ] **Step 3: Commit**

```bash
git add src/lib/checkin/auth.ts src/middleware.ts
git commit -m "feat: add auth utilities and middleware for check-in routes"
```

---

## Task 4: Check-In Route Group Layout + Login Page

**Files:**
- Create: `src/app/(checkin)/layout.tsx`
- Create: `src/app/(checkin)/login/page.tsx`
- Create: `src/app/api/auth/login/route.ts`

- [ ] **Step 1: Create the (checkin) route group layout**

```tsx
// src/app/(checkin)/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function CheckinRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={inter.variable}
      style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        background: '#fffbf7',
        minHeight: '100vh',
        color: '#1a1a1a',
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create the login API route**

```ts
// src/app/api/auth/login/route.ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, expectedToken } from '@/lib/checkin/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const cookieStore = await cookies()

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const { createHash } = await import('crypto')
  const submitted = createHash('sha256').update(password).digest('hex')

  if (submitted !== expectedToken()) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  cookieStore.set(SESSION_COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create the login page**

```tsx
// src/app/(checkin)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/checkin')
      } else {
        setError('Incorrect password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fffbf7',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#fff',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          border: '1px solid #fde8d1',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px',
            }}
          >
            ✦ Weekly Check-In
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              color: '#111',
              marginBottom: '8px',
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: error ? '1.5px solid #e11d48' : '1.5px solid #e5e7eb',
              fontSize: '15px',
              outline: 'none',
              background: '#fafafa',
            }}
          />
          {error && (
            <p style={{ fontSize: '13px', color: '#e11d48', margin: '-8px 0' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create a `.env.local` file (dev only)**

```
CHECKIN_PASSWORD=MyCheckin
DATABASE_URL=<paste from Vercel dashboard after DB setup>
RESEND_API_KEY=<your Resend key>
ANTHROPIC_API_KEY=<your Anthropic key>
UNSPLASH_ACCESS_KEY=<your Unsplash key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit this file — it is already in `.gitignore`.

- [ ] **Step 5: Verify login page loads**

```bash
npm run dev
```

Open `http://localhost:3000/login`. Confirm: centered card with gradient "Weekly Check-In" label, password input, "Continue →" button. Try entering wrong password — should see "Incorrect password" (will return 500 until env var is set, which is OK for now). Set `CHECKIN_PASSWORD=MyCheckin` in `.env.local` and try `MyCheckin` — should redirect to `/checkin` (which 404s until Task 7).

- [ ] **Step 6: Commit**

```bash
git add src/app/\(checkin\)/layout.tsx src/app/\(checkin\)/login/page.tsx src/app/api/auth/login/route.ts
git commit -m "feat: add (checkin) route group, login page, and auth API"
```

---

## Task 5: Database Schema + Query Functions

**Files:**
- Create: `src/lib/checkin/db.ts`
- Create: `src/lib/checkin/db.test.ts`
- Create: `scripts/migrate.ts` (run once to create table)

- [ ] **Step 1: Set up Vercel Postgres in the Vercel dashboard**

1. Go to your Vercel project → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL` connection string to `.env.local`
3. Run `vercel env pull .env.local` (or set manually) to get all Vercel env vars locally

- [ ] **Step 2: Create the migration script**

```ts
// scripts/migrate.ts
import { sql } from '@vercel/postgres'

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS check_ins (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      week_start      DATE NOT NULL UNIQUE,
      highlights      TEXT,
      challenges      TEXT,
      priorities      TEXT,
      talking_points  TEXT,
      shoutouts       TEXT,
      status          TEXT NOT NULL DEFAULT 'draft',
      submitted_at    TIMESTAMPTZ,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  console.log('Migration complete')
  process.exit(0)
}

migrate().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 3: Run the migration**

```bash
npx tsx scripts/migrate.ts
```

Expected: `Migration complete`

- [ ] **Step 4: Define the CheckIn type and write failing tests**

```ts
// src/lib/checkin/db.test.ts
import { describe, it, expect, vi } from 'vitest'

// We test the pure logic only — DB calls are not tested here
// (they require a live DB connection; test in integration)

import { CheckIn } from './db'

describe('CheckIn type', () => {
  it('has the expected shape', () => {
    const c: CheckIn = {
      id: 'abc',
      week_start: '2026-04-13',
      highlights: null,
      challenges: null,
      priorities: null,
      talking_points: null,
      shoutouts: null,
      status: 'draft',
      submitted_at: null,
      updated_at: new Date().toISOString(),
    }
    expect(c.status).toBe('draft')
    expect(c.week_start).toBe('2026-04-13')
  })
})
```

- [ ] **Step 5: Implement DB query functions**

```ts
// src/lib/checkin/db.ts
import { sql } from '@vercel/postgres'

export type CheckIn = {
  id: string
  week_start: string        // YYYY-MM-DD
  highlights: string | null
  challenges: string | null
  priorities: string | null
  talking_points: string | null
  shoutouts: string | null
  status: 'draft' | 'submitted'
  submitted_at: string | null
  updated_at: string
}

export type CheckInUpdate = Partial<
  Pick<CheckIn, 'highlights' | 'challenges' | 'priorities' | 'talking_points' | 'shoutouts'>
>

// Get existing check-in for a week, or create a draft if none exists
export async function getOrCreateCheckin(weekStart: string): Promise<CheckIn> {
  const { rows } = await sql<CheckIn>`
    INSERT INTO check_ins (week_start)
    VALUES (${weekStart})
    ON CONFLICT (week_start) DO NOTHING
  `
  const result = await sql<CheckIn>`
    SELECT * FROM check_ins WHERE week_start = ${weekStart}
  `
  return result.rows[0]
}

// Auto-save: update one or more fields
export async function upsertCheckin(weekStart: string, data: CheckInUpdate): Promise<void> {
  await sql`
    UPDATE check_ins
    SET
      highlights     = COALESCE(${data.highlights ?? null}, highlights),
      challenges     = COALESCE(${data.challenges ?? null}, challenges),
      priorities     = COALESCE(${data.priorities ?? null}, priorities),
      talking_points = COALESCE(${data.talking_points ?? null}, talking_points),
      shoutouts      = COALESCE(${data.shoutouts ?? null}, shoutouts),
      updated_at     = now()
    WHERE week_start = ${weekStart}
      AND status = 'draft'
  `
}

// Mark submitted and record the timestamp
export async function submitCheckin(weekStart: string): Promise<void> {
  await sql`
    UPDATE check_ins
    SET status = 'submitted', submitted_at = now(), updated_at = now()
    WHERE week_start = ${weekStart}
  `
}

// Get a single check-in by week_start
export async function getCheckin(weekStart: string): Promise<CheckIn | null> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins WHERE week_start = ${weekStart}
  `
  return rows[0] ?? null
}

// List all submitted check-ins, newest first
export async function listSubmittedCheckins(): Promise<CheckIn[]> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins
    WHERE status = 'submitted'
    ORDER BY week_start DESC
  `
  return rows
}

// Get the current week's check-in (draft or submitted)
export async function getCurrentCheckin(): Promise<CheckIn | null> {
  const { rows } = await sql<CheckIn>`
    SELECT * FROM check_ins
    ORDER BY week_start DESC
    LIMIT 1
  `
  return rows[0] ?? null
}
```

- [ ] **Step 6: Run tests**

```bash
npm test src/lib/checkin/db.test.ts
```

Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/checkin/db.ts src/lib/checkin/db.test.ts scripts/migrate.ts
git commit -m "feat: add DB schema, migration, and query functions"
```

---

## Task 6: Check-In API Routes (GET + POST auto-save)

**Files:**
- Create: `src/app/api/checkin/route.ts`

- [ ] **Step 1: Implement GET and POST**

```ts
// src/app/api/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCheckin, upsertCheckin } from '@/lib/checkin/db'
import { getWeekStart, toDateString } from '@/lib/checkin/week'

export async function GET() {
  const weekStart = toDateString(getWeekStart(new Date()))
  const checkin = await getOrCreateCheckin(weekStart)
  return NextResponse.json(checkin)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const weekStart = toDateString(getWeekStart(new Date()))
  await upsertCheckin(weekStart, {
    highlights: body.highlights,
    challenges: body.challenges,
    priorities: body.priorities,
    talking_points: body.talking_points,
    shoutouts: body.shoutouts,
  })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify the route works**

With the dev server running and `DATABASE_URL` set:

```bash
curl http://localhost:3000/api/checkin
```

Expected: JSON with the current week's check-in (created on first call), or a 500 if DB is not yet connected. Fix DB connection before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkin/route.ts
git commit -m "feat: add check-in GET/POST auto-save API route"
```

---

## Task 7: SectionEditor Component (Tiptap)

**Files:**
- Create: `src/components/checkin/SectionEditor.tsx`

- [ ] **Step 1: Implement SectionEditor**

```tsx
// src/components/checkin/SectionEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { useEffect } from 'react'

type Props = {
  icon: string
  label: string
  subtitle?: string
  initialContent: string | null
  onChange: (html: string) => void
  readOnly?: boolean
}

export default function SectionEditor({
  icon,
  label,
  subtitle,
  initialContent,
  onChange,
  readOnly = false,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit, BulletList, ListItem],
    content: initialContent ?? '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        style:
          'min-height: 80px; outline: none; padding: 12px; font-size: 14px; line-height: 1.75; color: #374151;',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external content updates (e.g. after AI polish)
  useEffect(() => {
    if (!editor || initialContent === null) return
    const current = editor.getHTML()
    if (current !== initialContent) {
      editor.commands.setContent(initialContent, false)
    }
  }, [initialContent, editor])

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #fde8d1',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid #fde8d1',
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: '#e11d48',
          }}
        >
          {label}
        </span>
        {subtitle && (
          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div
        style={{
          background: readOnly ? '#fffbf7' : '#fff',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/checkin/SectionEditor.tsx
git commit -m "feat: add SectionEditor Tiptap component"
```

---

## Task 8: CheckinForm Client Component

**Files:**
- Create: `src/components/checkin/CheckinForm.tsx`
- Create: `src/components/checkin/SendModal.tsx`

- [ ] **Step 1: Implement SendModal**

```tsx
// src/components/checkin/SendModal.tsx
type Props = {
  weekLabel: string
  onConfirm: () => void
  onCancel: () => void
  sending: boolean
}

export default function SendModal({ weekLabel, onConfirm, onCancel, sending }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '-0.3px',
              marginBottom: '8px',
            }}
          >
            Send your check-in?
          </h2>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>
            This will email your check-in for{' '}
            <strong style={{ color: '#111' }}>{weekLabel}</strong>
          </p>
        </div>

        <div
          style={{
            background: '#fafafa',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>To</span>
            <span>isabelle.andrews@resy.com</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>CC</span>
            <span>tj.voutier@resy.com</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#aaa', minWidth: '32px' }}>BCC</span>
            <span>tjvoutier@gmail.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            disabled={sending}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? 'Sending…' : 'Send now →'}
          </button>
          <button
            onClick={onCancel}
            disabled={sending}
            style={{
              background: '#f4f4f4',
              color: '#333',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement CheckinForm**

```tsx
// src/components/checkin/CheckinForm.tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SectionEditor from './SectionEditor'
import SendModal from './SendModal'
import ConfirmationScreen from './ConfirmationScreen'
import type { CheckIn } from '@/lib/checkin/db'

type Props = {
  checkin: CheckIn
  weekLabel: string
  nextWeekRange: string
}

type UnsplashImage = {
  url: string
  location: string
  photographer: string
}

export default function CheckinForm({ checkin, weekLabel, nextWeekRange }: Props) {
  const [highlights, setHighlights] = useState(checkin.highlights ?? '')
  const [challenges, setChallenges] = useState(checkin.challenges ?? '')
  const [priorities, setPriorities] = useState(checkin.priorities ?? '')
  const [talkingPoints, setTalkingPoints] = useState(checkin.talking_points ?? '')
  const [shoutouts, setShoutouts] = useState(checkin.shoutouts ?? '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [confirmationImage, setConfirmationImage] = useState<UnsplashImage | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const triggerSave = useCallback(
    (data: {
      highlights: string
      challenges: string
      priorities: string
      talking_points: string
      shoutouts: string
    }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      setSaveStatus('saving')
      saveTimer.current = setTimeout(async () => {
        await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 1500)
    },
    []
  )

  function makeUpdater(
    field: 'highlights' | 'challenges' | 'priorities' | 'talking_points' | 'shoutouts',
    setter: (v: string) => void
  ) {
    return (html: string) => {
      setter(html)
      triggerSave({
        highlights,
        challenges,
        priorities,
        talking_points: talkingPoints,
        shoutouts,
        [field]: html,
      })
    }
  }

  async function handlePolish() {
    setPolishing(true)
    try {
      const res = await fetch('/api/checkin/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlights, challenges, priorities, talking_points: talkingPoints, shoutouts }),
      })
      const data = await res.json()
      if (data.highlights) setHighlights(data.highlights)
      if (data.challenges) setChallenges(data.challenges)
      if (data.priorities) setPriorities(data.priorities)
      if (data.talking_points) setTalkingPoints(data.talking_points)
      if (data.shoutouts) setShoutouts(data.shoutouts)
      // Save the polished content immediately
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlights: data.highlights ?? highlights,
          challenges: data.challenges ?? challenges,
          priorities: data.priorities ?? priorities,
          talking_points: data.talking_points ?? talkingPoints,
          shoutouts: data.shoutouts ?? shoutouts,
        }),
      })
    } finally {
      setPolishing(false)
    }
  }

  async function handleSend() {
    setSending(true)
    try {
      const res = await fetch('/api/checkin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlights, challenges, priorities, talking_points: talkingPoints, shoutouts }),
      })
      const data = await res.json()
      setConfirmationImage(data.image ?? null)
      setShowModal(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionEditor
          icon="🏆"
          label="Highlights & Wins"
          initialContent={highlights}
          onChange={makeUpdater('highlights', setHighlights)}
        />
        <SectionEditor
          icon="⚡"
          label="Challenges"
          initialContent={challenges}
          onChange={makeUpdater('challenges', setChallenges)}
        />
        <SectionEditor
          icon="📅"
          label="Priorities for Next Week"
          subtitle={nextWeekRange}
          initialContent={priorities}
          onChange={makeUpdater('priorities', setPriorities)}
        />
        <SectionEditor
          icon="🗣️"
          label="Talking Points for Next 1:1"
          initialContent={talkingPoints}
          onChange={makeUpdater('talking_points', setTalkingPoints)}
        />
        <SectionEditor
          icon="👏"
          label="Shoutouts & Appreciation"
          initialContent={shoutouts}
          onChange={makeUpdater('shoutouts', setShoutouts)}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#aaa' }}>
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : ''}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePolish}
              disabled={polishing}
              style={{
                background: '#fff',
                border: '1.5px solid #fde8d1',
                color: polishing ? '#aaa' : '#e11d48',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: polishing ? 'not-allowed' : 'pointer',
              }}
            >
              {polishing ? '✨ Polishing…' : '✨ Polish with AI'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Send Check-In →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <SendModal
          weekLabel={weekLabel}
          onConfirm={handleSend}
          onCancel={() => setShowModal(false)}
          sending={sending}
        />
      )}

      {confirmationImage && (
        <ConfirmationScreen
          weekLabel={weekLabel}
          image={confirmationImage}
          onDone={() => router.refresh()}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/checkin/CheckinForm.tsx src/components/checkin/SendModal.tsx
git commit -m "feat: add CheckinForm and SendModal components"
```

---

## Task 9: ConfirmationScreen + SubmittedView Components

**Files:**
- Create: `src/components/checkin/ConfirmationScreen.tsx`
- Create: `src/components/checkin/SubmittedView.tsx`

- [ ] **Step 1: Implement ConfirmationScreen**

```tsx
// src/components/checkin/ConfirmationScreen.tsx
type UnsplashImage = {
  url: string
  location: string
  photographer: string
}

type Props = {
  weekLabel: string
  image: UnsplashImage
  onDone: () => void
}

export default function ConfirmationScreen({ weekLabel, image, onDone }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero image */}
      <div style={{ position: 'relative', flex: '0 0 55vh', overflow: 'hidden' }}>
        <img
          src={image.url}
          alt={image.location}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              marginBottom: '4px',
            }}
          >
            Check-in sent!
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>{weekLabel}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {image.location} · Photo by {image.photographer} on Unsplash
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
          Your check-in was emailed to <strong>Isabelle</strong> and a copy sent to you.
          <br />
          <span style={{ color: '#aaa', fontSize: '12px' }}>
            isabelle.andrews@resy.com · cc: tj.voutier@resy.com
          </span>
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {['🏆 Highlights', '⚡ Challenges', '📅 Priorities', '🗣️ Talking Points', '👏 Shoutouts'].map(
            (s) => (
              <span
                key={s}
                style={{
                  background: '#fdf2f8',
                  border: '1px solid #fde8d1',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  color: '#e11d48',
                }}
              >
                {s}
              </span>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="/history"
            style={{
              flex: 1,
              background: '#f4f4f4',
              borderRadius: '10px',
              padding: '13px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#333',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            View History
          </a>
          <button
            onClick={onDone}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #e11d48, #f59e0b)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement SubmittedView**

```tsx
// src/components/checkin/SubmittedView.tsx
import SectionEditor from './SectionEditor'
import type { CheckIn } from '@/lib/checkin/db'

type Props = {
  checkin: CheckIn
  weekLabel: string
  nextWeekRange: string
  submittedAt?: string | null
}

export default function SubmittedView({ checkin, weekLabel, nextWeekRange, submittedAt }: Props) {
  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {formattedDate && (
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: '6px',
            background: '#fdf2f8',
            border: '1px solid #fde8d1',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            color: '#e11d48',
            fontWeight: '500',
          }}
        >
          ✓ Submitted {formattedDate}
        </div>
      )}

      <SectionEditor icon="🏆" label="Highlights & Wins" initialContent={checkin.highlights} onChange={() => {}} readOnly />
      <SectionEditor icon="⚡" label="Challenges" initialContent={checkin.challenges} onChange={() => {}} readOnly />
      <SectionEditor icon="📅" label="Priorities for Next Week" subtitle={nextWeekRange} initialContent={checkin.priorities} onChange={() => {}} readOnly />
      <SectionEditor icon="🗣️" label="Talking Points for Next 1:1" initialContent={checkin.talking_points} onChange={() => {}} readOnly />
      <SectionEditor icon="👏" label="Shoutouts & Appreciation" initialContent={checkin.shoutouts} onChange={() => {}} readOnly />

      <p style={{ textAlign: 'center', fontSize: '13px', color: '#aaa', paddingTop: '8px' }}>
        Your check-in for this week was sent. Come back Monday for next week's.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/checkin/ConfirmationScreen.tsx src/components/checkin/SubmittedView.tsx
git commit -m "feat: add ConfirmationScreen and SubmittedView components"
```

---

## Task 10: CheckinLayout Header Component + /checkin Page

**Files:**
- Create: `src/components/checkin/CheckinLayout.tsx`
- Create: `src/app/(checkin)/checkin/page.tsx`

- [ ] **Step 1: Implement CheckinLayout (gradient header)**

```tsx
// src/components/checkin/CheckinLayout.tsx
import Link from 'next/link'

type Props = {
  weekLabel: string
  saveStatus?: string
  children: React.ReactNode
}

export default function CheckinLayout({ weekLabel, children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#fffbf7' }}>
      {/* Gradient header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
          padding: '24px 24px 28px',
          color: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '10px',
                letterSpacing: '0.5px',
              }}
            >
              ✦ Weekly Check-In
            </div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                marginBottom: '4px',
              }}
            >
              {weekLabel}
            </h1>
          </div>
          <Link
            href="/history"
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              textDecoration: 'none',
              paddingTop: '4px',
            }}
          >
            History →
          </Link>
        </div>
      </div>

      {/* Page body */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '24px 24px 48px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement /checkin page**

```tsx
// src/app/(checkin)/checkin/page.tsx
import { getOrCreateCheckin } from '@/lib/checkin/db'
import { getWeekStart, formatWeekRange, formatNextWeekRange, isEditable, toDateString } from '@/lib/checkin/week'
import CheckinLayout from '@/components/checkin/CheckinLayout'
import CheckinForm from '@/components/checkin/CheckinForm'
import SubmittedView from '@/components/checkin/SubmittedView'

export default async function CheckinPage() {
  const weekStart = getWeekStart(new Date())
  const weekStartStr = toDateString(weekStart)
  const checkin = await getOrCreateCheckin(weekStartStr)
  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)
  const editable = isEditable(weekStart)

  return (
    <CheckinLayout weekLabel={weekLabel}>
      {checkin.status === 'submitted' || !editable ? (
        <SubmittedView
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
          submittedAt={checkin.submitted_at}
        />
      ) : (
        <CheckinForm
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
        />
      )}
    </CheckinLayout>
  )
}
```

- [ ] **Step 3: Visit the page**

With the dev server running, open `http://localhost:3000/checkin` (after logging in at `/login`). Confirm:
- Gradient header with "Weekly Check-In" badge and the current week label
- Five section editors with their labels, icons, and the Priorities subtitle showing next week's date range
- "Polish with AI" and "Send Check-In →" buttons at the bottom

- [ ] **Step 4: Commit**

```bash
git add src/components/checkin/CheckinLayout.tsx src/app/\(checkin\)/checkin/page.tsx
git commit -m "feat: add CheckinLayout and /checkin page"
```

---

## Task 11: Email Template + Unsplash Fetch

**Files:**
- Create: `src/lib/checkin/email.ts`
- Create: `src/lib/checkin/unsplash.ts`
- Create: `src/lib/checkin/htmlUtils.ts`

- [ ] **Step 1: Implement htmlUtils (strip tags for AI input)**

```ts
// src/lib/checkin/htmlUtils.ts

// Convert <ul><li>Item</li></ul> to "- Item\n- Item\n"
export function htmlToText(html: string | null): string {
  if (!html) return ''
  return html
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// Convert "- Item\n- Item\n" to <ul><li>Item</li><li>Item</li></ul>
export function textToHtml(text: string | null): string {
  if (!text) return ''
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const items = lines.map((l) => `<li>${l.replace(/^[-•]\s*/, '')}</li>`).join('')
  return `<ul>${items}</ul>`
}
```

- [ ] **Step 2: Implement Unsplash fetch**

```ts
// src/lib/checkin/unsplash.ts

const SEARCH_TERMS = [
  'city landmark',
  'architecture',
  'national park',
  'mountain landscape',
  'ancient ruins',
  'city skyline',
  'natural wonder',
]

type UnsplashImage = {
  url: string
  location: string
  photographer: string
}

export async function fetchConfirmationImage(): Promise<UnsplashImage> {
  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)]
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    return { url: '', location: 'Unknown', photographer: 'Unknown' }
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(term)}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 0 },
      }
    )
    if (!res.ok) throw new Error('Unsplash error')
    const data = await res.json()
    return {
      url: data.urls?.regular ?? '',
      location: data.location?.name ?? term,
      photographer: data.user?.name ?? 'Unknown',
    }
  } catch {
    return { url: '', location: 'Earth', photographer: 'Unknown' }
  }
}
```

- [ ] **Step 3: Implement email template and sending**

```ts
// src/lib/checkin/email.ts
import { Resend } from 'resend'
import type { CheckIn } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

function section(icon: string, title: string, html: string | null, subtitle?: string): string {
  if (!html) return ''
  return `
    <div style="margin-bottom:28px">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #fde8d1">
        <span style="font-size:16px">${icon}</span>
        <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e11d48">${title}</span>
        ${subtitle ? `<span style="font-size:12px;color:#f59e0b;font-weight:600">${subtitle}</span>` : ''}
      </div>
      <div style="font-size:14px;color:#374151;line-height:1.75">${html}</div>
    </div>
  `
}

export function buildEmailHtml(checkin: CheckIn, nextWeekRange: string, weekLabel: string): string {
  const submittedDate = checkin.submitted_at
    ? new Date(checkin.submitted_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,-apple-system,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #fde8d1">
    <div style="background:linear-gradient(135deg,#e11d48 0%,#f59e0b 100%);padding:32px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.75);font-weight:600;margin-bottom:8px">Weekly Check-In</div>
      <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:4px">${weekLabel}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75)">From Tj Voutier · Submitted ${submittedDate}</div>
    </div>
    <div style="padding:28px 32px">
      ${section('🏆', 'Highlights &amp; Wins', checkin.highlights)}
      ${section('⚡', 'Challenges', checkin.challenges)}
      ${section('📅', 'Priorities for Next Week', checkin.priorities, nextWeekRange)}
      ${section('🗣️', 'Talking Points for Next 1:1', checkin.talking_points)}
      ${section('👏', 'Shoutouts &amp; Appreciation', checkin.shoutouts)}
    </div>
    <div style="background:#fdf2f8;border-top:1px solid #fde8d1;padding:16px 32px;text-align:center;font-size:11px;color:#aaa;line-height:1.6">
      Tj Voutier · Product, Resy
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function sendCheckinEmail(
  checkin: CheckIn,
  nextWeekRange: string,
  weekLabel: string,
  subject: string
): Promise<void> {
  const html = buildEmailHtml(checkin, nextWeekRange, weekLabel)
  await resend.emails.send({
    from: 'Tj Voutier <tjvoutier@gmail.com>',
    to: 'isabelle.andrews@resy.com',
    cc: 'tj.voutier@resy.com',
    bcc: 'tjvoutier@gmail.com',
    subject,
    html,
  })
}

export async function sendReminderEmail(appUrl: string, message: string): Promise<void> {
  await resend.emails.send({
    from: 'Weekly Check-In <tjvoutier@gmail.com>',
    to: 'tjvoutier@gmail.com',
    subject: 'Weekly Check-In Reminder',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:32px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #fde8d1">
        <div style="font-size:24px;margin-bottom:16px">📝</div>
        <p style="font-size:16px;color:#111;margin-bottom:16px">${message}</p>
        <a href="${appUrl}/checkin" style="display:inline-block;background:linear-gradient(135deg,#e11d48,#f59e0b);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
          Open Check-In →
        </a>
      </div>
    `,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/checkin/email.ts src/lib/checkin/unsplash.ts src/lib/checkin/htmlUtils.ts
git commit -m "feat: add email template, Unsplash fetch, and HTML utilities"
```

---

## Task 12: Submit API Route

**Files:**
- Create: `src/app/api/checkin/submit/route.ts`

- [ ] **Step 1: Implement submit route**

```ts
// src/app/api/checkin/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  getOrCreateCheckin,
  upsertCheckin,
  submitCheckin,
  getCheckin,
} from '@/lib/checkin/db'
import { sendCheckinEmail } from '@/lib/checkin/email'
import { fetchConfirmationImage } from '@/lib/checkin/unsplash'
import { getWeekStart, formatWeekRange, formatNextWeekRange, toDateString } from '@/lib/checkin/week'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const weekStart = getWeekStart(new Date())
  const weekStartStr = toDateString(weekStart)

  // Save final content before submitting
  await upsertCheckin(weekStartStr, {
    highlights: body.highlights,
    challenges: body.challenges,
    priorities: body.priorities,
    talking_points: body.talking_points,
    shoutouts: body.shoutouts,
  })

  // Mark as submitted
  await submitCheckin(weekStartStr)

  // Fetch updated record for email
  const checkin = await getCheckin(weekStartStr)
  if (!checkin) {
    return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
  }

  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)
  const subject = `Weekly Check-In — ${weekLabel}`

  // Send email and fetch image in parallel
  const [, image] = await Promise.all([
    sendCheckinEmail(checkin, nextWeekRange, weekLabel, subject),
    fetchConfirmationImage(),
  ])

  return NextResponse.json({ ok: true, image })
}
```

- [ ] **Step 2: Test the submit flow end-to-end**

With dev server running and Resend + Unsplash keys set:
1. Open `http://localhost:3000/checkin`
2. Type some content in each section
3. Click "Send Check-In →"
4. Confirm in the modal
5. Verify: ConfirmationScreen appears with a landmark image, email arrives at `tjvoutier@gmail.com` (BCC copy)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkin/submit/route.ts
git commit -m "feat: add check-in submit API route with email + Unsplash"
```

---

## Task 13: AI Polish API Route

**Files:**
- Create: `src/app/api/checkin/polish/route.ts`

- [ ] **Step 1: Implement the polish route**

```ts
// src/app/api/checkin/polish/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { htmlToText, textToHtml } from '@/lib/checkin/htmlUtils'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { highlights, challenges, priorities, talking_points, shoutouts } = body

  const input = `
Highlights & Wins:
${htmlToText(highlights) || '(empty)'}

Challenges:
${htmlToText(challenges) || '(empty)'}

Priorities for Next Week:
${htmlToText(priorities) || '(empty)'}

Talking Points for Next 1:1:
${htmlToText(talking_points) || '(empty)'}

Shoutouts & Appreciation:
${htmlToText(shoutouts) || '(empty)'}
`.trim()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a professional writing assistant helping a product manager polish their weekly check-in notes. 
Rewrite the content to be more professional, clear, and articulate while:
- Maintaining the author's first-person voice and casual-professional tone
- Keeping all factual details, names, and specifics intact
- Using concise, direct language — avoid filler words
- Returning bullet points as "- item" format (one per line)

Return a JSON object with exactly these keys: highlights, challenges, priorities, talking_points, shoutouts.
Each value must be a string of bullet points in "- item\\n- item" format (or empty string if input was empty).
Return ONLY the JSON — no other text.`,
    messages: [{ role: 'user', content: input }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response' }, { status: 500 })
  }

  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(content.text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  return NextResponse.json({
    highlights: textToHtml(parsed.highlights),
    challenges: textToHtml(parsed.challenges),
    priorities: textToHtml(parsed.priorities),
    talking_points: textToHtml(parsed.talking_points),
    shoutouts: textToHtml(parsed.shoutouts),
  })
}
```

- [ ] **Step 2: Test the polish button**

1. Open `/checkin` with some rough notes typed in
2. Click "✨ Polish with AI"
3. Confirm: button shows "✨ Polishing…", then content updates in all sections, button re-enables

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkin/polish/route.ts
git commit -m "feat: add AI polish API route via Claude"
```

---

## Task 14: History Pages

**Files:**
- Create: `src/app/(checkin)/history/page.tsx`
- Create: `src/app/(checkin)/history/[weekId]/page.tsx`

- [ ] **Step 1: Implement history list page**

```tsx
// src/app/(checkin)/history/page.tsx
import Link from 'next/link'
import { listSubmittedCheckins } from '@/lib/checkin/db'
import { formatWeekRange } from '@/lib/checkin/week'

export default async function HistoryPage() {
  const checkins = await listSubmittedCheckins()

  return (
    <div style={{ minHeight: '100vh', background: '#fffbf7' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
          padding: '24px 24px 28px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.75, marginBottom: '8px' }}>
              ✦ Weekly Check-In
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Past Check-Ins
            </h1>
          </div>
          <Link href="/checkin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>
            ← This week
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        {checkins.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '48px 0', fontSize: '14px' }}>
            No check-ins submitted yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checkins.map((c) => {
              const weekStart = new Date(c.week_start + 'T00:00:00Z')
              const submittedDate = c.submitted_at
                ? new Date(c.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : ''
              return (
                <Link
                  key={c.week_start}
                  href={`/history/${c.week_start}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #fde8d1',
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>
                        Week of {formatWeekRange(weekStart)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        Submitted {submittedDate}
                      </div>
                    </div>
                    <span style={{ color: '#e11d48', fontSize: '13px' }}>View →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement history detail page**

```tsx
// src/app/(checkin)/history/[weekId]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCheckin } from '@/lib/checkin/db'
import { formatWeekRange, formatNextWeekRange } from '@/lib/checkin/week'
import SubmittedView from '@/components/checkin/SubmittedView'

type Props = {
  params: Promise<{ weekId: string }>
}

export default async function HistoryDetailPage({ params }: Props) {
  const { weekId } = await params
  const checkin = await getCheckin(weekId)

  if (!checkin || checkin.status !== 'submitted') notFound()

  const weekStart = new Date(weekId + 'T00:00:00Z')
  const weekLabel = `Week of ${formatWeekRange(weekStart)}`
  const nextWeekRange = formatNextWeekRange(weekStart)

  return (
    <div style={{ minHeight: '100vh', background: '#fffbf7' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
          padding: '24px 24px 28px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.75, marginBottom: '8px' }}>
              ✦ Past Check-In
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {weekLabel}
            </h1>
          </div>
          <Link href="/history" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none' }}>
            ← History
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 24px 48px' }}>
        <SubmittedView
          checkin={checkin}
          weekLabel={weekLabel}
          nextWeekRange={nextWeekRange}
          submittedAt={checkin.submitted_at}
        />
      </div>
    </div>
  )
}
```

> **Note:** In Next.js 16, route params are a `Promise` — always `await params`.

- [ ] **Step 3: Verify history pages**

1. Submit a check-in via the form
2. Navigate to `http://localhost:3000/history`
3. Confirm: list shows the submitted check-in with week label and date
4. Click "View →" — confirm the read-only detail view loads correctly

- [ ] **Step 4: Commit**

```bash
git add src/app/\(checkin\)/history/page.tsx src/app/\(checkin\)/history/\[weekId\]/page.tsx
git commit -m "feat: add history list and detail pages"
```

---

## Task 15: Cron Reminder Routes + vercel.json

**Files:**
- Create: `src/app/api/cron/friday-reminder/route.ts`
- Create: `src/app/api/cron/sunday-reminder/route.ts`
- Create/modify: `vercel.json`

- [ ] **Step 1: Implement Friday reminder route**

```ts
// src/app/api/cron/friday-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCheckin } from '@/lib/checkin/db'
import { sendReminderEmail } from '@/lib/checkin/email'
import { getWeekStart, toDateString } from '@/lib/checkin/week'

export async function GET(request: NextRequest) {
  // Verify Vercel cron authorization header
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = toDateString(getWeekStart(new Date()))
  const checkin = await getOrCreateCheckin(weekStart)

  if (checkin.status === 'submitted') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  await sendReminderEmail(
    appUrl,
    "Don't forget to submit your weekly check-in before end of week."
  )

  return NextResponse.json({ ok: true, sent: true })
}
```

- [ ] **Step 2: Implement Sunday reminder route**

```ts
// src/app/api/cron/sunday-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateCheckin } from '@/lib/checkin/db'
import { sendReminderEmail } from '@/lib/checkin/email'
import { getWeekStart, toDateString } from '@/lib/checkin/week'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = toDateString(getWeekStart(new Date()))
  const checkin = await getOrCreateCheckin(weekStart)

  if (checkin.status === 'submitted') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  await sendReminderEmail(
    appUrl,
    "Your weekly check-in hasn't been submitted yet — it closes Monday at midnight ET."
  )

  return NextResponse.json({ ok: true, sent: true })
}
```

- [ ] **Step 3: Create vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/cron/friday-reminder",
      "schedule": "0 20 * * 5"
    },
    {
      "path": "/api/cron/sunday-reminder",
      "schedule": "0 23 * * 0"
    }
  ]
}
```

- [ ] **Step 4: Add CRON_SECRET to env**

Add to `.env.local`:
```
CRON_SECRET=<generate a random string, e.g. openssl rand -hex 32>
```

Add to Vercel project env vars in the dashboard.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cron/ vercel.json
git commit -m "feat: add cron reminder routes and vercel.json schedule"
```

---

## Task 16: Update .gitignore + Final Checks

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

Add to `.gitignore`:
```
.superpowers/
.env.local
```

Verify `.env.local` is already excluded (it should be from Create Next App). If `.superpowers/` is not present, add it.

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (week utils + DB type test).

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: successful build with no TypeScript errors. Fix any type errors before deploying.

- [ ] **Step 4: Verify redirect from /login when already authenticated**

1. Log in at `/login` → redirected to `/checkin`
2. Navigate back to `/login` — it should redirect to `/checkin` (add this logic to the login page: check for existing session cookie on mount and redirect if present)

To add that redirect, update `src/app/(checkin)/login/page.tsx` — add at the top of the component:

```tsx
// At the top of LoginPage, after the state declarations:
useEffect(() => {
  // If somehow we land on /login while authenticated, go to /checkin
  // The middleware doesn't protect /login itself, so this is the fallback
}, [router])
```

Actually this is hard to do client-side without the cookie value. Simpler: add a server component wrapper or just let the middleware handle it. Update `src/middleware.ts` to also redirect `/login` → `/checkin` if the user is already authenticated:

```ts
// In middleware, add before the protected check:
if (pathname === '/login' && token === expectedToken()) {
  return NextResponse.redirect(new URL('/checkin', request.url))
}
```

- [ ] **Step 5: Final commit**

```bash
git add .gitignore src/middleware.ts
git commit -m "feat: finalize auth redirect and clean up gitignore"
```

---

## Task 17: Deploy to Vercel

- [ ] **Step 1: Set environment variables in Vercel dashboard**

Go to your Vercel project → Settings → Environment Variables. Add:
- `CHECKIN_PASSWORD` = `MyCheckin`
- `DATABASE_URL` = (from Vercel Postgres, already linked)
- `RESEND_API_KEY` = your Resend API key
- `ANTHROPIC_API_KEY` = your Anthropic API key
- `UNSPLASH_ACCESS_KEY` = your Unsplash API key
- `NEXT_PUBLIC_APP_URL` = `https://<your-vercel-url>`
- `CRON_SECRET` = (same random string from .env.local)

- [ ] **Step 2: Verify Resend sender domain**

In the Resend dashboard, verify `tjvoutier@gmail.com` as a sender. Follow the email verification link Resend sends.

- [ ] **Step 3: Push to main and deploy**

```bash
git push origin claude/wizardly-elbakyan-b37a3d
```

Merge the PR, or deploy directly from the branch. Vercel auto-deploys on push.

- [ ] **Step 4: Smoke test on production**

1. Visit `https://<app-url>/checkin` → redirected to `/login`
2. Enter `MyCheckin` → redirected to `/checkin`
3. Add content to all 5 sections → confirm auto-save fires ("Saved" appears)
4. Click "✨ Polish with AI" → content updates
5. Click "Send Check-In →", confirm modal → email arrives at `tjvoutier@gmail.com`
6. Confirmation screen with Unsplash image appears
7. Visit `/history` → submitted check-in listed

---

## Environment Variables Summary

| Variable | Where |
|---|---|
| `CHECKIN_PASSWORD` | Vercel + `.env.local` |
| `DATABASE_URL` | Vercel (linked automatically from Vercel Postgres) |
| `RESEND_API_KEY` | Vercel + `.env.local` |
| `ANTHROPIC_API_KEY` | Vercel + `.env.local` |
| `UNSPLASH_ACCESS_KEY` | Vercel + `.env.local` |
| `NEXT_PUBLIC_APP_URL` | Vercel + `.env.local` |
| `CRON_SECRET` | Vercel + `.env.local` |
