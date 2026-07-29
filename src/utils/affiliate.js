/**
 * StealDeal 100% Automated Dynamic Affiliate Link Engine
 * Automatically converts ANY raw e-commerce product link (Amazon, Flipkart, Myntra, Ajio, Boat, etc.)
 * into an EarnKaro / Affiliate commission link on the fly with ZERO manual effort!
 */

// Your EarnKaro / CueLinks Publisher ID
const EARNKARO_PUBLISHER_ID = '5490007'; // Piyush's EarnKaro Referral ID

/**
 * Automatically converts ANY raw product URL into a 100% commission-enabled affiliate link
 * @param {string} rawUrl Raw product URL (Amazon, Flipkart, etc.)
 * @param {string} store Store identifier
 * @returns {string} Fully automated affiliate URL
 */
export function buildAffiliateUrl(rawUrl, store = '') {
  if (!rawUrl) return '#';

  const cleanUrl = rawUrl.trim();

  // If the link is ALREADY a pre-generated EarnKaro/Short link (fktr.in, ekaro.in, amzn.to), use it directly
  if (cleanUrl.includes('fktr.in') || cleanUrl.includes('ekaro.in') || cleanUrl.includes('topurl.in') || cleanUrl.includes('amzn.to')) {
    return cleanUrl;
  }

  try {
    const urlObj = new URL(cleanUrl);
    const lowerStore = (store || '').toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();

    // 1. Amazon Auto-Convert Engine
    if (hostname.includes('amazon') || lowerStore.includes('amazon')) {
      urlObj.searchParams.set('tag', `${EARNKARO_PUBLISHER_ID}-21`);
      return urlObj.toString();
    }

    // 2. Flipkart Auto-Convert Engine
    if (hostname.includes('flipkart') || lowerStore.includes('flipkart')) {
      urlObj.searchParams.set('affid', EARNKARO_PUBLISHER_ID);
      return urlObj.toString();
    }

    // 3. EarnKaro Universal Dynamic Auto-Convert Engine (Myntra, Ajio, Boat, Nykaa, Croma)
    const encodedTarget = encodeURIComponent(cleanUrl);
    return `https://topurl.in/c/enkr?id=${EARNKARO_PUBLISHER_ID}&url=${encodedTarget}`;

  } catch (e) {
    return rawUrl;
  }
}

/**
 * Formats a number as Indian Currency (INR / ₹)
 * @param {number} amount Price in INR
 * @returns {string} Formatted price (e.g. ₹14,999)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
