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
  ahir:         { href: 'https://elxoplleida.blogspot.com/', external: true, title: t("El Xop d'ahir", 'El Xop de ayer', 'El Xop in the past') },
  contacte:     { href: '#contacte',                  title: F.TITLE }, // the footer of the page you are on
};

const UI = {
  welcome: t('Benvinguts!', '¡Bienvenidos!', 'Welcome!'),
  language: t('Idioma', 'Idioma', 'Language'),
  menu: t('Menú', 'Menú', 'Menu'),
  close: t('Tanca el menú', 'Cerrar el menú', 'Close menu'),
  main: t('Principal', 'Principal', 'Main'),
  skip: t('Salta al contingut', 'Saltar al contenido', 'Skip to content'),
  newTab: t("(s'obre en una pestanya nova)", '(se abre en una pestaña nueva)', '(opens in a new tab)'),
};

// small arrow-out-of-box sign after links that leave the site
const EXTERNAL_ICON = '<svg class="ext-icon" aria-hidden="true" viewBox="0 0 12 12" width="11" height="11"><path d="M7 1.5h3.5V5M10.5 1.5 5.5 6.5M9 7.5v3H1.5V3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function head(title, desc, rel, extraCss = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<!-- fonts are served from the site itself (assets/fonts): no request to Google; the two main faces load early -->
<link rel="preload" href="${rel}assets/fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${rel}assets/fonts/young-serif-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/css/main.css">
<link rel="stylesheet" href="${rel}assets/css/library.css">${extraCss}
</head>`;
}

function link(key, rel, active, cls = '') {
  const p = PAGES[key];
  if (p.external) {
    return `<a href="${p.href}" class="ext-link${cls ? ` ${cls}` : ''}" target="_blank" rel="noopener">${tx('span', p.title)}${EXTERNAL_ICON}${tx('span', UI.newTab, ' class="visually-hidden"')}</a>`;
  }
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
  // these live in their own folders (public/<code>/), made by scripts/localize.js from src/i18n/<code>.json
  { code: 'de', name: 'Deutsch', flag: '<span class="flag" aria-hidden="true">🇩🇪</span>' },
  { code: 'fr', name: 'Français', flag: '<span class="flag" aria-hidden="true">🇫🇷</span>' },
  { code: 'it', name: 'Italiano', flag: '<span class="flag" aria-hidden="true">🇮🇹</span>' },
  { code: 'pl', name: 'Polski', flag: '<span class="flag" aria-hidden="true">🇵🇱</span>' },
  { code: 'cs', name: 'Čeština', flag: '<span class="flag" aria-hidden="true">🇨🇿</span>' },
  { code: 'uk', label: 'UA', name: 'Українська', flag: '<span class="flag" aria-hidden="true">🇺🇦</span>' },
  { code: 'ru', name: 'Русский', flag: '<span class="flag" aria-hidden="true">🇷🇺</span>' },
  { code: 'ja', name: '日本語', flag: '<span class="flag" aria-hidden="true">🇯🇵</span>' },
  { code: 'zh', name: '中文（简体）', flag: '<span class="flag" aria-hidden="true">🇨🇳</span>', lang: 'zh-Hans' },
];

const CHEVRON = '<svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

// a dropdown with no page of its own: the label itself is the toggle
function labelMenu(key, children, rel, active) {
  const on = children.includes(active);
  return `<li class="has-sub${on ? ' is-active' : ''}">
            <button type="button" class="sub-toggle sub-label" aria-haspopup="true" aria-controls="sub-${key}">${tx('span', PAGES[key].title)}${CHEVRON}</button>
            <ul class="sub" id="sub-${key}">
${children.map((c) => `              <li>${link(c, rel, active)}</li>`).join('\n')}
            </ul>
          </li>`;
}

function header(rel, active) {
  return `${tx('a', UI.skip, ' class="skip-link" href="#top"')}
<header class="site-header">
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
          <li>${link('residencia', rel, active)}</li>
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
${LANGS.map((l) => `          <li><button type="button" data-lang-set="${l.code}" data-code="${l.label || l.code.toUpperCase()}" aria-pressed="${l.code === 'en'}" lang="${l.lang || l.code}">${l.flag}<span>${l.name}</span></button></li>`).join('\n')}
        </ul>
      </div>
    </div>
  </div>
</header>`;
}

module.exports = {
  t, esc, tx, aria, PAGES, UI, head, header,
  // contact footer lives in footer.js; re-exported so page builders only need layout.js
  CONTACT: F.CONTACT, OWNER: F.OWNER, LEGAL: F.LEGAL, footer: F.footer, contactList: F.contactList, mapFrame: F.mapFrame, instagramCard: F.instagramCard,
};
