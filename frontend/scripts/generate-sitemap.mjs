/**
 * Writes public/sitemap.xml with every category and product page, pulled from
 * the live API at build time. Never fails the build: if the API can't be
 * reached, an existing sitemap is kept as-is (otherwise static pages are written).
 *
 *   node scripts/generate-sitemap.mjs
 *
 * Uses VITE_SITE_URL / VITE_API_BASE_URL from the environment (or .env).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(file) {
  const path = join(root, file);
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
}

const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.production'), ...process.env };
const SITE_URL = (env.VITE_SITE_URL || 'https://okira.vercel.app').replace(/\/+$/, '');
const API_URL = (env.SITEMAP_API_URL || env.VITE_API_BASE_URL || 'https://okira-backend.vercel.app/api/v1').replace(/\/+$/, '');
const today = new Date().toISOString().slice(0, 10);

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = (path, priority, changefreq, lastmod = today) =>
  `  <url>\n    <loc>${xmlEscape(SITE_URL + path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

const entries = [url('/', '1.0', 'daily'), url('/products', '0.9', 'daily'), url('/about', '0.5', 'monthly')];

try {
  const categories = await getJson('/categories');
  for (const c of categories) entries.push(url(`/categories/${c.slug}`, '0.8', 'weekly'));

  let page = 1;
  let totalPages = 1;
  let productCount = 0;
  do {
    const data = await getJson(`/products?page=${page}&page_size=100`);
    for (const p of data.items) {
      entries.push(url(`/products/${p.slug}`, '0.7', 'weekly', (p.updated_at || today).slice(0, 10)));
      productCount += 1;
    }
    totalPages = data.total_pages;
    page += 1;
  } while (page <= totalPages && page <= 50);

  console.log(`[sitemap] ${categories.length} categories, ${productCount} products from ${API_URL}`);
} catch (err) {
  const outFile = join(root, 'public', 'sitemap.xml');
  if (existsSync(outFile)) {
    console.warn(`[sitemap] API unavailable (${err.message}) — keeping the existing sitemap.`);
    process.exit(0);
  }
  console.warn(`[sitemap] API unavailable (${err.message}) — writing static pages only.`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
writeFileSync(join(root, 'public', 'sitemap.xml'), xml);
console.log(`[sitemap] wrote ${entries.length} URLs to public/sitemap.xml`);
