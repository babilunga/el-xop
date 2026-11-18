# El Xop · Les Vaqueres — website

Static multilingual site (CA / ES / EN). No dependencies: Node only.

```bash
npm run build   # regenerate every page into public/
npm run serve   # preview public/ on http://localhost:4322
npm run images  # after adding/replacing photos: make AVIF + small copies (macOS sips)
```

## Folder structure

```
web_page/
├── README.md               this file: structure + conventions
├── package.json            npm scripts (build, serve, start)
├── .editorconfig           shared formatting rules
│
├── scripts/                Node tooling, never deployed
│   ├── build.js            builds all pages into public/
│   └── serve.js            local static preview server
│
├── src/                    sources the build reads (edit these)
│   ├── templates/          page shells and generators (JS template literals)
│   │   ├── layout.js       <head>, header, site map (PAGES); re-exports the footer
│   │   ├── footer.js       contact footer on every page: details, Instagram card, map
│   │   ├── i18n.js         t() / tx() translation helpers
│   │   └── library.js      book reader pages + book cards
│   ├── partials/           hand-written HTML fragments injected into pages
│   │   ├── fruits-de-la-tardor.html  (+ -nav.html; also museu, raco-dherbes)
│   └── data/               content as data
│       ├── books/          one file per book (espais.js, mirador.js, …)
│       └── image-dimensions.json   width/height for library images
│
└── public/                 the deployable site: upload this folder as-is
    ├── index.html          + one .html per menu item (generated)
    ├── library/            one .html per book (generated)
    └── assets/             static files served directly (edit these in place)
        ├── css/            main.css (site), library.css (books/cards)
        ├── js/             main.js (site behaviour, language), reader.js (book viewer)
        └── images/
            ├── plants/     garden photos
            ├── instagram/  Instagram feed images
            └── library/
                ├── photos/ book photos and covers
                └── pages/  scanned original pages (*-sm.webp = thumbnails)
```

Raw originals (HEIC photos, book scans, video, reference material) stay outside
`web_page/` in the project root (`img/`, `img-webp/`, `books/`, `video/`,
`_material-font/`). Only optimized, web-ready copies go into `public/assets/images/`.

## Rules to follow

1. **Never hand-edit generated HTML** in `public/*.html` or `public/library/*.html`.
   Change `src/` and run `npm run build`. (CSS, JS and images in `public/assets/` *are* edited directly.)
2. **Where things go**
   - new page → add it to `PAGES` in `src/templates/layout.js`, then a `page({...})` call in `scripts/build.js`
   - large static HTML for a page → `src/partials/<page-name>.html`
   - new book → `src/data/books/<slug>.js`, and add it to the list in `src/templates/library.js`
   - stylesheet → `public/assets/css/`, script → `public/assets/js/`, image → `public/assets/images/<section>/`
3. **Naming**
   - all files and folders: lowercase `kebab-case`, no spaces or accents (`fruits-de-la-tardor.html`, `dog-rose-close.jpg`)
   - page partial has the same name as the page it belongs to
   - images: describe the subject, `<subject>-<variant>.<ext>` (`chayote-close.jpg`); thumbnails end in `-sm`
   - prefer `.webp` for photos; always set `width`/`height` (record them in `image-dimensions.json` for library images)
   - put only the original photo in `public/assets/images/<section>/`, then run `npm run images` and `npm run build`:
     it writes `<name>.avif`, `<name>-sm.avif`, `<name>-sm.jpg` beside it (never edit those by hand) and
     `src/data/image-variants.json`; the build then wraps each `<img>` in `<picture>` with `srcset`/`sizes`
     (rules in `src/templates/images.js`) and fills in missing `width`/`height`
   - JS identifiers `camelCase`, CSS classes `kebab-case`
4. **Paths** in generated HTML are relative: `''` from `public/`, `'../'` from `public/library/`
   (the `rel` argument in `layout.js`). Never use absolute `/…` or `file://` paths.
