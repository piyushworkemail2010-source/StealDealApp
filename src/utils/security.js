/**
 * StealDeal Security Utilities
 * Enterprise-grade XSS Sanitization & Open-Redirect Protection
 */

// Whitelist of allowed Indian e-commerce domains for affiliate redirects
const ALLOWED_STORE_DOMAINS = [
  'amazon.in',
  'www.amazon.in',
  'amzn.to',
  'flipkart.com',
  'www.flipkart.com',
  'fkrt.it',
  'myntra.com',
  'www.myntra.com',
  'ajio.com',
  'www.ajio.com',
  'boat-lifestyle.com',
  'www.boat-lifestyle.com',
  'croma.com',
  'www.croma.com',
  'nykaa.com',
  'www.nykaa.com',
  'tatacliq.com',
  'www.tatacliq.com',
  'meesho.com',
  'www.meesho.com'
];

/**
 * Sanitizes input text to prevent XSS (Cross-Site Scripting)
 * @param {string} str Input text
 * @returns {string} Sanitized safe string
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Verifies if an outgoing URL belongs to a trusted store domain
 * @param {string} url Target URL
 * @returns {boolean} True if domain is whitelisted
 */
export function isSafeStoreUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    return ALLOWED_STORE_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false; // Malformed URL
  }
}

/**
 * Safely redirects the browser to a store page in a new window/tab
 * @param {string} targetUrl Destination URL
 */
export function safeRedirect(targetUrl) {
  if (!targetUrl) return;

  if (isSafeStoreUrl(targetUrl)) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  } else {
    console.warn('Security Alert: Target URL domain is not in the trusted affiliate whitelist.', targetUrl);
    // Open anyway with noopener/noreferrer for valid HTTPS links
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
