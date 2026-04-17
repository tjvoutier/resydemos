# Weekly Check-In App — Design Spec

**Date:** 2026-04-17  
**Author:** Tj Voutier  
**Status:** Approved for implementation

---

## Overview

A personal web app for Tj to structure and send weekly check-ins to his manager. Built on Next.js, hosted on Vercel, with a Postgres database for cross-device persistence. The primary goal is to increase visibility into Tj's work by making it easy to capture highlights, challenges, priorities, and shoutouts each week — then send them as a polished email with one click.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (already in repo) |
| Styling | Tailwind CSS v4 + custom Rose/Amber theme |
| Rich text editor | Tiptap |
| Database | Vercel Postgres (Neon) |
| Email delivery | Resend |
| AI polishing | Anthropic Claude API (`claude-sonnet-4-6`) |
| Image source | Unsplash API (confirmation screen) |
| Hosting | Vercel |

---

## Authentication

Simple password gate via Next.js middleware. Any request to `/checkin`, `/history`, or `/history/[weekId]` that lacks a valid session cookie is redirected to `/`.

- **Password:** stored as an env var (`CHECKIN_PASSWORD`)
- **Session:** set a `checkin_session` cookie (httpOnly, secure, 30-day expiry) on successful login
- No user accounts, no OAuth — single-user tool

---

## Routes

| Route | Description |
|---|---|
| `/` | Password gate. Redirects to `/checkin` if already authenticated. |
| `/checkin` | Current week's check-in form (main screen) |
| `/history` | List of all past submitted check-ins |
| `/history/[weekId]` | Read-only view of a past check-in |

---

## Data Model

Single table in Vercel Postgres:

```sql
CREATE TABLE check_ins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  DATE NOT NULL UNIQUE,  -- always a Monday
  highlights  TEXT,                  -- Tiptap JSON string
  challenges  TEXT,                  -- Tiptap JSON string
  priorities      TEXT,              -- Tiptap JSON string
  talking_points  TEXT,              -- Tiptap JSON string
  shoutouts       TEXT,              -- Tiptap JSON string
  status      TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'submitted'
  submitted_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`week_start` is the canonical identifier for a week — always the Monday of that week. Used as the URL slug for `/history/[weekId]` (formatted as `YYYY-MM-DD`).

---

## Week Logic

- A **week** spans Monday through Sunday. The check-in covers work done Mon–Fri.
- On first visit each week, the app auto-creates a `draft` record for the current `week_start`.
- The check-in remains **editable until end of day Monday** of the following week (midnight ET). After that it is locked (read-only).
- The **Priorities** section header automatically displays the next week's Mon–Fri date range (e.g., `04/21 – 04/25`) — the user fills in bullets without per-day labels.
- Auto-save fires on every content change, debounced 1.5 seconds. A subtle "Saved" indicator confirms persistence.

---

## UI Design

**Design system:** Rose/Amber gradient palette. Warm light-mode body (`#fffbf7`), gradient header (`#e11d48` → `#f59e0b`), section accent color `#e11d48`, Inter font.

### Screen 1 — Password Gate (`/`)
- Centered card: app name, password input, "Continue →" button.
- On success: set session cookie, redirect to `/checkin`.

### Screen 2 — Check-In Form (`/checkin`)
- **Header:** gradient banner showing "Weekly Check-In", current week date range (e.g., `Week of Apr 14–18, 2026`), auto-save status, and a "History →" link.
- **Four sections** (each a Tiptap rich text editor):
  1. 🏆 **Highlights & Wins**
  2. ⚡ **Challenges**
  3. 📅 **Priorities for Next Week** — header shows next week's date range (`04/21 – 04/25`)
  4. 🗣️ **Talking Points for Next 1:1**
  5. 👏 **Shoutouts & Appreciation**
- **Two action buttons** (bottom right):
  - `✨ Polish with AI` — secondary style, no confirmation, triggers AI rewrite in-place
  - `Send Check-In →` — primary gradient button, opens confirmation modal

### Screen 3 — Send Confirmation Modal
- Dark overlay, blurred form behind.
- Shows: week being submitted, To/CC/BCC recipients.
- Two buttons: `Send now →` (primary) and `Cancel`.

### Screen 4 — Post-Submit Confirmation (`/checkin` after send)
- Full-bleed hero image from Unsplash (random landmark or nature scene).
- Gradient overlay with success message and week label.
- Image caption with location + photographer credit (Unsplash attribution requirement).
- Body: recipient summary, section chips, `View History` + `Done` buttons.
- `Done` navigates to `/checkin`, which shows the submitted state (below).

### Screen 4b — Submitted State (`/checkin` when current week already submitted)
- Same header banner, but shows "Submitted ✓" badge and the submission timestamp.
- All four sections rendered read-only (no editors).
- No action buttons. A "View History" link in the header.
- Message: "Your check-in for this week was sent. Come back Monday for next week's."

### Screen 5 — History (`/history`)
- List of submitted check-ins, reverse-chronological.
- Each row: week date range, submitted date, link to full view.

### Screen 6 — Past Check-In (`/history/[weekId]`)
- Read-only rendered view of all four sections.
- Same visual design as the form, but non-editable.

---

## AI Polish Feature

- Triggered by `✨ Polish with AI` button — **no confirmation dialog**.
- Sends all four sections' plain-text content to `claude-sonnet-4-6` in a single API call.
- System prompt instructs Claude to: rewrite in first person, maintain Tj's voice, improve clarity and articulation, keep all factual content intact.
- Response replaces the Tiptap editor content in-place.
- Undo available via native editor undo (Cmd+Z / Ctrl+Z).
- Button shows a loading spinner while the request is in flight; disabled to prevent double-submit.

---

## Email

**Sent via Resend** from `tjvoutier@gmail.com` (verified sender).

| Field | Value |
|---|---|
| From | `Tj Voutier <tjvoutier@gmail.com>` |
| To | `isabelle.andrews@resy.com` |
| CC | `tj.voutier@resy.com` |
| BCC | `tjvoutier@gmail.com` |
| Subject | `Weekly Check-In — Week of [Mon] – [Fri], [YYYY]` |

**Email body** (HTML, Rose/Amber branded):
- Gradient header banner with week label and submission timestamp
- Four sections: Highlights, Challenges, Priorities, Shoutouts
- All sections rendered as bulleted lists
- Priorities section header includes the next week's date range inline (`04/21 – 04/25`)
- Talking Points section included between Priorities and Shoutouts
- Footer: `Tj Voutier · Product, Resy`

---

## Reminder Emails (Vercel Cron Jobs)

Both reminders only fire if the current week's check-in has **not** been submitted. If already submitted, the cron is a no-op.

| Trigger | Time | Recipient | Message |
|---|---|---|---|
| Friday reminder | 3:00 PM ET every Friday | `tjvoutier@gmail.com` | "Don't forget to submit your weekly check-in before EOW" + link |
| Sunday reminder | 6:00 PM ET every Sunday | `tjvoutier@gmail.com` | "Your check-in hasn't been submitted yet — closes Monday midnight" + link |

Both emails include a direct link to `/checkin`.

Cron schedules in `vercel.json`:
- Friday 3pm ET: `0 20 * * 5` (UTC)
- Sunday 6pm ET: `0 23 * * 0` (UTC)

---

## Environment Variables

| Variable | Description |
|---|---|
| `CHECKIN_PASSWORD` | App login password (`MyCheckin`) |
| `DATABASE_URL` | Vercel Postgres connection string |
| `RESEND_API_KEY` | Resend API key |
| `ANTHROPIC_API_KEY` | Claude API key |
| `UNSPLASH_ACCESS_KEY` | Unsplash API key (free tier, 50 req/hr) |
| `NEXT_PUBLIC_APP_URL` | Full app URL for reminder email links (e.g., `https://checkin.vercel.app`) |

---

## Unsplash Image Pool

On submission, fetch a random photo from one of these search terms (rotated randomly):
- `city landmark`
- `architecture`
- `national park`
- `mountain landscape`
- `ancient ruins`
- `city skyline`
- `natural wonder`

Display the photo's `location.name` and `user.name` as the caption for attribution.

---

## Out of Scope

- Multiple users / team check-ins
- Editing a submitted check-in (locked on submit)
- Mobile app (responsive web covers the iOS use case via browser or PWA)
- Slack integration
- Markdown export
