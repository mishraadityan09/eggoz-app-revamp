/**
 * Local copy of the CDN for development: serves ./public with the same cache headers
 * as vercel.json. Usage: node serve.mjs [port=8787]  (emulator: adb reverse tcp:8787 tcp:8787)
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.argv[2] ?? 8787);
const TYPES = { '.json': 'application/json', '.webp': 'image/webp', '.html': 'text/html', '.txt': 'text/plain' };

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const file = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    const cache = urlPath.startsWith('/img/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=60, stale-while-revalidate=86400';
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': cache });
    res.end(body);
    console.log(`200 ${urlPath} ${body.length}B`);
  } catch {
    res.writeHead(404).end();
    console.log(`404 ${urlPath}`);
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
