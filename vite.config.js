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
        server.middlewares.use('/api/live-deals', async (req, res, next) => {
          try {
            // Dynamically import the Vercel serverless function handler
            const liveDealsModule = await server.ssrLoadModule('/api/live-deals.js');
            const handler = liveDealsModule.default;

            // Response helper wrappers for Vercel functions
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
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
});
