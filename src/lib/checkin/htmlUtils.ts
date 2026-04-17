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
