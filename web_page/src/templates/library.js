// Builds the static book readers from the book data in src/data/books/.
// Called by scripts/build.js (npm run build). No dependencies.
// Output: public/library/<slug>.html for each book, plus cards() for bibliografia.html.

const fs = require('fs');
const path = require('path');

const DATA = path.resolve(__dirname, '..', 'data');
const LIB = path.resolve(__dirname, '..', '..', 'public', 'library'); // output folder
const dims = require(path.join(DATA, 'image-dimensions.json'));
// book images, as seen from a page in public/library/
const IMG = '../assets/images/library/';

const books = ['espais', 'mirador', 'passeig', 'mare-terra', 'cami']
  .map((f) => Object.assign({ file: f }, require(path.join(DATA, 'books', f + '.js'))))
  .sort((a, b) => a.order - b.order);

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isT = (v) => v && typeof v === 'object' && 'en' in v;
const br = (s) => String(s).replace(/\n/g, '<br>');

// English in the markup, Catalan and Spanish beside it (read by garden.js)
function tx(tag, v, attrs = '', fmt = (s) => s) {
  if (!isT(v)) return `<${tag}${attrs}>${fmt(v)}</${tag}>`;
  return `<${tag}${attrs} data-ca="${esc(fmt(v.ca))}" data-es="${esc(fmt(v.es))}">${fmt(v.en)}</${tag}>`;
}
const aria = (v) => isT(v) ? ` aria-label="${esc(v.en)}" data-ca-aria="${esc(v.ca)}" data-es-aria="${esc(v.es)}"` : ` aria-label="${esc(v)}"`;
const alt = (v) => ` alt="${esc(v.en)}" data-ca-alt="${esc(v.ca)}" data-es-alt="${esc(v.es)}"`;
const t = (ca, es, en) => ({ ca, es, en });
const size = (p) => { const d = dims[p]; return d ? ` width="${d[0]}" height="${d[1]}"` : ''; };

const UI = {
  library: t('Llibres', 'Libros', 'Books'),
  contents: t('Índex', 'Índice', 'Contents'),
  original: t('Pàgina original', 'Página original', 'Original page'),
  originals: t('Pàgines originals', 'Páginas originales', 'Original pages'),
  openPage: t('Obre la pàgina original', 'Abre la página original', 'Open the original page'),
  close: t('Tanca', 'Cerrar', 'Close'),
  prev: t('Anterior', 'Anterior', 'Previous'),
  next: t('Següent', 'Siguiente', 'Next'),
  backTop: t('Torna a dalt', 'Volver arriba', 'Back to top'),
  allBooks: t('Tots els llibres', 'Todos los libros', 'All books'),
  nextBook: t('Llibre següent', 'Libro siguiente', 'Next book'),
  chapters: (n) => t(`${n} capítols`, `${n} capítulos`, `${n} chapters`),
  pages: (n) => t(`Llibre digital · ${n} pàgines`, `Libro digital · ${n} páginas`, `Digital book · ${n} pages`),
  read: t('Llegeix', 'Leer', 'Read'),
  sourceNote: (b) => t(
    `Transcrit del llibre original que es conserva a El Xop (${b.source.pages} pàgines). El text original és en català; les versions en castellà i anglès són traduccions.`,
    `Transcrito del libro original que se conserva en El Xop (${b.source.pages} páginas). El texto original está en catalán; las versiones en castellano e inglés son traducciones.`,
    `Transcribed from the original printed book kept at El Xop (${b.source.pages} pages). The original text is in Catalan; the Spanish and English versions are translations.`
  ),
};

// ---------- blocks ----------
function block(b) {
  if (b.p) return tx('p', b.p);
  if (b.h) return tx('h3', b.h, ' class="sub"');
  if (b.note) return tx('p', b.note, ' class="note"');
  if (b.ul) return `<ul class="list">${b.ul.map((i) => tx('li', i)).join('')}</ul>`;
  if (b.steps) return `<ol class="steps">${b.steps.map((i) => tx('li', i)).join('')}</ol>`;
  if (b.quote) return `<blockquote class="quote">${tx('p', b.quote)}${b.cite ? tx('cite', b.cite) : ''}</blockquote>`;
  if (b.verse) return `<blockquote class="verse">${tx('p', b.verse, '', br)}${b.cite ? tx('cite', b.cite) : ''}</blockquote>`;
  if (b.terms) return `<dl class="terms">${b.terms.map(([k, v]) => `<div>${tx('dt', k)}${tx('dd', v)}</div>`).join('')}</dl>`;
  if (b.rules) return `<dl class="rules">${b.rules.map(([k, v]) => `<div>${tx('dt', k)}${tx('dd', v)}</div>`).join('')}</dl>`;
  if (b.fig) return `<figure class="fig${b.tall ? ' fig-tall' : ''}"><img src="${IMG}${b.fig}"${size(b.fig)} loading="lazy" decoding="async"${alt(b.cap)}>${tx('figcaption', b.cap)}</figure>`;
  if (b.more) return `<p class="more"><a href="${b.more}.html"${''}>${tx('span', b.label)} <span aria-hidden="true">→</span></a></p>`;
  throw new Error('Unknown block: ' + JSON.stringify(b).slice(0, 80));
}

function scans(sec, book) {
  const label = sec.pages.length > 1 ? UI.originals : UI.original;
  const items = sec.pages.map((id) => {
    const n = book._pageIndex[id];
    return `<li><button type="button" class="scan" data-page="${n}"${aria(t(`${UI.openPage.ca} ${n + 1}`, `${UI.openPage.es} ${n + 1}`, `${UI.openPage.en} ${n + 1}`))}>` +
      `<img src="${IMG}pages/${id}-sm.webp"${size('pages/' + id + '-sm.webp')} loading="lazy" decoding="async" alt=""></button></li>`;
  }).join('');
  return `<aside class="scans">${tx('h3', label, ' class="scans-title"')}<ul>${items}</ul></aside>`;
}

const C = require('./layout.js');

// ---------- a reader page ----------
function page(book, i) {
  // number every scan in reading order (a page can be cited by two chapters)
  const order = [];
  book.sections.forEach((s) => s.pages.forEach((p) => { if (!order.includes(p)) order.push(p); }));
  book._pageIndex = Object.fromEntries(order.map((p, n) => [p, n]));
  const next = books[(i + 1) % books.length];

  const toc = book.sections.map((s, n) =>
    `<li><a href="#${s.id}"><span class="toc-n">${String(n + 1).padStart(2, '0')}</span>${tx('span', s.title)}</a></li>`).join('');

  const sections = book.sections.map((s, n) => `
      <section class="chapter" id="${s.id}">
        <p class="chapter-n" aria-hidden="true">${String(n + 1).padStart(2, '0')}</p>
        ${tx('h2', s.title, ' class="chapter-title"')}
        <div class="chapter-body">
          <div class="prose">
            ${s.blocks.map(block).join('\n            ')}
          </div>
          ${scans(s, book)}
        </div>
      </section>`).join('\n');

  const pageList = JSON.stringify(order);

  return `${C.head(`${book.title.ca} · El Xop`, book.summary.en, '../')}
<body class="reader" style="--book: ${book.color}">

${C.header('../', 'bibliografia')}

<main id="top">
  <section class="book-hero wrap">
    ${tx('p', book.kicker, ' class="kicker"')}
    ${tx('h1', book.title)}
    ${tx('p', book.summary, ' class="lead"')}
    <figure class="book-cover"><img src="${IMG}${book.cover}"${size(book.cover)} fetchpriority="high"${alt(book.title)}></figure>
  </section>

  <div class="book wrap">
    <nav class="toc" aria-label="Contents" data-ca-aria="${UI.contents.ca}" data-es-aria="${UI.contents.es}">
      <details open>
        ${tx('summary', UI.contents)}
        <ol>${toc}</ol>
      </details>
    </nav>
    <article class="book-text">
${sections}

      <footer class="book-end">
        ${tx('p', UI.sourceNote(book), ' class="note"')}
        <a class="next-book" href="${next.slug}.html">
          ${tx('span', UI.nextBook, ' class="next-label"')}
          ${tx('span', next.title, ' class="next-title"')}
        </a>
      </footer>
    </article>
  </div>
</main>

<dialog class="viewer" aria-label="Original page" data-ca-aria="${UI.original.ca}" data-es-aria="${UI.original.es}">
  <div class="viewer-bar">
    <span class="viewer-count" aria-live="polite"></span>
    <button type="button" class="viewer-prev"${aria(UI.prev)}>←</button>
    <button type="button" class="viewer-next"${aria(UI.next)}>→</button>
    <button type="button" class="viewer-close"${aria(UI.close)}>✕</button>
  </div>
  <img class="viewer-img" alt="">
</dialog>

${C.footer('../')}

<script>window.BOOK_PAGES = ${pageList};</script>
<script src="../assets/js/main.js"></script>
<script src="../assets/js/reader.js"></script>
</body>
</html>
`;
}

// ---------- book cards for index.html ----------
function cards() {
  return books.map((b) => `
      <a class="book-card" href="library/${b.slug}.html" style="--book: ${b.color}">
        <img src="assets/images/library/${b.cover}"${size(b.cover)} loading="lazy" decoding="async" alt="">
        ${tx('span', b.kicker, ' class="kicker"')}
        ${tx('span', b.title, ' class="book-card-title"')}
        ${tx('span', b.summary, ' class="book-card-text"')}
        ${tx('span', require('./flipbook.js').has(b.file) ? UI.pages(require('./flipbook.js').count(b.file)) : UI.chapters(b.sections.length), ' class="book-card-meta"')}
      </a>`).join('');
}

const flipbook = require('./flipbook.js');
books.forEach((b, i) => {
  // books whose original pages have been recreated (src/data/books/pages/<file>.json) become flip-books
  const html = flipbook.has(b.file) ? flipbook.render(b, books[(i + 1) % books.length], b.file) : require('./images.js').enhance(page(b, i), '../');
  fs.writeFileSync(path.join(LIB, b.slug + '.html'), html);
  console.log('wrote library/' + b.slug + '.html');
});

module.exports = { books, cards };
