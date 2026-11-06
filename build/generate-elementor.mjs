// Builds the four importable Elementor templates for the Clinica Movimento site.
//
//   node build/generate-elementor.mjs
//
// Reads build/content.json (all pt-BR copy lives there, never in this file) and
// writes one JSON per page into elementor/.
//
// Carried over from demo 1, where each of these was found the hard way:
//   - containers use `css_classes`, widgets use `_css_classes`
//   - containers are always `full`; `boxed` injects an .e-con-inner wrapper
//     that breaks every grid
//   - styling lives in the child theme, not in widget settings

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  accordion, button, container, esc, googleMaps, heading, image, template, text,
} from './elementor-kit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const c = JSON.parse(readFileSync(join(ROOT, 'build', 'content.json'), 'utf8'));

const PLACEHOLDER = '/wp-content/plugins/elementor/assets/images/placeholder.png';

const waLink = `https://wa.me/${c.site.whatsapp}?text=${encodeURIComponent(c.site.whatsappMensagem)}`;
const telLink = `tel:${c.site.telefoneLink}`;
const url = (slug) => (slug ? `/${slug}/` : '/');

// ---------------------------------------------------------------- helpers

const section = (modifier, children) =>
  container({
    cls: `fm-section fm-section--${modifier}`,
    children: [container({ cls: 'fm-wrap', inner: true, children })],
  });

const badge = (label) => heading(label, { tag: 'span', cls: 'fm-badge' });
const h1 = (t) => heading(t, { tag: 'h1', cls: 'fm-h1' });
const h2 = (t) => heading(t, { tag: 'h2', cls: 'fm-h2' });
const h3 = (t) => heading(t, { tag: 'h3', cls: 'fm-h3' });
const lead = (body) => text(`<p>${body}</p>`, { cls: 'fm-lead' });
const para = (body) => text(`<p>${body}</p>`);

const list = (items, cls = 'fm-checks') =>
  text(`<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`, { cls });

const ctaPrimary = (label = c.ctaGlobal.primario) =>
  button(label, url('contato'), { cls: 'fm-btn fm-btn--primary' });

const ctaWhats = (label = c.ctaGlobal.secundario) =>
  button(label, waLink, { cls: 'fm-btn fm-btn--ghost', newTab: true });

/** Cabecalho de pagina interna: badge, titulo e subtitulo. */
const pageHero = (hero) =>
  section('pagehero', [
    badge(hero.badge),
    h1(hero.h1),
    lead(hero.sub),
  ]);

// ---------------------------------------------------------------- home

function paginaHome() {
  const hero = section('hero', [
    container({
      cls: 'fm-hero',
      inner: true,
      children: [
        container({
          cls: 'fm-hero__copy',
          inner: true,
          children: [
            badge(c.home.hero.badge),
            h1(c.home.hero.h1),
            lead(c.home.hero.sub),
            container({
              cls: 'fm-actions',
              inner: true,
              children: [
                ctaPrimary(c.home.hero.cta),
                button(c.home.hero.ctaSecundario, url('servicos'), { cls: 'fm-btn fm-btn--outline' }),
              ],
            }),
          ],
        }),
        container({
          cls: 'fm-hero__art',
          inner: true,
          // LCP desta pagina: nao pode ser lazy.
          children: [image(PLACEHOLDER, c.home.hero.imageAlt, { cls: 'fm-hero__img', lazy: false })],
        }),
      ],
    }),
  ]);

  const pilares = section('pilares', [
    badge(c.home.pilares.badge),
    h2(c.home.pilares.h2),
    container({
      cls: 'fm-grid fm-grid--3',
      inner: true,
      children: c.home.pilares.itens.map((item) =>
        container({
          cls: `fm-card fm-card--icon fm-icon-${item.icon}`,
          inner: true,
          children: [h3(item.titulo), para(item.texto)],
        }),
      ),
    }),
  ]);

  const servicos = section('servicos-destaque', [
    badge(c.home.servicosDestaque.badge),
    h2(c.home.servicosDestaque.h2),
    lead(c.home.servicosDestaque.intro),
    container({
      cls: 'fm-grid fm-grid--3',
      inner: true,
      children: c.servicos.lista.map((s) =>
        container({
          cls: `fm-service fm-icon-${s.icon}`,
          inner: true,
          children: [h3(s.titulo), para(s.resumo)],
        }),
      ),
    }),
    button(c.home.servicosDestaque.cta, url('servicos'), { cls: 'fm-btn fm-btn--outline' }),
  ]);

  const jornada = section('jornada', [
    badge(c.home.jornada.badge),
    h2(c.home.jornada.h2),
    container({
      cls: 'fm-steps',
      inner: true,
      children: c.home.jornada.etapas.map((e) =>
        container({
          cls: 'fm-step',
          inner: true,
          children: [
            text(`<p class="fm-step__num">${esc(e.numero)}</p>`, { cls: 'fm-step__num-wrap' }),
            h3(e.titulo),
            para(e.texto),
          ],
        }),
      ),
    }),
  ]);

  const convenios = section('convenios', [
    container({
      cls: 'fm-split',
      inner: true,
      children: [
        container({
          cls: 'fm-split__copy',
          inner: true,
          children: [badge(c.home.convenios.badge), h2(c.home.convenios.h2), para(c.home.convenios.texto)],
        }),
        container({
          cls: 'fm-split__aside',
          inner: true,
          children: [list(c.home.convenios.itens)],
        }),
      ],
    }),
  ]);

  const local = section('localizacao', [
    container({
      cls: 'fm-split',
      inner: true,
      children: [
        container({
          cls: 'fm-split__copy',
          inner: true,
          children: [
            badge(c.home.localizacao.badge),
            h2(c.home.localizacao.h2),
            para(c.home.localizacao.texto),
            text(`<p class="fm-address">${c.site.endereco.replace(/\n/g, '<br>')}</p>`, { cls: 'fm-address-wrap' }),
            button(c.home.localizacao.cta, url('contato'), { cls: 'fm-btn fm-btn--outline' }),
          ],
        }),
        container({
          cls: 'fm-split__map',
          inner: true,
          children: [googleMaps(c.site.mapaConsulta, { zoom: 15, height: 380, cls: 'fm-map' })],
        }),
      ],
    }),
  ]);

  const fim = section('cta', [
    h2(c.home.chamadaFinal.h2),
    lead(c.home.chamadaFinal.texto),
    container({
      cls: 'fm-actions',
      inner: true,
      children: [ctaPrimary(c.home.chamadaFinal.cta), ctaWhats(c.home.chamadaFinal.ctaSecundario)],
    }),
  ]);

  return [hero, pilares, servicos, jornada, convenios, local, fim];
}

// ---------------------------------------------------------------- sobre

function paginaSobre() {
  const historia = section('historia', [
    container({
      cls: 'fm-split',
      inner: true,
      children: [
        container({
          cls: 'fm-split__copy',
          inner: true,
          children: [h2(c.sobre.historia.h2), text(c.sobre.historia.paragrafos.map((p) => `<p>${p}</p>`).join(''))],
        }),
        container({
          cls: 'fm-split__art',
          inner: true,
          children: [image(PLACEHOLDER, 'Recepção da Clínica Movimento', { cls: 'fm-rounded' })],
        }),
      ],
    }),
  ]);

  const equipe = section('equipe', [
    badge(c.sobre.equipe.badge),
    h2(c.sobre.equipe.h2),
    lead(c.sobre.equipe.intro),
    container({
      cls: 'fm-grid fm-grid--3',
      inner: true,
      children: c.sobre.equipe.membros.map((m) =>
        container({
          cls: 'fm-person',
          inner: true,
          children: [
            image(PLACEHOLDER, m.imageAlt, { cls: 'fm-person__img' }),
            h3(m.nome),
            text(`<p class="fm-person__role">${esc(m.cargo)}</p>`, { cls: 'fm-person__role-wrap' }),
            text(`<p class="fm-person__formation">${esc(m.formacao)}</p>`, { cls: 'fm-person__formation-wrap' }),
            para(m.bio),
          ],
        }),
      ),
    }),
  ]);

  const estrutura = section('estrutura', [
    badge(c.sobre.estrutura.badge),
    h2(c.sobre.estrutura.h2),
    lead(c.sobre.estrutura.texto),
    container({
      cls: 'fm-grid fm-grid--2',
      inner: true,
      children: c.sobre.estrutura.itens.map((i) =>
        container({ cls: 'fm-card', inner: true, children: [h3(i.titulo), para(i.texto)] }),
      ),
    }),
  ]);

  const valores = section('valores', [
    badge(c.sobre.valores.badge),
    h2(c.sobre.valores.h2),
    container({
      cls: 'fm-grid fm-grid--3',
      inner: true,
      children: c.sobre.valores.itens.map((i) =>
        container({ cls: 'fm-value', inner: true, children: [h3(i.titulo), para(i.texto)] }),
      ),
    }),
  ]);

  const fim = section('cta', [
    h2(c.home.chamadaFinal.h2),
    lead(c.home.chamadaFinal.texto),
    container({ cls: 'fm-actions', inner: true, children: [ctaPrimary(), ctaWhats()] }),
  ]);

  return [pageHero(c.sobre.hero), historia, equipe, estrutura, valores, fim];
}

// ---------------------------------------------------------------- servicos

function paginaServicos() {
  const lista = section('servicos-lista', [
    container({
      cls: 'fm-services',
      inner: true,
      children: c.servicos.lista.map((s) =>
        container({
          cls: `fm-service-full fm-icon-${s.icon}`,
          inner: true,
          children: [
            h3(s.titulo),
            text(`<p class="fm-service__lead">${esc(s.resumo)}</p>`, { cls: 'fm-service__lead-wrap' }),
            para(s.texto),
            text(
              `<p class="fm-service__label">Indicações mais comuns</p><ul class="fm-checks">${s.indicacoes
                .map((i) => `<li>${esc(i)}</li>`)
                .join('')}</ul>`,
              { cls: 'fm-service__ind' },
            ),
          ],
        }),
      ),
    }),
  ]);

  const aviso = section('aviso', [
    container({
      cls: 'fm-notice',
      inner: true,
      children: [h3(c.servicos.aviso.titulo), para(c.servicos.aviso.texto)],
    }),
  ]);

  const fim = section('cta', [
    h2(c.servicos.cta.h2),
    lead(c.servicos.cta.texto),
    container({ cls: 'fm-actions', inner: true, children: [ctaPrimary(c.servicos.cta.cta), ctaWhats()] }),
  ]);

  return [pageHero(c.servicos.hero), lista, aviso, fim];
}

// ---------------------------------------------------------------- contato

function paginaContato() {
  const alvo = (canal) =>
    canal.tipo === 'whatsapp' ? waLink : canal.tipo === 'tel' ? telLink : `mailto:${c.site.email}`;

  const canais = section('canais', [
    container({
      cls: 'fm-grid fm-grid--3',
      inner: true,
      children: c.contato.canais.map((canal) =>
        container({
          cls: `fm-channel fm-icon-${canal.icon}`,
          inner: true,
          children: [
            h3(canal.titulo),
            text(`<p class="fm-channel__value">${esc(canal.valor)}</p>`, { cls: 'fm-channel__value-wrap' }),
            text(`<p class="fm-channel__hint">${esc(canal.detalhe)}</p>`, { cls: 'fm-channel__hint-wrap' }),
            button(
              canal.tipo === 'whatsapp' ? 'Abrir conversa' : canal.tipo === 'tel' ? 'Ligar agora' : 'Enviar e-mail',
              alvo(canal),
              { cls: 'fm-btn fm-btn--outline fm-btn--sm', newTab: canal.tipo === 'whatsapp' },
            ),
          ],
        }),
      ),
    }),
  ]);

  const horarios = section('horarios', [
    container({
      cls: 'fm-split',
      inner: true,
      children: [
        container({
          cls: 'fm-split__copy',
          inner: true,
          children: [
            badge(c.contato.horarios.badge),
            h2(c.contato.horarios.h2),
            text(
              `<ul class="fm-hours">${c.site.horarios
                .map((h) => `<li><span>${esc(h.dias)}</span><strong>${esc(h.horario)}</strong></li>`)
                .join('')}</ul>`,
              { cls: 'fm-hours-wrap' },
            ),
          ],
        }),
        container({
          cls: 'fm-split__aside',
          inner: true,
          children: [
            badge(c.contato.primeiraVisita.badge),
            h2(c.contato.primeiraVisita.h2),
            list(c.contato.primeiraVisita.itens),
            text(`<p class="fm-note">${c.contato.primeiraVisita.nota}</p>`, { cls: 'fm-note-wrap' }),
          ],
        }),
      ],
    }),
  ]);

  const endereco = section('endereco', [
    badge(c.contato.endereco.badge),
    h2(c.contato.endereco.h2),
    text(`<p class="fm-address">${c.site.endereco.replace(/\n/g, '<br>')}</p>`, { cls: 'fm-address-wrap' }),
    container({ cls: 'fm-map-wrap', inner: true, children: [googleMaps(c.site.mapaConsulta, { zoom: 16, height: 420, cls: 'fm-map' })] }),
    container({
      cls: 'fm-grid fm-grid--2',
      inner: true,
      children: c.contato.endereco.transporte.map((t) =>
        container({ cls: 'fm-card', inner: true, children: [h3(t.titulo), para(t.texto)] }),
      ),
    }),
  ]);

  return [pageHero(c.contato.hero), canais, horarios, endereco];
}

// ---------------------------------------------------------------- assemble

const PAGINAS = [
  { arquivo: 'home', titulo: 'Clinica Movimento - Inicio', secoes: paginaHome() },
  { arquivo: 'sobre', titulo: 'Clinica Movimento - Sobre', secoes: paginaSobre() },
  { arquivo: 'servicos', titulo: 'Clinica Movimento - Servicos', secoes: paginaServicos() },
  { arquivo: 'contato', titulo: 'Clinica Movimento - Contato', secoes: paginaContato() },
];

// ---------------------------------------------------------------- validate

function validate(tpl, idsGlobais) {
  const problemas = [];
  let widgets = 0;
  let containers = 0;
  const tiposDeWidget = {};

  const walk = (node, path) => {
    if (!node.id) problemas.push(`${path}: sem id`);
    if (idsGlobais.has(node.id)) problemas.push(`${path}: id repetido ${node.id}`);
    idsGlobais.add(node.id);

    if (node.elType === 'widget') {
      widgets += 1;
      if (!node.widgetType) problemas.push(`${path}: widget sem widgetType`);
      tiposDeWidget[node.widgetType] = (tiposDeWidget[node.widgetType] || 0) + 1;
    } else if (node.elType === 'container') {
      containers += 1;
      if (!Array.isArray(node.elements)) problemas.push(`${path}: container sem elements[]`);
      // Lição da demo 1: boxed injeta .e-con-inner e quebra todo grid.
      if (node.settings?.content_width !== 'full') {
        problemas.push(`${path}: container nao e full (quebra grid)`);
      }
      // Lição da demo 1: container usa css_classes, nao _css_classes.
      if (node.settings?._css_classes) {
        problemas.push(`${path}: container usando _css_classes em vez de css_classes`);
      }
    } else {
      problemas.push(`${path}: elType desconhecido ${node.elType}`);
    }

    (node.elements || []).forEach((filho, i) => walk(filho, `${path}>${node.elType}[${i}]`));
  };

  tpl.content.forEach((node, i) => walk(node, `content[${i}]`));

  for (const chave of ['content', 'page_settings', 'version', 'title', 'type']) {
    if (!(chave in tpl)) problemas.push(`template: falta a chave ${chave}`);
  }

  return { problemas, widgets, containers, tiposDeWidget };
}

const idsGlobais = new Set();
let erros = 0;
const resumo = [];
const todosOsTipos = {};

for (const pagina of PAGINAS) {
  const tpl = template(pagina.titulo, pagina.secoes);
  const rel = validate(tpl, idsGlobais);

  if (rel.problemas.length) {
    erros += rel.problemas.length;
    console.error(`\n${pagina.arquivo}: ${rel.problemas.length} problema(s)`);
    rel.problemas.slice(0, 8).forEach((p) => console.error('  - ' + p));
    continue;
  }

  const json = JSON.stringify(tpl, null, 2);
  writeFileSync(join(ROOT, 'elementor', `${pagina.arquivo}.json`), json, 'utf8');

  for (const [t, n] of Object.entries(rel.tiposDeWidget)) todosOsTipos[t] = (todosOsTipos[t] || 0) + n;

  resumo.push({
    pagina: pagina.arquivo,
    secoes: tpl.content.length,
    containers: rel.containers,
    widgets: rel.widgets,
    kb: (Buffer.byteLength(json, 'utf8') / 1024).toFixed(1),
  });
}

if (erros) {
  console.error(`\n${erros} problema(s) -- nenhum arquivo invalido foi escrito.`);
  process.exit(1);
}

console.log('Templates do Elementor gerados\n');
console.log('pagina'.padEnd(12), 'secoes'.padEnd(8), 'containers'.padEnd(12), 'widgets'.padEnd(9), 'KB');
console.log('-'.repeat(52));
for (const r of resumo) {
  console.log(
    r.pagina.padEnd(12),
    String(r.secoes).padEnd(8),
    String(r.containers).padEnd(12),
    String(r.widgets).padEnd(9),
    r.kb,
  );
}
console.log('-'.repeat(52));
console.log(`ids unicos entre as 4 paginas: ${idsGlobais.size}`);
console.log(`widgets usados: ${Object.entries(todosOsTipos).map(([t, n]) => `${t} ${n}`).join(', ')}`);
