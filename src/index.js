import { fetchWithCache } from './fetch.js';
import { extractBookLinks, getNextPageUrl, extractBookDetails } from './parse.js';
import { BASE_URL, DELAY_MS } from './config.js';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const allBookUrls = new Set();
  let currentPageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNum = 1;

  // 1. Collect all book URLs
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

  // 2. Fetch details
  const rawRecords = [];
  const urlsArray = Array.from(allBookUrls);
  
  for (let i = 0; i < urlsArray.length; i++) {
    const url = urlsArray[i];
    const cacheKey = `book-${i}`;
    let html;
    try {
      html = await fetchWithCache(url, cacheKey);
    } catch (err) {
      console.error(`Failed to fetch book ${url}:`, err.message);
      continue;
    }
    
    // For simplicity, using base page as source_page.
    const sourcePage = `${BASE_URL}/catalogue/page-1.html`;
    const raw = extractBookDetails(html, url, sourcePage);
    rawRecords.push(raw);
    
    await delay(DELAY_MS);
  }
  
  console.log(`detail_pages=${rawRecords.length}`);
  if (rawRecords.length > 0) {
    console.log('Sample record:', JSON.stringify(rawRecords[0], null, 2));
  }
}

main().catch(console.error);
