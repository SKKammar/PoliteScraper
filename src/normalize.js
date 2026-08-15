export function normalizePrice(priceText) {
  const cleaned = priceText.replace(/[£,]/g, '').trim();
  return parseFloat(cleaned);
}

export function normalizeRecord(raw) {
  return {
    ...raw,
    price_gbp: normalizePrice(raw.price_text)
  };
}
