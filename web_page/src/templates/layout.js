// Shared header, footer and page shell for every page of the El Xop site.
// `rel` is the path back to the site root ('' for pages in public/, '../' for public/library/).

const { t, esc, isT, tx, aria } = require('./i18n.js');
const F = require('./footer.js');

// ---------- site map ----------
const PAGES = {
  projectes:    { href: null,                 title: t('Els nostres projectes', 'Nuestros proyectos', 'Our Projects') }, // dropdown only, no page
  residencia:   { href: 'residencia.html',      title: t("Residència d'artistes", 'Residencia de artistas', 'Artist residency') },
  vaqueres:     { href: 'les-vaqueres.html',    title: t('Les Vaqueres', 'Les Vaqueres', 'Les Vaqueres') },
  entorn:       { href: null,                 title: t("L'entorn", 'El entorno', 'Surroundings') }, // dropdown only, no page
  fruits:       { href: 'fruits-de-la-tardor.html', title: t('Fruits de la tardor', 'Frutos del otoño', 'Autumn fruits') },
  herbes:       { href: 'raco-dherbes.html',    title: t('Racó d’herbes', 'Rincón de hierbas', 'Herb corner') },
  museu:        { href: 'museu.html',           title: t('Museu', 'Museo', 'Museum') },
  arxiu:        { href: null,                 title: t('Arxiu', 'Archivo', 'Archive') }, // dropdown only, no page
  bibliografia: { href: 'bibliografia.html',    title: t('Bibliografia', 'Bibliografía', 'Bibliography') },
  ahir:         { href: 'el-xop-dahir.html',    title: t("El Xop d'ahir", 'El Xop de ayer', 'El Xop in the past') },
  contacte:     { href: '#contacte',                  title: F.TITLE }, // the footer of the page you are on
};

const UI = {
  welcome: t('Benvinguts!', '¡Bienvenidos!', 'Welcome!'),
  language: t('Idioma', 'Idioma', 'Language'),
  menu: t('Menú', 'Menú', 'Menu'),
  close: t('Tanca el menú', 'Cerrar el menú', 'Close menu'),
  main: t('Principal', 'Principal', 'Main'),
};

function head(title, desc, rel, extraCss = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- fonts load without blocking the first paint; system fonts show until they arrive -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&amp;family=Young+Serif&amp;display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&amp;family=Young+Serif&amp;display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&amp;family=Young+Serif&amp;display=swap"></noscript>
<link rel="stylesheet" href="${rel}assets/css/main.css">
<link rel="stylesheet" href="${rel}assets/css/library.css">${extraCss}
</head>`;
}

function link(key, rel, active, cls = '') {
  const p = PAGES[key];
  const cur = active === key ? ' aria-current="page"' : '';
  return tx('a', p.title, ` href="${rel}${p.href}"${cur}${cls ? ` class="${cls}"` : ''}`);
}

// language menu, in this order. Catalonia has no flag emoji that renders reliably,
// so its senyera is a small inline SVG sized like the emoji flags.
const SENYERA = '<svg class="flag flag-svg" aria-hidden="true" viewBox="0 0 27 18"><rect width="27" height="18" fill="#fcdd09"/><path d="M0 3h27M0 7h27M0 11h27M0 15h27" stroke="#da121a" stroke-width="2"/></svg>';
const LANGS = [
  { code: 'ca', name: 'Català', flag: SENYERA },
  { code: 'en', name: 'English', flag: '<span class="flag" aria-hidden="true">🇬🇧</span>' },
  { code: 'es', name: 'Español', flag: '<span class="flag" aria-hidden="true">🇪🇸</span>' },
];

const CHEVRON = '<svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

// a dropdown with no page of its own: the label itself is the toggle
function labelMenu(key, children, rel, active) {
  const on = children.includes(active);
  return `<li class="has-sub${on ? ' is-active' : ''}">
            <button type="button" class="sub-toggle sub-label" aria-expanded="false" aria-controls="sub-${key}">${tx('span', PAGES[key].title)}${CHEVRON}</button>
            <ul class="sub" id="sub-${key}">
${children.map((c) => `              <li>${link(c, rel, active)}</li>`).join('\n')}
            </ul>
          </li>`;
}

function header(rel, active) {
  return `<header class="site-header">
  <div class="progress" aria-hidden="true"><span></span></div>
  <div class="wrap header-inner">
    <a class="brand" href="${rel}index.html">
      <span class="brand-name">El Xop</span>
      <span class="brand-sub">Les Vaqueres</span>
    </a>

    <p class="nav-welcome">${tx('span', UI.welcome)}</p>

    <button type="button" class="burger" aria-expanded="false" aria-controls="site-nav"${aria(UI.menu)}>
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>

    <div class="nav-panel" id="site-nav">
      <nav class="main-nav"${aria(UI.main)}>
        <ul>
          ${labelMenu('projectes', ['residencia', 'vaqueres'], rel, active)}
          ${labelMenu('entorn', ['fruits', 'herbes'], rel, active)}
          <li>${link('museu', rel, active)}</li>
          ${labelMenu('arxiu', ['bibliografia', 'ahir'], rel, active)}
          <li>${tx('a', PAGES.contacte.title, ' href="#contacte" class="nav-contact"')}</li>
        </ul>
      </nav>
      <div class="lang">
        <button type="button" class="lang-toggle" aria-expanded="false" aria-controls="lang-menu"${aria(UI.language)}>
          <span class="lang-current" aria-hidden="true">${LANGS[1].flag}<span class="lang-code">EN</span></span>
          <svg class="lang-chevron" aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <ul class="lang-menu" id="lang-menu">
${LANGS.map((l) => `          <li><button type="button" data-lang-set="${l.code}" data-code="${l.code.toUpperCase()}" aria-pressed="${l.code === 'en'}" lang="${l.code}">${l.flag}<span>${l.name}</span></button></li>`).join('\n')}
        </ul>
      </div>
    </div>
  </div>
</header>`;
}

module.exports = {
  t, esc, tx, aria, PAGES, UI, head, header,
  // contact footer lives in footer.js; re-exported so page builders only need layout.js
  CONTACT: F.CONTACT, footer: F.footer, contactList: F.contactList, mapFrame: F.mapFrame, instagramCard: F.instagramCard,
};
