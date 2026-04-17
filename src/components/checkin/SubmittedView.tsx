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
