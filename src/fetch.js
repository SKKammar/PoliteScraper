import fs from 'fs/promises';
import path from 'path';
import { CACHE_DIR, USER_AGENT, TIMEOUT_MS, MAX_RETRIES } from './config.js';

export async function fetchWithCache(url, cacheKey) {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.html`);
  try {
    const data = await fs.readFile(cachePath, 'utf-8');
    // console.log(`CACHE HIT: ${url}`);
    return data;
  } catch (err) {
    // console.log(`FETCH: ${url}`);
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status >= 500 && attempt < MAX_RETRIES) {
          attempt++;
          console.log(`Retry ${attempt} for ${url} (HTTP ${res.status})`);
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const html = await res.text();
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(cachePath, html, 'utf-8');
      return html;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        attempt++;
        console.log(`Retry ${attempt} for ${url} due to ${err.message}`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
}
