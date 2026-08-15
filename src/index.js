import fs from 'fs/promises';
import path from 'path';
import { fetchWithCache } from './fetch.js';
import { extractBookLinks, getNextPageUrl, extractBookDetails } from './parse.js';
import { normalizeRecord } from './normalize.js';
import { validateBook } from './validate.js';
import { BASE_URL, DELAY_MS, OUTPUT_DIR } from './config.js';

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
    
    const sourcePage = `${BASE_URL}/catalogue/page-1.html`;
    const raw = extractBookDetails(html, url, sourcePage);
    rawRecords.push(raw);
    
    await delay(DELAY_MS);
  }
  
  console.log(`detail_pages=${rawRecords.length}`);

  // 3. Normalize and validate
  const good = [];
  const bad = [];
  for (const raw of rawRecords) {
    const normalized = normalizeRecord(raw);
    const result = validateBook(normalized);
    if (result.valid) {
      good.push(result.data);
    } else {
      bad.push({ raw, errors: result.error });
    }
  }

  console.log(`Validation results: ${good.length} valid, ${bad.length} invalid.`);

  // 4. Write outputs
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, 'books.json'), JSON.stringify(good, null, 2));
  await fs.writeFile(path.join(OUTPUT_DIR, 'errors.json'), JSON.stringify(bad, null, 2));

  console.log('Saved to output/');
}

main().catch(console.error);
