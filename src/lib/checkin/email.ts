import { Resend } from 'resend'
import type { CheckIn } from './db'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

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
  await getResend().emails.send({
    from: 'Tj Voutier <tjvoutier@gmail.com>',
    to: 'isabelle.andrews@resy.com',
    cc: 'tj.voutier@resy.com',
    bcc: 'tjvoutier@gmail.com',
    subject,
    html,
  })
}

export async function sendReminderEmail(appUrl: string, message: string): Promise<void> {
  await getResend().emails.send({
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
