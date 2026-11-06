// Reduz o export do Simply Static ao que a pagina realmente usa.
//
//   node build/prune-static.mjs
//
// O crawler do Simply Static varre o wp-includes inteiro e traz coisas que
// uma landing nunca carrega: o TinyMCE (o editor do WordPress), os blocos
// do Gutenberg, o mediaelement, os smilies. No demo 1 isso era 68MB e 1655
// arquivos para uma pagina so.
//
// Este script le o HTML, segue as referencias de verdade -- incluindo as
// url() de dentro dos CSS, recursivamente -- e copia apenas esses arquivos
// para site-dist/. O site/ original fica intacto.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'site');
const OUT = join(ROOT, 'site-dist');

if (!existsSync(SRC)) {
  console.error('pasta site/ nao encontrada. Rode o export do Simply Static antes.');
  process.exit(1);
}

/** Normaliza uma referencia encontrada no HTML/CSS para caminho relativo a raiz do site. */
function toSitePath(ref, fromDir) {
  let r = ref.trim().replace(/^['"]|['"]$/g, '');
  if (!r || r.startsWith('data:') || r.startsWith('#') || r.startsWith('mailto:')) return null;
  if (/^[a-z]+:\/\//i.test(r) || r.startsWith('//')) return null; // externo
  r = r.split('#')[0].split('?')[0];
  if (!r) return null;
  const abs = r.startsWith('/') ? r.slice(1) : posix.normalize(posix.join(fromDir, r));
  return abs.startsWith('..') ? null : abs;
}

const usados = new Set();
const fila = [];

/** Coleta referencias de um HTML. */
function varrerHtml(conteudo, fromDir) {
  const padroes = [
    /<(?:link|script|img|source|iframe)[^>]+(?:href|src)\s*=\s*["']([^"']+)["']/gi,
    /srcset\s*=\s*["']([^"']+)["']/gi,
    /url\(([^)]+)\)/gi,
  ];
  for (const p of padroes) {
    for (const m of conteudo.matchAll(p)) {
      const bruto = m[1];
      // srcset tem varias urls separadas por virgula
      const candidatos = p.source.includes('srcset') ? bruto.split(',').map((s) => s.trim().split(/\s+/)[0]) : [bruto];
      for (const c of candidatos) {
        const p2 = toSitePath(c, fromDir);
        if (p2 && !usados.has(p2)) { usados.add(p2); fila.push(p2); }
      }
    }
  }
}

/** Lista todo .html do export -- este site tem quatro paginas, nao uma. */
function todosOsHtml(dir, base = '') {
  const achados = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? posix.join(base, e.name) : e.name;
    if (e.isDirectory()) {
      achados.push(...todosOsHtml(join(dir, e.name), rel));
    } else if (/\.html$/i.test(e.name)) {
      achados.push(rel);
    }
  }
  return achados;
}

// Ponto de partida: todas as paginas. Partir so do index deixaria de fora
// tudo que apenas as paginas internas carregam -- o mapa, por exemplo.
const raizHtml = todosOsHtml(SRC);

if (!raizHtml.length) {
  console.error('nenhum .html encontrado em site/. Rode o export do Simply Static antes.');
  process.exit(1);
}

for (const h of raizHtml) { usados.add(h); fila.push(h); }

// Percorre a fila, seguindo CSS e HTML recursivamente
while (fila.length) {
  const rel = fila.shift();
  const full = join(SRC, rel);
  if (!existsSync(full) || !statSync(full).isFile()) continue;
  if (!/\.(html|css)$/i.test(rel)) continue;

  const conteudo = readFileSync(full, 'utf8');
  varrerHtml(conteudo, posix.dirname(rel));
}

// Arquivos que valem a pena manter mesmo sem referencia direta no HTML
for (const extra of ['favicon.ico', 'robots.txt', 'manifest.json']) {
  if (existsSync(join(SRC, extra))) usados.add(extra);
}

// Copia
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let copiados = 0;
let bytes = 0;
const ausentes = [];

for (const rel of usados) {
  const from = join(SRC, rel);
  if (!existsSync(from) || !statSync(from).isFile()) { ausentes.push(rel); continue; }
  const to = join(OUT, rel);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copiados += 1;
  bytes += statSync(to).size;
}

// Arquivos de deploy (vercel.json e afins). Vivem em deploy/ porque o
// site-dist/ e recriado do zero a cada execucao.
const DEPLOY = join(ROOT, 'deploy');
let extras = 0;
if (existsSync(DEPLOY)) {
  for (const e of readdirSync(DEPLOY, { withFileTypes: true })) {
    if (!e.isFile() || e.name === 'README.md') continue;

    // Valida JSON antes de publicar. Um vercel.json malformado nao quebra
    // o build da Vercel: ela simplesmente ignora o arquivo, e os headers
    // de cache e seguranca somem sem aviso nenhum.
    if (e.name.endsWith('.json')) {
      const bruto = readFileSync(join(DEPLOY, e.name), 'utf8');
      try {
        JSON.parse(bruto);
      } catch (err) {
        console.error(`deploy/${e.name} nao e JSON valido: ${err.message}`);
        process.exit(1);
      }
    }

    copyFileSync(join(DEPLOY, e.name), join(OUT, e.name));
    extras += 1;
  }
}

// Estatistica do original, para comparar
function medir(dir) {
  let n = 0, b = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { const r = medir(p); n += r.n; b += r.b; }
    else { n += 1; b += statSync(p).size; }
  }
  return { n, b };
}

const antes = medir(SRC);
const mb = (x) => (x / 1024 / 1024).toFixed(1) + 'MB';

console.log('Poda do export estatico');
console.log(`  paginas: ${raizHtml.length} (${raizHtml.join(', ')})`);
console.log(`  antes  : ${antes.n} arquivos, ${mb(antes.b)}`);
console.log(`  depois : ${copiados} arquivos, ${mb(bytes)}`);
console.log(`  reducao: ${(100 - (bytes / antes.b) * 100).toFixed(1)}% do peso`);
if (ausentes.length) {
  console.log(`  referencias nao encontradas no export (${ausentes.length}):`);
  ausentes.slice(0, 10).forEach((a) => console.log('    - ' + a));
}
if (extras) console.log(`  deploy : ${extras} arquivo(s) de deploy/ copiado(s)`);
console.log(`  saida  : site-dist/`);
