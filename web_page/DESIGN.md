---
name: El Xop · Les Vaqueres
description: A calm, grounded garden-and-heritage website on pale sage ground, with real photographs, a soft serif for names and a plain grotesk for reading.
colors:
  ground: "#e3e5da"
  hero: "#eef0e6"
  surface: "#fbfbf5"
  ink: "#262c21"
  ink-soft: "#4b5443"
  line: "#c9cdbd"
  arbor: "#4d5e3c"
  sage: "#a7b49a"
  olive: "#8a9a5b"
  teal: "#3a6460"
  ochre: "#c9a45c"
  earth: "#75583c"
  clay: "#c4866a"
  sky: "#9cb8d0"
typography:
  display:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(3rem, 8vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(2rem, 3.6vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  welcome-title:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.35
  sub-heading:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(1.375rem, 2vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.2
  wordmark:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
  lead:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.8vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  small:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  wrap: "1120px"
  header-height: "84px"
---

# Design System: El Xop · Les Vaqueres

Describes the site as built (updated 2026-11-19). It replaces the earlier root-level DESIGN.md
(2026-11-12), written for a one-page draft with colour rectangles instead of photos; that file is no
longer followed. Source of truth for exact values: `public/assets/css/main.css` and `library.css`.

## Overview

A familiar website played straight: sticky header with dropdown menus, a full-screen home hero,
content sections, and the same contact footer on every page. Real photographs carry the pages. The world
is quiet and earthy: pale sage ground, a soft green-black ink, hairlines in a darker sage, and one deep
green (arbor) for icons, small accents and the few filled controls.

**Key characteristics**
- Pale sage ground; ink for names and active states, soft ink for reading text; 1px hairlines divide.
- Young Serif for names, titles and headings; Hanken Grotesk for reading and controls.
- Photos are the colour. The eight place colours remain as tokens (placeholders, e.g. empty book cards).
- Calm motion only, and none with reduced motion.

## Colors

- **ground** `#e3e5da`: page background and sticky header (94%, with blur; plain on low-end devices).
- **hero** `#eef0e6`: the home hero only, edge to edge, so it reads apart from the next section.
- **surface** `#fbfbf5`: cards, panels, dropdowns, the map placeholder; light text on dark/photo areas.
- **ink** `#262c21`: titles, names, active nav items, focus outline, skip link.
- **ink-soft** `#4b5443`: body text, lead, nav at rest, footer, captions and credits.
- **line** `#c9cdbd`: hairlines (header, section titles, lists, footer).
- **arbor** `#4d5e3c`: icons, the header "Benvinguts!", garden accent lines, filled controls
  (back-to-top, Instagram "Follow", "Show map"), text selection.
- **sage, olive, teal, ochre, earth, clay, sky**: place colours for photo stand-ins only.
- Temporary: `#fbe7a1` marks the "[to fill]" gaps on the legal pages; remove when they are filled.

All text meets WCAG AA contrast (checked 2026-11-18), including the garden text on its dark fade.

## Typography

Fonts are self-hosted woff2 in `public/assets/fonts/` (latin + latin-ext); never load them from Google.
The two main faces are preloaded.

- **Display**: page titles (h1). Young Serif 400.
- **Headline**: section titles, with a hairline above.
- **Welcome title**: home section titles, centred, Young Serif bold; the second line in a calligraphic
  stack ("Lucida Calligraphy", "Apple Chancery", serif), smaller.
- **Sub-heading**: sub-sections in museum and garden pages.
- **Wordmark**: "El Xop" in the header, with "Les Vaqueres" beneath in light grotesk.
- **Lead / Body / Small**: Hanken Grotesk; nav labels at 500; small for footer, credits, captions.

## Layout

- One centred column: max 1120px plus the gutter, for header, sections and footer.
- Home: hero fills the first screen (logos left, illustrated map right; map on top on phones); welcome
  text beside the illustrated plan (below it under 1100px); garden scene with a full-width photo,
  title on a dark fade and two light panels.
- Article pages (Museum, Herb corner, Autumn fruits): title + lead + contents list, with a picture
  beside the list. **Rule:** if the picture is taller than the list it stays as is; if shorter it is
  sticky beside the list while it scrolls (CSS sticky in `.page-head-beside-nav`). Stacked under 860px.
  Exception: the Museum shows three framed family photos in a column (`.head-art-stack`), starting
  level with the top of the h1 title, each nudged slightly sideways; the group is never sticky and
  scrolls with the page.
- Museum rooms: sticky room title, text and photo side by side, alternating sides.
- Book pages: sticky table of contents, chapters, scans column, full-screen viewer.
- Breakpoints: 960px (burger menu), 860px, 760px, 480px.

## Components

- **Header**: wordmark; "Benvinguts!" (types itself once on the home page); menu; language dropdown.
  Dropdowns (Our Projects, Surroundings, Archive) are labels with no page: they open on hover (or
  keyboard focus); a click does nothing, except a tap on touch screens without hover. On phones the
  burger menu lists every group and its pages.
- **Language dropdown**: pill button with flag and code; Catalan flag is an inline SVG.
- **Section title**: headline with a hairline above.
- **Contents list (page nav)**: arbor line icons, serif labels, hairlines between rows.
- **Plant zoom**: wide photo with a framed close-up overlapping it and guide lines.
- **Garden panels / cards**: surface, slightly see-through, rounded (18px / 12px), soft feathered edge.
- **Footer** (`#contacte`, every page): contact list with arbor icons, Instagram card (a link styled
  as a phone, rounded 40px with shadow; images stored locally), map placeholder, then a base row:
  copyright, legal links, back to top.
- **Map placeholder**: surface box with a note, a "Show map" button and a cookie-policy link; Google
  Maps loads only after the click.
- **Back to top**: round arbor button, 72px, arrow 27px, appears after the first screen.
- **Skip link**: "Skip to content", hidden until focused by keyboard.
- **Legal pages**: plain article, max 44em, owner details as a definition list.

## Images and loading

- Only web-ready copies inside `web_page/`; originals are never linked.
- `npm run images` makes `<name>.avif`, `<name>-sm.avif`, `<name>-sm.jpg` (and `-lg.jpg` for very wide
  originals); the build wraps each `<img>` in `<picture>` with `srcset`/`sizes` (`src/templates/images.js`)
  and fills in width/height. `picture { display: contents }` keeps layout rules on the `<img>`.
- Images lazy-load except the hero; the hero map has high fetch priority.
- Third-party photos show author and licence beside them.

## Motion

- Photos fade in the first time they scroll into view.
- "Benvinguts!" typewriter on the home page only.
- Scroll cue nudge in the hero; gentle hover lifts (Instagram card, zoom close-ups).
- All of it is off with `prefers-reduced-motion`; fades and header blur are off on low-end devices or
  Save-Data (`html.lite`).

## Accessibility

- Skip link, visible focus outline, keyboard-reachable dropdowns, labelled icon buttons.
- Every meaningful image has alt text in all three languages; decorative ones have `alt=""`.
- Language changes update `lang`, text, alt text and aria labels together.

## Do / Don't

- **Do** keep the familiar structure and the calm pace; let photos carry colour.
- **Do** keep text to ink and soft ink, with arbor only for icons, small accents and filled controls.
- **Do** add new article pictures with the `beside-nav` page head so they follow the sticky rule.
- **Don't** load anything from third parties before the visitor asks (fonts, maps, embeds).
- **Don't** add shadows, gradients or rounded corners beyond the components listed above.
- **Don't** invent places, contact details, reviews or prices.
