const ANILIST_API = 'https://graphql.anilist.co'

interface AniListMedia {
  id: number
  title: { romaji: string; english: string | null; native: string | null }
  description: string | null
  coverImage: { extraLarge: string | null; large: string | null }
  bannerImage: string | null
  genres: string[]
  studios: { nodes: { name: string }[] }
  averageScore: number | null
  popularity: number
  favourites: number
  trending: number
  episodes: number | null
  status: string | null
  season: string | null
  seasonYear: number | null
  format: string | null
  duration: number | null
  characters: { nodes: { name: { full: string; native: string | null }; image: { large: string | null } }[] }
  relations: { edges: { node: { id: number }; relationType: string }[] }
  recommendations: { nodes: { mediaRecommendation: { id: number } | null }[] }
  trailer: { id: string; site: string } | null
}

interface AniListResponse {
  data: {
    Media?: AniListMedia
    Page?: {
      media: AniListMedia[]
      pageInfo: { total: number; hasNextPage: boolean }
    }
  }
}

async function anilistFetch(query: string, variables: Record<string, unknown>): Promise<AniListResponse> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    // Rate limited, wait and retry
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return anilistFetch(query, variables)
    }
    throw new Error(`AniList API error: ${response.status}`)
  }

  return response.json()
}

const SEARCH_QUERY = `
query ($search: String, $type: MediaType) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: $type, sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      description
      coverImage { extraLarge large }
      bannerImage
      genres
      studios(isMain: true) { nodes { name } }
      averageScore popularity favourites trending
      episodes status season seasonYear format duration
      characters(sort: ROLE, perPage: 10) {
        nodes { name { full native } image { large } }
      }
      relations { edges { node { id } relationType } }
      recommendations(perPage: 5) {
        nodes { mediaRecommendation { id } }
      }
      trailer { id site }
    }
  }
}
`

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    description
    coverImage { extraLarge large }
    bannerImage
    genres
    studios(isMain: true) { nodes { name } }
    averageScore popularity favourites trending
    episodes status season seasonYear format duration
    characters(sort: ROLE, perPage: 15) {
      nodes { name { full native } image { large } }
    }
    relations { edges { node { id } relationType } }
    recommendations(perPage: 5) {
      nodes { mediaRecommendation { id } }
    }
    trailer { id site }
  }
}
`

const TRENDING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage }
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title { romaji english native }
      description
      coverImage { extraLarge large }
      bannerImage
      genres
      studios(isMain: true) { nodes { name } }
      averageScore popularity favourites trending
      episodes status season seasonYear format duration
      characters(sort: ROLE, perPage: 10) {
        nodes { name { full native } image { large } }
      }
      trailer { id site }
    }
  }
}
`

const BATCH_QUERY = `
query ($ids: [Int]) {
  Page(page: 1, perPage: 50) {
    media(id_in: $ids, type: ANIME) {
      id
      title { romaji english native }
      description
      coverImage { extraLarge large }
      bannerImage
      genres
      studios(isMain: true) { nodes { name } }
      averageScore popularity favourites trending
      episodes status season seasonYear format duration
      characters(sort: ROLE, perPage: 10) {
        nodes { name { full native } image { large } }
      }
      relations { edges { node { id } relationType } }
      recommendations(perPage: 5) {
        nodes { mediaRecommendation { id } }
      }
      trailer { id site }
    }
  }
}
`

export async function searchAniList(search: string): Promise<AniListMedia[]> {
  const response = await anilistFetch(SEARCH_QUERY, { search, type: 'ANIME' })
  return response.data.Page?.media || []
}

export async function getAniListAnime(id: number): Promise<AniListMedia | null> {
  const response = await anilistFetch(DETAIL_QUERY, { id })
  return response.data.Media || null
}

export async function getTrendingAniList(page = 1, perPage = 20): Promise<AniListMedia[]> {
  const response = await anilistFetch(TRENDING_QUERY, { page, perPage })
  return response.data.Page?.media || []
}

export async function batchGetAniList(ids: number[]): Promise<AniListMedia[]> {
  const results: AniListMedia[] = []
  // AniList allows max 50 per page, so batch accordingly
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const response = await anilistFetch(BATCH_QUERY, { ids: batch })
    results.push(...(response.data.Page?.media || []))
    // Rate limiting: wait between batches
    if (i + 50 < ids.length) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }
  return results
}

export function mapAniListStatus(status: string | null): string {
  const map: Record<string, string> = {
    RELEASING: 'AIRING',
    FINISHED: 'COMPLETED',
    NOT_YET_RELEASED: 'UPCOMING',
    CANCELLED: 'HIATUS',
    HIATUS: 'HIATUS',
  }
  return map[status || ''] || 'UPCOMING'
}

export function mapAniListFormat(format: string | null): string {
  const map: Record<string, string> = {
    TV: 'TV',
    TV_SHORT: 'TV',
    MOVIE: 'MOVIE',
    SPECIAL: 'SPECIAL',
    OVA: 'OVA',
    ONA: 'ONA',
    MUSIC: 'SPECIAL',
  }
  return map[format || ''] || 'TV'
}

export function getTrailerUrl(trailer: { id: string; site: string } | null): string | null {
  if (!trailer) return null
  if (trailer.site === 'youtube') return `https://www.youtube.com/watch?v=${trailer.id}`
  return null
}

export type { AniListMedia }
