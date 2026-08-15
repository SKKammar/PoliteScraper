import { fetchWithCache } from './fetch.js';
import { extractBookLinks, getNextPageUrl } from './parse.js';
import { BASE_URL, DELAY_MS } from './config.js';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const allBookUrls = new Set();
  let currentPageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNum = 1;

  while (pageNum <= 3 && currentPageUrl) {
    const cacheKey = `catalogue-page-${pageNum}`;
    let html;
    try {
      html = await fetchWithCache(currentPageUrl, cacheKey);
    } catch (err) {
      console.error(`Failed to fetch catalogue page ${pageNum}:`, err.message);
      break;
    }

    const links = extractBookLinks(html, currentPageUrl);
    links.forEach(link => allBookUrls.add(link));

    currentPageUrl = getNextPageUrl(html, currentPageUrl);
    pageNum++;

    if (currentPageUrl && pageNum <= 3) {
      await delay(DELAY_MS);
    }
  }

  console.log(`catalogue_pages=${pageNum - 1}, discovered=${allBookUrls.size}, unique_urls=${allBookUrls.size}`);
}

main().catch(console.error);
