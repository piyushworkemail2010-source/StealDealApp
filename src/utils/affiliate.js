/**
 * StealDeal EarnKaro & E-Commerce Affiliate Link Generator
 * Monetizes product links across top Indian platforms (Amazon, Flipkart, Myntra, Ajio, etc.)
 */

// User's EarnKaro partner referral code & Amazon tag from environment variables
const EARNKARO_REF_CODE = import.meta.env?.VITE_EARNKARO_REF_CODE || '5490007';
const AMAZON_TAG = import.meta.env?.VITE_AMAZON_ASSOCIATE_TAG || 'khoshai-21';

/**
 * Format Indian Rupees (INR) currency
 */
export function formatINR(val) {
  if (val === undefined || val === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Converts any raw product URL into an EarnKaro monetized link or direct affiliate tag link
 * Prevents recursive double-wrapping if the link is already monetized!
 * @param {string} rawUrl - Original product landing page URL
 * @param {string} store - Store name (e.g. Amazon.in, Flipkart, Myntra)
 * @returns {string} Single monetized affiliate URL
 */
export function generateAffiliateUrl(rawUrl, store = '') {
  if (!rawUrl) return '#';

  const cleanUrl = rawUrl.trim();

  // GUARD: If the URL is already an EarnKaro link, DO NOT double-wrap!
  if (cleanUrl.includes('earnkaro.com/share') || cleanUrl.includes('topend.earnkaro.com')) {
    console.log('✅ [Affiliate Link Guard] Link already contains EarnKaro wrapper:', cleanUrl);
    return cleanUrl;
  }

  // 1. Direct tag fallbacks for major Indian retailers
  try {
    const urlObj = new URL(cleanUrl);
    const domain = urlObj.hostname.toLowerCase();

    if (domain.includes('amazon.')) {
      urlObj.searchParams.set('tag', AMAZON_TAG);
      return urlObj.toString();
    }

    if (domain.includes('flipkart.')) {
      urlObj.searchParams.set('affid', 'stealdeal');
      return urlObj.toString();
    }
  } catch (e) {
    // If URL parsing fails, continue to EarnKaro wrapper
  }

  // 2. EarnKaro Universal Link conversion wrapper
  return `https://topend.earnkaro.com/share?url=${encodeURIComponent(cleanUrl)}`;
}

/**
 * Alias for generateAffiliateUrl to maintain backwards compatibility
 */
export function buildAffiliateUrl(rawUrl, store = '') {
  return generateAffiliateUrl(rawUrl, store);
}

/**
 * Extract store logo from URL or store name
 */
export function getStoreLogo(storeName = '') {
  const s = storeName.toLowerCase();
  if (s.includes('amazon')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';
  if (s.includes('flipkart')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg';
  if (s.includes('myntra')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png';
  if (s.includes('ajio')) return 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Ajio_logo.png';
  if (s.includes('nykaa')) return 'https://upload.wikimedia.org/wikipedia/commons/0/00/Nykaa_logo.svg';
  return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80';
}
