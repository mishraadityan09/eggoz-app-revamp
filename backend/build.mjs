/**
 * Builds the prototype's static API + image CDN into ./public (the folder that is deployed).
 *
 *  - /v1/home.json                 products, prices, banners, sections (from /mock-data/catalog.json)
 *  - /img/p/<id>-<size>.<hash>.webp display-sized WebP; content hash in the name => cache forever
 *  - each product gets a ~30-byte blurhash so the app shows a blurred preview while the photo loads
 *
 * Source photos live in ./source-images and are never deployed.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { encode } from 'blurhash';
import sharp from 'sharp';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'public');
const SRC = path.join(ROOT, 'source-images');
const CATALOG = path.join(ROOT, '..', 'mock-data', 'catalog.json');

// Card image ≈ 149 dp ≈ 391 px on a 420-dpi phone; product page up to ~1000 px but sources max at 671.
const SIZES = { thumb: 400, full: 800 };
const WEBP = { quality: 72, effort: 5 };

const VERCEL_CONFIG = {
  cleanUrls: false,
  headers: [
    {
      source: '/img/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        { key: 'X-Robots-Tag', value: 'noindex' },
      ],
    },
    {
      source: '/v1/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' },
        { key: 'X-Robots-Tag', value: 'noindex' },
      ],
    },
  ],
};

async function variant(id, source, key, width) {
  const { data, info } = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp(WEBP)
    .toBuffer({ resolveWithObject: true });
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 10);
  const file = `img/p/${id}-${key}.${hash}.webp`;
  await writeFile(path.join(OUT, file), data);
  return { url: `/${file}`, width: info.width, height: info.height, bytes: data.length };
}

async function blurhashOf(source) {
  const { data, info } = await sharp(source)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

// ---- Load-test catalog --------------------------------------------------------
// ~480 synthetic products derived from the 8 real ones. Each gets its own crop of a
// real photo (distinct bytes => its own download + decode), so the test exercises the
// image pipeline as well as list rendering. Clearly labelled as synthetic in the app.
const XL_SECTIONS = [
  'Best Selling', 'Brown eggs', 'White eggs', 'Protein Plus', 'Pack of 2', 'Pack of 3',
  '7-day plans', '15-day plans', '30-day plans', 'Breakfast picks', 'Gym & protein', 'Family packs',
  'Weekend specials', 'Under ₹200', 'Under ₹400', 'Value packs', 'Office pantry', 'Baking essentials',
  'Kids’ tiffin', 'Morning combos', 'New arrivals', 'Trending in Gurugram', 'Buy again', 'Recommended for you',
];
const XL_PER_SECTION = 20;
const VARIANTS = [
  { label: null, mult: 1, disc: 0 },
  { label: 'Pack of 2', mult: 2, disc: 0.08 },
  { label: 'Pack of 3', mult: 3, disc: 0.12 },
  { label: '7-day plan', mult: 7, disc: 0.05 },
  { label: '15-day plan', mult: 15, disc: 0.05 },
  { label: '30-day plan', mult: 30, disc: 0.07 },
];

async function xlImage(id, source, seed) {
  const meta = await sharp(source).metadata();
  const zoom = 0.8 + (seed % 5) * 0.05; // 80–100 % crop
  const size = Math.round(meta.width * zoom);
  const max = meta.width - size;
  const left = Math.round((max * ((seed * 37) % 100)) / 100);
  const top = Math.round((max * ((seed * 61) % 100)) / 100);
  const cropped = await sharp(source).extract({ left, top, width: size, height: size }).toBuffer();
  const thumb = await variant(id, cropped, 'thumb', SIZES.thumb);
  return { blurhash: await blurhashOf(cropped), thumb, full: thumb };
}

async function buildXl(realProducts, sources) {
  const products = [];
  const sections = [];
  for (const [s, title] of XL_SECTIONS.entries()) {
    const ids = [];
    for (let i = 0; i < XL_PER_SECTION; i++) {
      const base = realProducts[(s * 3 + i) % realProducts.length];
      const v = VARIANTS[(s + i) % VARIANTS.length];
      const eggs = base.packSize * v.mult;
      const price = Math.round(base.price * v.mult * (1 - v.disc));
      const id = `xl-${s}-${i}`;
      products.push({
        ...base,
        id,
        name: v.label ? `${base.name} · ${v.label}` : base.name,
        packSize: eggs,
        price,
        mrp: base.mrp ? Math.round(base.mrp * v.mult) : null,
        pricePerEgg: Math.round((price / eggs) * 100) / 100,
        earnCoins: base.earnCoins ? base.earnCoins * v.mult : null,
        bestSeller: false,
        synthetic: true,
        image: await xlImage(id, sources.get(base.id), s * XL_PER_SECTION + i),
      });
      ids.push(id);
    }
    sections.push({ id: `xl-section-${s}`, title, productIds: ids });
  }
  return { products, sections };
}

async function main() {
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'));
  // Clear generated output but keep public/.vercel (the Vercel project link).
  for (const generated of ['img', 'v1', 'vercel.json', 'robots.txt', 'index.html', '.vercelignore', '.env.local']) {
    await rm(path.join(OUT, generated), { recursive: true, force: true });
  }
  await mkdir(path.join(OUT, 'img', 'p'), { recursive: true });
  await mkdir(path.join(OUT, 'v1'), { recursive: true });

  const products = [];
  const sources = new Map();
  for (const p of catalog.products) {
    const source = await readFile(path.join(SRC, `${p.id}.png`)).catch(() => {
      throw new Error(`Missing source image: source-images/${p.id}.png`);
    });
    sources.set(p.id, source);
    const thumb = await variant(p.id, source, 'thumb', SIZES.thumb);
    const full = await variant(p.id, source, 'full', SIZES.full);
    const blurhash = await blurhashOf(source);
    products.push({ ...p, image: { blurhash, thumb, full } });
  }

  const productIds = new Set(products.map((p) => p.id));
  for (const s of catalog.homeSections) {
    for (const id of s.productIds) if (!productIds.has(id)) throw new Error(`Section ${s.id} references unknown ${id}`);
  }

  const home = {
    version: 1,
    generatedAt: new Date().toISOString(),
    observedOn: catalog.observedOn,
    coins: catalog.header.coins,
    walletBalance: catalog.header.walletBalance,
    banners: catalog.banners,
    categories: catalog.categories.map(({ id, name }) => ({ id, name })),
    sections: catalog.homeSections,
    products,
  };
  const homeJson = JSON.stringify(home);
  await writeFile(path.join(OUT, 'v1', 'home.json'), homeJson);

  const xl = await buildXl(catalog.products, sources);
  const xlJson = JSON.stringify({ ...home, generatedAt: new Date().toISOString(), sections: xl.sections, products: xl.products });
  await writeFile(path.join(OUT, 'v1', 'home-xl.json'), xlJson);
  console.log(`home-xl.json ${(Buffer.byteLength(xlJson) / 1024).toFixed(0)} KB · ${xl.products.length} products in ${xl.sections.length} rows`);
  await writeFile(path.join(OUT, 'vercel.json'), JSON.stringify(VERCEL_CONFIG, null, 2));
  await writeFile(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  // Never upload local credentials (vercel link writes .env.local into this folder).
  await writeFile(path.join(OUT, '.vercelignore'), '.env*\n.gitignore\n');
  await writeFile(
    path.join(OUT, 'index.html'),
    '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Concept prototype CDN</title>' +
      '<p>Static data for an unofficial concept prototype. Not affiliated with Eggoz.</p>',
  );

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.table(
    products.map((p) => ({
      id: p.id,
      thumb: `${p.image.thumb.width}px ${kb(p.image.thumb.bytes)}`,
      full: `${p.image.full.width}px ${kb(p.image.full.bytes)}`,
      blurhash: p.image.blurhash.length,
    })),
  );
  const thumbs = products.reduce((s, p) => s + p.image.thumb.bytes, 0);
  console.log(`home.json ${kb(Buffer.byteLength(homeJson))} · all card thumbs ${kb(thumbs)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
