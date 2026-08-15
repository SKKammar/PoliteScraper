import fs from 'fs/promises';
import path from 'path';
import { fetchWithCache } from './fetch.js';
import { extractBookLinks, getNextPageUrl, extractBookDetails } from './parse.js';
import { normalizeRecord } from './normalize.js';
import { validateBook } from './validate.js';
import { writeReport } from './report.js';
import { BASE_URL, DELAY_MS, OUTPUT_DIR } from './config.js';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const startTime = new Date();
  const report = {
    start_time: startTime.toISOString(),
    pages_fetched: 0,
    cache_hits: 0, 
    valid_records: 0,
    invalid_records: 0,
    failed_pages: 0,
    errors: []
  };

  const allBookUrls = new Set();
  let currentPageUrl = `${BASE_URL}/catalogue/page-1.html`;
  let pageNum = 1;

  // 1. Collect all book URLs
  while (pageNum <= 3 && currentPageUrl) {
    const cacheKey = `catalogue-page-${pageNum}`;
    let html;
    try {
      html = await fetchWithCache(currentPageUrl, cacheKey);
      report.pages_fetched++;
    } catch (err) {
      console.error(`Failed to fetch catalogue page ${pageNum}:`, err.message);
      report.failed_pages++;
      report.errors.push({ url: currentPageUrl, error: err.message });
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

  // deliberately add a fake book URL to prove failure handling
  allBookUrls.add('https://books.toscrape.com/catalogue/nonexistent_9999/index.html');

  // 2. Fetch details
  const rawRecords = [];
  const urlsArray = Array.from(allBookUrls);
  
  for (let i = 0; i < urlsArray.length; i++) {
    const url = urlsArray[i];
    const cacheKey = `book-${i}`;
    let html;
    try {
      html = await fetchWithCache(url, cacheKey);
      report.pages_fetched++;
    } catch (err) {
      console.error(`Failed to fetch book ${url}:`, err.message);
      report.failed_pages++;
      report.errors.push({ url, error: err.message });
      continue;
    }
    
    const sourcePage = `${BASE_URL}/catalogue/page-1.html`;
    const raw = extractBookDetails(html, url, sourcePage);
    rawRecords.push(raw);
    
    await delay(DELAY_MS);
  }
  
  // 3. Normalize and validate
  const good = [];
  const bad = [];
  for (const raw of rawRecords) {
    const normalized = normalizeRecord(raw);
    const result = validateBook(normalized);
    if (result.valid) {
      good.push(result.data);
      report.valid_records++;
    } else {
      bad.push({ raw, errors: result.error });
      report.invalid_records++;
    }
  }

  // 4. Write outputs
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, 'books.json'), JSON.stringify(good, null, 2));
  await fs.writeFile(path.join(OUTPUT_DIR, 'errors.json'), JSON.stringify(bad, null, 2));

  // 5. Write run report
  const endTime = new Date();
  report.end_time = endTime.toISOString();
  report.duration_seconds = (endTime.getTime() - startTime.getTime()) / 1000;
  await writeReport(report);

  console.log(`Scraping finished. Valid records: ${report.valid_records}, Failed pages: ${report.failed_pages}`);
}

main().catch(console.error);
