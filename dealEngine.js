/**
 * ============================================================================
 * StealDeal Standalone Deal Engine (dealEngine.js)
 * High-performance Node.js Data Ingestion, Price Scraping, Canonical ASIN Extractor,
 * Shortlink ASIN Resolver, Affiliate Link Generator, Express API & Cron Web Push Alert System.
 * ============================================================================
 */

import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import webpush from 'web-push';

// ----------------------------------------------------------------------------
// 0. Configuration & Global State (In-Memory Stores)
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;
const DEFAULT_AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'khoshai-21';

// Configure Web-Push (VAPID Keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BPJDlksZtEii-If7-LCeA4zwedoTj9uFa3VRPPRMFalRbkg9p4nxFINysOCZZhbSnlREMVRdQRR0_nMQjv1gs6A';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'MJqvP0j6vAJXdQfxO_vWBZRqgrTWgw-iUu1eX3rOY5E';

try {
  webpush.setVapidDetails(
    'mailto:support@stealdeal.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('🔒 Web Push VAPID credentials configured successfully.');
} catch (vapidErr) {
  console.warn('⚠️ Web Push VAPID Initialization Warning:', vapidErr.message);
}

// In-Memory Database Stores
const productsStore = new Map();     // productId => { productId, canonicalUrl, title, current_price, is_in_stock, lastScrapedAt }
const trackingRulesStore = [];       // Array of { id, productId, target_price, subscription, lastNotifiedAt }

// ----------------------------------------------------------------------------
// 1. Canonical URL Cleaner & ASIN Extractor (cleanUrl.js logic)
// ----------------------------------------------------------------------------

/**
 * Extracts canonical ASIN / product URL and strips query tracking parameter noise.
 * NEVER constructs or returns search query URLs (/s?k=...).
 * 
 * @param {string} rawUrl - Original input URL
 * @returns {string} Clean direct canonical URL
 */
export function getCanonicalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Invalid URL provided');
  }

  const trimmed = rawUrl.trim();

  // 1. Check for Amazon India / International ASIN patterns
  const amazonAsinMatch = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|asin=)([A-Z0-9]{10})/i);

  if (amazonAsinMatch && amazonAsinMatch[1]) {
    const asin = amazonAsinMatch[1].toUpperCase();
    return `https://www.amazon.in/dp/${asin}`;
  }

  // 2. Non-Amazon URLs (Flipkart, Myntra, Ajio, etc.): Strip tracking query params
  try {
    const urlObj = new URL(trimmed);

    const trackingKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pd_rd_w', 'pd_rd_r', 'qid', 'sr',
      'tag', 'affid', 'gclid', 'fbclid', '_hsenc', 'mkt_tok'
    ];

    trackingKeys.forEach(key => urlObj.searchParams.delete(key));

    return urlObj.origin + urlObj.pathname + (urlObj.searchParams.toString() ? `?${urlObj.searchParams.toString()}` : '');
  } catch (e) {
    return trimmed;
  }
}

/**
 * Resolves shortlinks (e.g. ddime.in/xxx) to direct merchant product detail pages (/dp/ASIN)
 */
export async function resolveShortlinkToDirectDp(shortUrl, tag = DEFAULT_AMAZON_TAG) {
  if (!shortUrl) return '';

  try {
    const res1 = await fetch(shortUrl, { method: 'HEAD', redirect: 'manual' });
    const loc1 = res1.headers.get('location');
    if (!loc1) return getCanonicalUrl(shortUrl);

    const res2 = await fetch(loc1, { method: 'HEAD', redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const loc2 = res2.headers.get('location') || loc1;

    const urlParamMatch = loc2.match(/url=([^&]+)/);
    let targetUrl = loc2;
    if (urlParamMatch) {
      targetUrl = decodeURIComponent(urlParamMatch[1]);
    }

    const asinMatch = targetUrl.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i);
    if (asinMatch) {
      return `https://www.amazon.in/dp/${asinMatch[1].toUpperCase()}?tag=${tag}`;
    }

    return generateAffiliateLink(targetUrl, tag);
  } catch (e) {
    return generateAffiliateLink(shortUrl, tag);
  }
}

// ----------------------------------------------------------------------------
// 2. Live Scraper Service (scrapeProduct)
// ----------------------------------------------------------------------------

/**
 * Fetches HTML using Axios with browser headers and parses DOM using Cheerio.
 */
export async function scrapeProduct(url) {
  const canonicalUrl = getCanonicalUrl(url);

  try {
    const response = await axios.get(canonicalUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Cache-Control': 'no-cache'
      }
    });

    const $ = cheerio.load(response.data);

    let title = $('#productTitle').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                $('.product-title').text().trim() ||
                $('h1').first().text().trim() ||
                'Product';

    title = title.replace(/\s+/g, ' ').trim();

    let rawPriceStr = $('.a-price-whole').first().text().trim() ||
                      $('#priceblock_ourprice').text().trim() ||
                      $('#priceblock_dealprice').text().trim() ||
                      $('.a-offscreen').first().text().trim() ||
                      $('meta[property="product:price:amount"]').attr('content') ||
                      '';

    let current_price = null;
    if (rawPriceStr) {
      const cleanDigits = rawPriceStr.replace(/[^0-9.]/g, '');
      if (cleanDigits) {
        current_price = parseFloat(cleanDigits);
      }
    }

    if (!current_price) {
      const priceTextMatch = $.text().match(/₹\s*([\d,]+(?:\.\d{2})?)/);
      if (priceTextMatch) {
        current_price = parseFloat(priceTextMatch[1].replace(/,/g, ''));
      }
    }

    const availabilityText = $('#availability').text().toLowerCase() ||
                             $('.in-stock-notification').text().toLowerCase() ||
                             $('meta[property="og:availability"]').attr('content') || '';

    const is_in_stock = !availabilityText.includes('currently unavailable') &&
                        !availabilityText.includes('out of stock') &&
                        !availabilityText.includes('sold out');

    return {
      success: true,
      canonicalUrl,
      title: title || 'Verified E-Commerce Product',
      current_price: current_price || 0.0,
      is_in_stock,
      scrapedAt: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      canonicalUrl,
      error: error.response ? `HTTP ${error.response.status}: ${error.response.statusText}` : error.message,
      scrapedAt: new Date().toISOString()
    };
  }
}

// ----------------------------------------------------------------------------
// 3. Affiliate Link Generator (generateAffiliateLink)
// ----------------------------------------------------------------------------

/**
 * Appends affiliate tags safely without search query redirects.
 */
export function generateAffiliateLink(cleanUrl, tag = DEFAULT_AMAZON_TAG) {
  if (!cleanUrl) return '#';

  const canonical = getCanonicalUrl(cleanUrl);

  try {
    const urlObj = new URL(canonical);
    const domain = urlObj.hostname.toLowerCase();

    // 1. Direct Amazon Tag
    if (domain.includes('amazon.')) {
      urlObj.searchParams.set('tag', tag);
      return urlObj.toString();
    }

    // 2. Flipkart Affiliate Direct Tag
    if (domain.includes('flipkart.')) {
      urlObj.searchParams.set('affid', 'stealdeal');
      return urlObj.toString();
    }

    return canonical;
  } catch (e) {
    return canonical;
  }
}

// ----------------------------------------------------------------------------
// 4. Express REST API Endpoints
// ----------------------------------------------------------------------------

const app = express();
app.use(express.json());

// CORS Header Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/**
 * POST /api/track-product
 */
app.post('/api/track-product', async (req, res) => {
  const { url, target_price, subscription } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing product URL parameter.' });
  }

  try {
    const canonicalUrl = getCanonicalUrl(url);
    const productId = Buffer.from(canonicalUrl).toString('base64').replace(/=/g, '');

    const scrapeResult = await scrapeProduct(canonicalUrl);

    if (!scrapeResult.success) {
      return res.status(502).json({
        success: false,
        error: 'Failed to scrape product page for initial pricing.',
        details: scrapeResult.error
      });
    }

    const productRecord = {
      productId,
      canonicalUrl,
      title: scrapeResult.title,
      current_price: scrapeResult.current_price,
      is_in_stock: scrapeResult.is_in_stock,
      lastScrapedAt: scrapeResult.scrapedAt
    };

    productsStore.set(productId, productRecord);

    if (target_price && subscription) {
      trackingRulesStore.push({
        id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId,
        target_price: parseFloat(target_price),
        subscription,
        lastNotifiedAt: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product tracking rule created successfully.',
      product_id: productId,
      product: {
        title: productRecord.title,
        current_price: productRecord.current_price,
        is_in_stock: productRecord.is_in_stock,
        canonicalUrl: productRecord.canonicalUrl,
        affiliateUrl: generateAffiliateLink(productRecord.canonicalUrl)
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/redirect/:product_id
 */
app.get('/api/redirect/:product_id', (req, res) => {
  const { product_id } = req.params;
  const productRecord = productsStore.get(product_id);

  if (!productRecord) {
    return res.status(404).json({ success: false, error: 'Product record not found for redirect.' });
  }

  const affiliateUrl = generateAffiliateLink(productRecord.canonicalUrl);
  return res.redirect(302, affiliateUrl);
});

/**
 * POST /api/redirect
 */
app.post('/api/redirect', (req, res) => {
  const { product_id, url } = req.body;
  let targetUrl = url;

  if (product_id && productsStore.has(product_id)) {
    targetUrl = productsStore.get(product_id).canonicalUrl;
  }

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'Valid product_id or url required for redirect.' });
  }

  const affiliateUrl = generateAffiliateLink(targetUrl);
  return res.redirect(302, affiliateUrl);
});

// -------------------------------------------------------------
// 5. Background Scheduler & Web Push Alert Engine (Cron Job)
// -------------------------------------------------------------

cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ [Cron Batch Engine Started] Running 30-minute product price evaluation...');

  if (trackingRulesStore.length === 0) {
    console.log('ℹ️ No active product tracking rules to evaluate.');
    return;
  }

  const uniqueProductIds = [...new Set(trackingRulesStore.map(rule => rule.productId))];

  for (const productId of uniqueProductIds) {
    const productRecord = productsStore.get(productId);
    if (!productRecord) continue;

    const scrapeResult = await scrapeProduct(productRecord.canonicalUrl);

    if (scrapeResult.success) {
      productRecord.current_price = scrapeResult.current_price;
      productRecord.is_in_stock = scrapeResult.is_in_stock;
      productRecord.lastScrapedAt = scrapeResult.scrapedAt;
      productsStore.set(productId, productRecord);
    }
  }

  const NOW = Date.now();
  const COOLDOWN_24H = 24 * 60 * 60 * 1000;

  for (const rule of trackingRulesStore) {
    const productRecord = productsStore.get(rule.productId);
    if (!productRecord || !productRecord.current_price) continue;

    const priceDropped = productRecord.current_price <= rule.target_price;
    const cooldownExpired = !rule.lastNotifiedAt || (NOW - rule.lastNotifiedAt >= COOLDOWN_24H);

    if (priceDropped && cooldownExpired && productRecord.is_in_stock) {
      const payload = JSON.stringify({
        title: '⚡ Price Glitch Drop Alert!',
        body: `${productRecord.title.slice(0, 60)} is now ₹${productRecord.current_price}! Tap to grab deal.`,
        icon: 'https://steal-deal-app.vercel.app/icon-192.png',
        data: {
          url: generateAffiliateLink(productRecord.canonicalUrl)
        }
      });

      try {
        await webpush.sendNotification(rule.subscription, payload);
        rule.lastNotifiedAt = NOW;
      } catch (pushErr) {
        console.error(`❌ Web Push Notification Delivery Failed:`, pushErr.message);
      }
    }
  }

  console.log('✅ [Cron Batch Engine Completed] 30-minute evaluation finished.');
});

// ----------------------------------------------------------------------------
// 6. Server Initialization
// ----------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 StealDeal Backend Deal Engine running on http://localhost:${PORT}`);
  });
}
