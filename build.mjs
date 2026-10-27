// Builds the static gallery in dist/: reads all paintings from Airtable, stores each picture once in cache/
// (Airtable picture links expire after a few hours), makes small and large WebP versions, and writes one HTML page.
// Needs a read-only Airtable token in .airtable-token. Usage: npm run build, or npm run deploy to also publish.
import fs from 'fs';
import sharp from 'sharp';

const BASE = 'appKjIv7utFmqAkdT', TABLE = 'Paintings';
const token = fs.readFileSync('.airtable-token', 'utf8').trim();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function records() {
  const out = [];
  let offset = '';
  do {
    const r = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}?pageSize=100${offset && `&offset=${offset}`}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`Airtable: ${r.status} ${await r.text()}`);
    const page = await r.json();
    out.push(...page.records);
    offset = page.offset || '';
  } while (offset);
  return out;
}

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/img', { recursive: true });
fs.mkdirSync('cache', { recursive: true });

const paintings = [];
for (const rec of await records()) {
  const pic = rec.fields.Bild?.[0];
  if (!pic) continue;
  const src = `cache/${pic.id}`;
  if (!fs.existsSync(src)) fs.writeFileSync(src, Buffer.from(await (await fetch(pic.url)).arrayBuffer()));
  const img = sharp(src).rotate();
  const { width, height } = await img.metadata().then((m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  await img.clone().resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(`dist/img/${pic.id}-s.webp`);
  await img.clone().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(`dist/img/${pic.id}-l.webp`);
  const f = rec.fields;
  paintings.push({ id: pic.id, title: f.Titel || 'Ohne Titel', size: f['Breite (cm)'] && f['Höhe (cm)'] ? `${f['Breite (cm)']} × ${f['Höhe (cm)']} cm` : '', ratio: width / height });
}

const tiles = paintings
  .map((p, i) => {
    const h = Math.round(600 / Math.max(p.ratio, 1)), w = Math.round(h * p.ratio);
    return `<figure><button data-i="${i}" aria-label="${esc(p.title)} vergrößern"><img src="img/${p.id}-s.webp" width="${w}" height="${h}" alt="${esc(p.title)}"${i < 8 ? '' : ' loading="lazy"'} decoding="async"></button><figcaption>${esc(p.title)}<span>${esc(p.size)}</span></figcaption></figure>`;
  })
  .join('\n');

const page = fs.readFileSync('page.html', 'utf8')
  .replace('{{count}}', paintings.length)
  .replace('{{tiles}}', tiles)
  .replace('{{data}}', JSON.stringify(paintings.map((p) => [p.id, p.title, p.size])).replace(/</g, '\\u003c'));
fs.writeFileSync('dist/index.html', page);
fs.writeFileSync('dist/_headers', '/img/*\n  Cache-Control: public, max-age=31536000, immutable\n');
await sharp('static/cover.png').flatten({ background: '#ffffff' }).resize(1200, 630, { fit: 'contain', background: '#ffffff' }).jpeg({ quality: 85 }).toFile('dist/og.jpg');
await sharp('static/cover.png').resize(180, 180).png().toFile('dist/icon.png');
console.log(paintings.length, 'paintings');
