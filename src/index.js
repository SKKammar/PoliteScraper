import { fetchWithCache } from './fetch.js';
import { BASE_URL } from './config.js';

async function main() {
  const url = `${BASE_URL}/catalogue/page-1.html`;
  const cacheKey = 'catalogue-page-1';
  
  try {
    const html = await fetchWithCache(url, cacheKey);
    console.log(`Successfully fetched, HTML size: ${html.length} bytes`);
  } catch (err) {
    console.error('Error fetching page:', err);
  }
}

main();
