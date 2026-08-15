import * as cheerio from 'cheerio';

export function extractBookLinks(html, pageUrl) {
  const $ = cheerio.load(html);
  const links = [];
  $('article.product_pod h3 a').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      const absolute = new URL(href, pageUrl).href;
      links.push(absolute);
    }
  });
  return links;
}

export function getNextPageUrl(html, currentUrl) {
  const $ = cheerio.load(html);
  const next = $('li.next a').attr('href');
  if (!next) return null;
  return new URL(next, currentUrl).href;
}
