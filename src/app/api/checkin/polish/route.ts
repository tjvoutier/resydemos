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
