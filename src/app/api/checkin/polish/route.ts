import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { htmlToText, textToHtml } from '@/lib/checkin/htmlUtils'

let _client: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
    _client = new Anthropic({ apiKey: key })
  }
  return _client
}

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

  const message = await getAnthropic().messages.create({
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

  let rawText = content.text.trim()
  const fenceMatch = rawText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fenceMatch) rawText = fenceMatch[1]

  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(rawText)
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
