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

  const stateRef = useRef({ highlights, challenges, priorities, talkingPoints, shoutouts })
  stateRef.current = { highlights, challenges, priorities, talkingPoints, shoutouts }

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
      const s = stateRef.current
      triggerSave({
        highlights: s.highlights,
        challenges: s.challenges,
        priorities: s.priorities,
        talking_points: s.talkingPoints,
        shoutouts: s.shoutouts,
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
