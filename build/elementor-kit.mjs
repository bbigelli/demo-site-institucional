// Minimal, dependency-free builder for Elementor page templates (3.16+ flexbox containers).
//
// Design decision: widgets carry SEMANTIC CSS CLASSES, not inline style settings.
// Elementor can embed every typography/spacing property into each widget's settings,
// but that produces a huge fragile JSON and makes Elementor emit per-widget CSS files.
// Instead the structure lives here and the styling lives in the child theme stylesheet:
// one cacheable file, far better PageSpeed, and the client can still edit every text
// inside Elementor.

const used = new Set();
let seq = 0;

/** Deterministic Elementor-looking id. Same input tree -> same ids on every run. */
export function id() {
  let candidate;
  do {
    seq += 1;
    candidate = ((seq * 2654435761) % 0xfffffff).toString(16).padStart(7, '0');
  } while (used.has(candidate));
  used.add(candidate);
  return candidate;
}

export function resetIds() {
  used.clear();
  seq = 0;
}

/** Flexbox container.
 *
 * The custom-class control is named differently per element type, and getting
 * this wrong fails silently -- the import succeeds and the classes simply
 * never reach the DOM:
 *
 *   container -> css_classes   (no underscore)
 *   widget    -> _css_classes  (leading underscore)
 *
 * Verified against elementor.config.elements.container.controls in a live
 * editor, not guessed.
 */
/* Default is 'full', not 'boxed', and that matters more than it looks.
 *
 * A boxed container renders an extra .e-con-inner wrapper between itself and
 * its children:
 *
 *   .e-con-boxed            <- our class, where display:grid lands
 *     .e-con-inner          <- the only child, so the grid has ONE cell
 *       .tc-card            <- real children, now grandchildren, stacked
 *
 * Every grid and flex rule we write would apply to a one-child element and do
 * nothing. With 'full' there is no wrapper and the children are direct, so the
 * layout works. Max width is handled by .tc-wrap in the stylesheet, which is
 * where it belongs. */
export function container({ cls = '', children = [], width = 'full', inner = false, extra = {} }) {
  const settings = { content_width: width, ...extra };
  if (cls) settings.css_classes = cls;
  return { id: id(), elType: 'container', settings, elements: children, isInner: inner };
}

function widget(widgetType, settings, cls) {
  if (cls) settings._css_classes = cls;
  return { id: id(), elType: 'widget', widgetType, settings };
}

export function heading(title, { tag = 'h2', cls = '' } = {}) {
  return widget('heading', { title, header_size: tag }, cls);
}

/** Rich text. Accepts raw HTML -- Elementor keeps it editable in the TinyMCE editor. */
export function text(html, { cls = '' } = {}) {
  return widget('text-editor', { editor: html }, cls);
}

export function button(label, url, { cls = '', ariaLabel = '', newTab = false } = {}) {
  const settings = {
    text: label,
    link: { url, is_external: newTab ? 'on' : '', nofollow: '', custom_attributes: '' },
  };
  if (ariaLabel) settings.button_css_id = '';
  return widget('button', settings, cls);
}

export function image(url, alt, { cls = '', lazy = true } = {}) {
  return widget(
    'image',
    {
      image: { url, id: '', alt, source: 'library' },
      image_size: 'full',
      lazy_load: lazy ? 'yes' : '',
    },
    cls,
  );
}

export function accordion(items, { cls = '' } = {}) {
  return widget(
    'accordion',
    {
      tabs: items.map((it) => ({
        _id: id(),
        tab_title: it.q,
        tab_content: `<p>${it.a}</p>`,
      })),
      faq_schema: 'yes',
    },
    cls,
  );
}

export function starRating(rating, { cls = '' } = {}) {
  // star_unicode instead of star_fontawesome: the Font Awesome library costs ~70KB
  // in the critical path, and this page only needs the glyph.
  return widget('star-rating', { rating, stars: '5', star_style: 'star_unicode' }, cls);
}

/** Raw HTML escape hatch -- used only where no native widget maps cleanly. */
export function rawHtml(html, { cls = '' } = {}) {
  return widget('html', { html }, cls);
}

/** Google Maps embed.
 *
 * The native widget takes a plain address string and builds the embed URL
 * itself -- no API key needed. Preferred over a hand-written iframe because
 * the client can change the address in the Elementor panel.
 *
 * The iframe is lazy by default in Elementor, which is what we want: the map
 * sits below the fold and an eager iframe would compete with the LCP.
 */
export function googleMaps(address, { zoom = 15, height = 400, cls = '' } = {}) {
  return widget(
    'google_maps',
    {
      address,
      zoom: { unit: 'px', size: zoom, sizes: [] },
      height: { unit: 'px', size: height, sizes: [] },
    },
    cls,
  );
}

export function spacer(size, { cls = '' } = {}) {
  return widget('spacer', { space: { unit: 'px', size, sizes: [] } }, cls);
}

/** Wrap top-level containers into the file Elementor's importer expects. */
export function template(title, content) {
  return { content, page_settings: [], version: '0.4', title, type: 'page' };
}

/** Escape a string for safe inclusion inside an HTML text node or attribute. */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
