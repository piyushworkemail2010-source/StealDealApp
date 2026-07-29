import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Parse .env.local without requiring external dependencies
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && val) {
        process.env[key.trim()] = val;
      }
    }
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vercel-api-local-dev-proxy',
      configureServer(server) {
        // 1. /api/live-deals endpoint
        server.middlewares.use('/api/live-deals', async (req, res, next) => {
          try {
            const liveDealsModule = await server.ssrLoadModule('/api/live-deals.js');
            const handler = liveDealsModule.default;

            res.status = (code) => {
              res.statusCode = code;
              return res;
            };

            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            await handler(req, res);
          } catch (err) {
            console.error('❌ Local /api/live-deals dev error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });

        // 2. /api/track-product endpoint (powered by dealEngine.js)
        server.middlewares.use('/api/track-product', async (req, res) => {
          try {
            const dealEngineModule = await server.ssrLoadModule('/dealEngine.js');
            
            // Read JSON body
            let bodyData = '';
            req.on('data', chunk => { bodyData += chunk; });
            req.on('end', async () => {
              try {
                req.body = bodyData ? JSON.parse(bodyData) : {};
              } catch (e) {
                req.body = {};
              }

              const canonicalUrl = dealEngineModule.getCanonicalUrl(req.body.url || '');
              const scrapeResult = await dealEngineModule.scrapeProduct(canonicalUrl);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                canonicalUrl,
                product: {
                  title: scrapeResult.title || 'Product Item',
                  current_price: scrapeResult.current_price || 4999.00,
                  is_in_stock: scrapeResult.is_in_stock !== false,
                  affiliateUrl: dealEngineModule.generateAffiliateLink(canonicalUrl)
                }
              }));
            });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });

        // 3. /api/redirect endpoint (powered by dealEngine.js)
        server.middlewares.use('/api/redirect', async (req, res) => {
          try {
            const dealEngineModule = await server.ssrLoadModule('/dealEngine.js');
            const targetUrl = req.query?.url || 'https://www.amazon.in/dp/B08N5WRWNW';
            const affiliateUrl = dealEngineModule.generateAffiliateLink(targetUrl);

            res.statusCode = 302;
            res.setHeader('Location', affiliateUrl);
            res.end();
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
});
