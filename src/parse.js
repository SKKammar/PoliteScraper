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

export function extractBookDetails(html, productUrl, sourcePage) {
  const $ = cheerio.load(html);
  const title = $('div.product_main h1').text().trim();
  const price_text = $('p.price_color').text().trim();
  const availability_text = $('p.instock.availability').text().trim();
  const ratingClass = $('p.star-rating').attr('class') || '';
  const rating_text = ratingClass.replace('star-rating ', '').trim();
  const description = $('div#product_description ~ p').text().trim() || null;
  return {
    title,
    product_url: productUrl,
    price_text,
    availability_text,
    rating_text: rating_text || 'Unknown',
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString()
  };
}
