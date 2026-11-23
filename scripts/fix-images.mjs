import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function verifyImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'OrvenMediaImageFixer/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 403) {
      // Some CDNs reject HEAD, test with range GET
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'OrvenMediaImageFixer/1.0', Range: 'bytes=0-10' },
        signal: AbortSignal.timeout(6000),
      });
      return getRes.ok || getRes.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}

async function fetchFromAniList(searchQuery, retryCount = 0) {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 3) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { search: searchQuery } }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 429) {
      const waitTime = 5000 * (retryCount + 1);
      console.warn(`[429 RATE LIMIT] AniList rate limited. Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
      if (retryCount < 3) {
        return fetchFromAniList(searchQuery, retryCount + 1);
      }
      return null;
    }

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.Page?.media || null;
  } catch (err) {
    if (retryCount < 2) {
      await delay(2000);
      return fetchFromAniList(searchQuery, retryCount + 1);
    }
    return null;
  }
}

function cleanTitle(raw) {
  if (!raw) return '';
  // Remove parenthesized subtitles like (Douluo Dalu), (2011), etc.
  return raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[:\-].*$/, '')
    .trim();
}

async function main() {
  console.log('===============================================================');
  console.log('       ORVEN MEDIA - ANILIST IMAGE VERIFIER & FIXER            ');
  console.log('===============================================================');

  const allAnime = await db.anime.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${allAnime.length} anime/donghua records in database.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < allAnime.length; i++) {
    const item = allAnime[i];
    const indexStr = `[${i + 1}/${allAnime.length}]`;

    // 1. First check if current poster is already valid
    const isCurrentPosterValid = await verifyImageUrl(item.poster);
    const isCurrentBannerValid = await verifyImageUrl(item.banner);

    // If poster is already valid and banner is valid, we can skip or only fix banner
    if (isCurrentPosterValid && isCurrentBannerValid && item.poster && !item.poster.includes('bx9999')) {
      console.log(`${indexStr} [OK] "${item.title}" has valid images. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`${indexStr} [FIXING] "${item.title}" (posterValid: ${isCurrentPosterValid}, bannerValid: ${isCurrentBannerValid})...`);

    // Search queries to try:
    // 1: titleEnglish or titleRomaji
    // 2: cleaned title
    // 3: raw title
    const searchCandidates = [
      item.titleEnglish,
      item.titleRomaji,
      cleanTitle(item.title),
      item.title,
    ].filter(Boolean);

    let media = null;
    for (const cand of searchCandidates) {
      await delay(650); // respect AniList rate limits
      const results = await fetchFromAniList(cand);
      if (results && results.length > 0) {
        media = results[0];
        break;
      }
    }

    if (!media) {
      console.warn(`${indexStr} [WARN] No AniList match found for "${item.title}".`);
      failedCount++;
      continue;
    }

    const candidatePoster = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || null;
    const candidateBanner = media.bannerImage || null;

    let validPoster = item.poster;
    let validBanner = item.banner;

    if (candidatePoster) {
      const ok = await verifyImageUrl(candidatePoster);
      if (ok) validPoster = candidatePoster;
    }

    if (candidateBanner) {
      const ok = await verifyImageUrl(candidateBanner);
      if (ok) validBanner = candidateBanner;
    }

    // If candidateBanner was null, we can keep existing or use poster as backdrop
    if (!validBanner && validPoster) {
      validBanner = validPoster;
    }

    await db.anime.update({
      where: { id: item.id },
      data: {
        poster: validPoster,
        banner: validBanner,
        anilistId: media.id || item.anilistId,
      },
    });

    console.log(`${indexStr} [UPDATED] "${item.title}" -> Poster: ${validPoster ? 'VALID' : 'NONE'}, Banner: ${validBanner ? 'VALID' : 'NONE'}`);
    updatedCount++;
  }

  console.log('===============================================================');
  console.log(`Summary: ${updatedCount} updated, ${skippedCount} already valid, ${failedCount} unresolved`);
  console.log('===============================================================');
}

main()
  .catch((e) => {
    console.error('Fatal error in fix-images:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
