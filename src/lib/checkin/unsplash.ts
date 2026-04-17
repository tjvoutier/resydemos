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
