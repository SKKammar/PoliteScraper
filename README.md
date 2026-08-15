# The Polite Scraper

A polite, resilient, and validated web scraper that extracts book data from the Books to Scrape sandbox.

## Target Classification
- **Site Name:** Books to Scrape
- **URL:** https://books.toscrape.com/
- **Scope:** First 3 catalogue pages only (60 books).
- **Data Collected:** title, price, availability, rating, description, source page, fetched timestamp.
- **Why it is appropriate:** The site explicitly exists for scraping practice.
- **Robots.txt outcome:** No robots file found (404 Not Found).
- **Ethics Statement:** I will not reuse this code on another site without checking its rules and terms first.

## Prerequisites
- Node.js 20+

## Installation
```bash
npm install
```

## Running the Scraper
```bash
npm start
```

## Record Schema
The final output (`books.json`) will contain an array of objects matching this schema:
- `title` (string, min 1)
- `product_url` (string, valid URL)
- `price_text` (string)
- `price_gbp` (number, non-negative)
- `availability_text` (string)
- `rating_text` (string)
- `description` (string or null)
- `source_page` (string, valid URL)
- `fetched_at` (string, ISO datetime)

## Politeness Rules
- **User-Agent:** Identifies as `PoliteScraper/1.0 (+https://github.com/SKKammar/PoliteScraper)`
- **Delay:** Waits at least 500ms between real requests.
- **Timeout:** 10,000ms timeout per request.
- **Caching:** Caches HTML to avoid hammering the site during development.
- **Retries:** Retries once on timeout or 5xx server errors.

## Output Files
- `output/books.json`: The 60 validated records.
- `output/errors.json`: Any records that failed validation.
- `output/run-report.json`: Statistics and error summaries from the run.

## Limitations
This scraper does not handle JavaScript-rendered content because the data is already in the HTML.

## Run Report Sample
```json
{
  "start_time": "2026-08-15T05:36:00.782Z",
  "pages_fetched": 63,
  "cache_hits": 0,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1,
  "errors": [
    {
      "url": "https://books.toscrape.com/catalogue/nonexistent_9999/index.html",
      "error": "HTTP 404 for https://books.toscrape.com/catalogue/nonexistent_9999/index.html"
    }
  ],
  "end_time": "2026-08-15T05:36:46.618Z",
  "duration_seconds": 45.836
}
```

## Note on Ethics
Always use official APIs when available, never bypass paywalls or logins, and collect only what you need. Scraping should be respectful to the host servers.
