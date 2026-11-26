# Design

A quiet, text-first site: sage ground, green-black ink, one blue accent, a serif for display and Geist for everything else. This file is the reference for changing it. Tokens live in `app/globals.css`; copy lives in `content/`.

## Colour

Defined on `:root` in `app/globals.css` and exposed to Tailwind by `@theme inline`, so `--ink` is `text-ink`, `bg-ink`, `border-ink`.

| Token       | Value     | Use                                        | Contrast on bg / surface |
| ----------- | --------- | ------------------------------------------ | ------------------------ |
| `--bg`      | `#e4eae0` | Page ground. `themeColor` in `app/layout.tsx` must match. | –                        |
| `--surface` | `#d5ded0` | Media frames, code blocks                  | –                        |
| `--ink`     | `#1e2a22` | Headings, links, primary text, focus ring  | 12.2 / 10.8              |
| `--ink-2`   | `#3e4b41` | Body copy                                  | 7.5 / 6.6                |
| `--muted`   | `#5c6a5e` | Labels, meta, footer, scrollbar thumb      | 4.7 / 4.1                |
| `--line`    | `#c6d0c2` | Hairlines between rows                     | 1.3 (decoration only)    |
| `--accent`  | `#2a4d9b` | Rail marker, text selection                | 6.5 / 5.8                |

- `--muted` fails 4.5:1 on `--surface`: text on a surface uses `--ink-2` or `--ink` (see `components/CopyButton.tsx`).
- The accent is rare on purpose. It marks where you are, what you selected and the lineage tips of the Home field, nothing else.
- Film grain (`.grain`, in the site layout) sits over everything at 20% multiply. Keep new grounds light enough for it.
- The Home field's points are 60% alpha (30% on phones, where they sit behind the headline). The darkest blend, `--accent` at 60% on `--bg`, still gives ink 4.4:1 against the 3:1 that large text needs. `--muted` text has no margin to spare, so the field stops short of the rail and of "Currently".

## Type

Fonts are loaded in `app/layout.tsx`: Instrument Serif (`font-serif`), Geist (`font-sans`, the default) and Geist Mono (`font-mono`, not preloaded because it only sets small labels).

| Role           | Size / line height, phone → md   | Font, colour      | Where                           |
| -------------- | -------------------------------- | ----------------- | ------------------------------- |
| Display        | 36/42 → 52/60, tracking −0.5 → −1px | serif, ink     | Home and 404 `h1`               |
| Project title  | 44/48 → 56/60, tracking −0.5px   | serif, ink        | Project and note `h1`           |
| Contact        | 28/34 → 44/52                    | serif, ink        | Email on About                  |
| Next project   | 32/40                            | serif, ink        | Foot of a project page          |
| Stat           | 32/40, over a `label`            | serif, ink        | Project figures under the facts |
| Lead           | 17/27                            | sans, ink-2       | Project one-liner               |
| Body           | 16/26                            | sans, ink-2       | Paragraphs                      |
| Small          | 14/22 (14/20 card meta, 14/21 project facts) | sans  | Rows, card meta, links          |
| Rail           | 15/20                            | sans, muted → ink | Navigation                      |
| Footer         | 13                               | sans, muted       | Footer                          |
| Code           | 13/24                            | mono, ink         | Command blocks                  |
| Label          | 11/16, tracking 1.5px, uppercase | mono, muted       | The `label` utility: every section heading and `dt` |
| Chip           | 10, tracking 1.5px, uppercase    | mono              | Figure captions, "Interface in progress", build badges |

- Section headings use `label`. Don't invent a new heading style.
- `h1` and `h2` balance, `p` and `dd` wrap pretty (base layer).
- Dates and figures: `dd` and `time` get `tabular-nums` from the base layer. Anywhere else that shows dates or numbers, add Tailwind's `tabular-nums` (the Home card meta does).

## Layout

- Two breakpoints only (Tailwind's defaults are removed): `md` at 900px, where the fixed rail appears, and `lg` at 1200px, where it widens from 200px to 288px.
- Content: `max-w-[864px]` for the main column, `max-w-[640px]` for reading text. Phone gutter is 16px (`px-4`).
- A note's 640px column is left-aligned, not centred like a project page, so `<Sidenote>` has room in the right margin from `lg`. Below `lg` a sidenote is a small block in the text.
- Small links get `tap relative`, a 44px touch area that moves nothing. It is on for touch screens: the `touch:` variant in `app/globals.css`, below `md` or with any coarse pointer (an iPad in landscape is 1024px wide and gets the rail).
- Links stacked one above another need 44px from line to line, or their touch areas overlap and a tap can land on the neighbour: `touch:mt-6` between link paragraphs, `touch:gap-y-6` in a list that wraps, `md:touch:gap-6` in the rail.
- Nothing scrolls sideways, at any width down to 320px.
- Every image and clip carries its width and height, so nothing shifts on load. CI fails a page whose CLS reaches 0.05.
- The footer's "Updated" month is the build's, so it moves with each deploy.

## Motion

Tokens on `:root`:

| Token           | Value | Use |
| --------------- | ----- | --- |
| `--ease-spring` | `linear()` spring, damping ratio 0.7, about 5% overshoot | Things arriving or settling into place |
| `--dur-fast`    | 150ms | Colour and hover changes, the reduced-motion fade |
| `--dur-base`    | 250ms | Underline draw, small moves |
| `--dur-slow`    | 450ms | Page enter |

In Tailwind: `duration-(--dur-base) ease-(--ease-spring)`. In CSS: `var(--dur-base)`.

### Rules

1. **One wow moment per page.** A page gets one piece of motion people notice; everything else stays small and quick. Home's is the field behind the headline growing into a trajectory (`components/field/`). The project pages' is the card media morphing into the project hero, started from a Home card (or, arriving from the Next link, the project name morphing into the title); a project figure opening into its lightbox is the same morph, played only on a click. A section flagged `scrub` (lumenCell's Validation, nowhere else) adds the field as a figure that recolours as you scroll past it. About and 404 have none beyond the page enter.
2. **Everything rests under reduced motion.** With `prefers-reduced-motion: reduce` nothing moves or autoplays: at most a short opacity fade. View transitions, zoom, nudges, the underline draw and the rail marker go instant, clips stay on their poster, and the system cursor replaces the custom one. A new animation ships with its reduced-motion branch and a test in `e2e/motion.spec.ts`.
3. **No scroll-jacking.** Never take over wheel or touch scrolling, change its speed, or pin content. Scroll listeners may read the position (the rail's active section does) but never set it. The one thing scrubbed against scroll position is a `scrub` section's field figure: a CSS view timeline drives it, and it never pins or changes how the page scrolls. Smooth scrolling is for in-page anchors and is off under reduced motion.
4. Hover effects live under `@media (hover: hover)`, so touch screens don't get stuck hover states.
5. `.enter` holds its end state (fill `both`). Dropping it repaints every block as it ends, and Chrome then counts Home's card poster at about 600ms as the LCP, which fails Lighthouse. The filter it holds pins a `position: fixed` child to its block, so a toast or overlay inside one is portalled to `<body>` (the "Link copied" toast in `SectionHeading` is).

### What moves today

| Motion              | Where                                    | Normal                                    | Reduced motion |
| ------------------- | ---------------------------------------- | ----------------------------------------- | -------------- |
| Page enter          | `.enter`, `[--i:n]` per block (six at most) | Blur 6px and fade, 450ms, 40ms stagger | 150ms fade     |
| Card → hero morph   | `<ViewTransition name="media-<slug>">` on the card and the hero | 400ms, `cubic-bezier(0.2, 0, 0, 1)` | Instant |
| Next → title morph  | `<ViewTransition name="title-<slug>">` on the Next link's name and the project `h1` | As the card morph; skipped when the title lands off screen | Instant |
| Figure → lightbox   | `components/Lightbox.tsx`, `name="zoom-<src>"` | The card morph; backdrop (`--bg` at 95%) cross-fades in 200ms | 150ms fade, nothing named |
| Route change        | `::view-transition-*(root)`              | 200ms cross-fade                          | Instant        |
| Underline draw      | `draw` utility (via `ExternalLink`)      | Draws in from the left, 250ms             | Instant        |
| Arrow nudge         | `.nudge`, `.nudge-back`                  | 3px toward where it points, 200ms         | None           |
| Card zoom           | `MediaFrame hover`                       | Media scales 2% inside its frame, 500ms, under a 15% white wash that fades in over 200ms | None |
| Rail marker         | `components/Rail.tsx`                    | Slides to the active item, 200ms; the seed leans 15° the way it moves and settles, 250ms | Instant, no lean |
| Copy-link toast     | `components/SectionHeading.tsx`          | "Link copied" blurs in, 150ms             | Appears        |
| Label crossfade     | `CopyButton`, cursor label               | Old label fades out over the new, 150ms   | Swaps          |
| Button press        | `<button>`: `motion-safe:active:scale-[.98]` | 98% while pressed                     | None           |
| Cursor              | `components/Cursor.tsx`                  | Follows the pointer exactly; label opens in 120ms | System cursor |
| Card clips          | `components/Clip.tsx`                    | Play while on screen                      | Poster only    |
| Home field          | `components/field/`, behind the `h1`     | 1,500 points grow from a scattered cloud into a three-lineage trajectory over 7s, root first, `--muted` → `--accent` along pseudotime; they drift up to 26px from the mouse. Canvas 2D, DPR capped at 2; sleeps off screen, in a hidden tab and once still | One still frame of the grown tree |
| Scrub field         | `components/field/Scrub.tsx`, a section with `scrub: true` | The grown field, all `--muted`, takes its pseudotime colour from the root outward as it scrolls from half on screen to the middle. `animation-timeline: view()` animates `--scrub`, which masks the coloured layer in; without view timelines a passive scroll listener sets `--scrub` | The coloured still |

## Links

External links use `components/ExternalLink.tsx`: new tab, `rel="noopener noreferrer"`, the `draw` underline, a non-breaking `↗` and a screen-reader "(opens in a new tab)". Other props, such as `data-umami-event`, pass through to the `<a>`. The footer's GitHub, LinkedIn and Resume links are the exception: plain text with a cursor label and a colour change on hover.

The custom cursor's label comes from the nearest `data-cursor` attribute ("View project", "Copy email", "Zoom"). `data-cursor-system` brings the system cursor back, which the palette and the lightbox need: they sit in the top layer, above the custom cursor.

## Analytics

[Umami Cloud](https://umami.is), loaded in `app/layout.tsx` after the page has loaded. It sets no cookies; it reads only an opt-out flag (`umami.disabled`) from localStorage.

- **Off unless the build has `UMAMI_WEBSITE_ID`.** The deploy reads it from the repository variable of the same name (`deploy.yml`). `npm run dev` and CI never set it, so their pages have no script, and `e2e/routes.spec.ts` checks for that. `data-domains` also stops a local build that has the variable from counting visits.
- Page views count on their own, client-side navigations included.
- Events:

  | Event        | Where                                    | Data      |
  | ------------ | ---------------------------------------- | --------- |
  | `Code link`  | A project's "Code: github.com/…" link    | `project` (the slug) |
  | `Copy email` | The email button on About, and "Copy email" in the palette | – |

- To track another link or button, give it `data-umami-event="Name"`, plus `data-umami-event-<key>="value"` for data. A path with no click (the palette's Enter key) calls `umami?.track("Name")` itself.

## CV and print

- `/cv/` has no copy of its own: name and contact, education and research come from `content/site.ts`, and each project's name, one line, stack and timeline from `content/projects.ts`. `npm run build` prints it to `out/cv.pdf` (`scripts/cv.mjs`, Playwright, US Letter).
- The footer's Resume link and the palette's "Open résumé" go to a hand-made `public/resume.pdf` while it exists, otherwise to `/cv.pdf`.
- Print styles sit at the end of `app/globals.css`: black on white, nothing animating, rows kept whole across pages, and each link's address printed after it (`print:after:content-none` opts a link out). The rail, grain, cursor and footer carry `print:hidden`.

## Keyboard

- ⌘K / Ctrl+K opens the palette, `components/Palette.tsx`: a native `<dialog>` searching projects, published notes, pages and actions (copy email, résumé, GitHub, LinkedIn). Its index is built on the server in `app/(site)/layout.tsx` from `projects` and `content/notes/`, so a new project or note shows up on its own.
- Look: `--surface` panel, `--line` hairline, no shadow, each row tagged in the label style but in `--ink-2` (muted fails on surface). The active row takes the `--bg` ground. It doesn't animate.
- On a project page, j/k and →/← go to the next and previous project (`nextProject`, `prevProject`), wrapping around. Keys are ignored while typing in a field, with ⌘, Ctrl, Alt or Shift held, or while any dialog is open: the palette, or a figure's lightbox.
- On a touch screen, each palette row is 44px tall.
- The footer's "⌘K to search" hides on touch screens (`pointer: coarse`).

## Checks

CI (`.github/workflows/ci.yml`) fails the build when any of these slips:

- **Lighthouse** (`lighthouserc.json`, mobile, three runs per page): performance under 0.95, accessibility under 1, or CLS of 0.05 and up, on Home, About, every project page, the notes index and the note.
- **Every route at 1440, 1024, 768, 390 and 320px** (`e2e/routes.spec.ts`): a 200, one `h1` first and no heading level skipped, no sideways scroll, and no axe violation of any impact.
- **Touch targets** at 390px and at 1024px with touch: every link and button that isn't inside running text has a 44px area, and no two areas overlap.
- Motion and its reduced-motion branch (`e2e/motion.spec.ts`), the palette (`e2e/palette.spec.ts`), the CV PDF (`e2e/cv.spec.ts`), and the content rules in `content/content.test.ts`.

Locally: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e && npx @lhci/cli@0.16.1 autorun`.

## How to add a note / project / figure

Copy goes in word for word: don't add claims, numbers or facts to fill a field.

### A note

- [ ] Write `content/notes/<slug>.mdx`. The file name is the URL. It opens with frontmatter, one `key: value` per line, strings in double quotes:
  ```
  ---
  title: "A title"
  date: 2026-11-25
  summary: "One sentence for the index, the feed and the share card."
  draft: true
  ---
  ```
- [ ] Body: `##` headings are labels (`mdx-components.tsx`), and links keep an underline. Put `<Sidenote>…</Sidenote>` right after the sentence it annotates, inside the paragraph. From `lg` it sits in the right margin; below that it's a small block in the text.
- [ ] `draft: true` builds the page at its URL with `noindex` but keeps it off `/notes/`, the feed and the sitemap. Delete the line to publish.
- [ ] Add its URL to `lighthouserc.json`. The index, `/notes/feed.xml`, the sitemap, static params, the palette and the e2e route list read `content/notes/` themselves.
- [ ] Run the checks.

### A project

- [ ] Put its media in `public/media/<slug>/`. Stills are `<name>.avif` plus `<name>.webp`. The card and hero clip is `card.mp4` with its poster `card-poster.avif` and `.webp`. Run `npm run media` to write the 840px copies of anything wider.
- [ ] In `content/projects.ts`, add a `media.<slug>` entry (`img()` for stills, `clip()` for the card), then the project in `projects`. Array order is grid order, and the first project spans both columns.
- [ ] Leave out facts you don't have rather than writing placeholders: `role`, `where`, `deployed` and `code` hide their rows, and the unit test fails on "TODO". Facts carry no trailing full stop.
- [ ] Optional: `stats` (two to four figures, only ones the copy already states) and `cite` (a BibTeX entry for the Cite button). A `code` link on GitHub and a `deployed` link to pypi.org/project/<name> add badges fetched at build (last commit, PyPI version); a failed fetch hides the badge. The `code` link is tracked as `Code link` on its own.
- [ ] The first section is titled "Overview". With more than one section, the rail lists them on the project page.
- [ ] Add the slug to the grid-order test in `content/content.test.ts`, to `slugs` in `e2e/routes.spec.ts` and to the URLs in `lighthouserc.json`. The sitemap, static params and the palette pick it up from `projects`.
- [ ] Run `npm run build && npm run og` to write its share image, `public/og/<slug>.png` (its card poster and name), and to regenerate `public/og.png` if the top of Home changed. Commit only the images that should change.
- [ ] Run the checks.

### A figure

- [ ] Save the image as `public/media/<slug>/<name>.avif` and `.webp`, and run `npm run media`.
- [ ] Add `img("<slug>/<name>", width, height, alt, caption?)` under `media.<slug>`. Width and height are the file's pixel size. The alt text says what the image shows (the test wants more than 10 characters). The caption, if any, appears as a chip in the corner.
- [ ] List it in a section's `figures`. Figures sit below that section's paragraphs, full column width; portrait images centre at up to 640px tall. A click opens the full-size file in a lightbox. `scrub: true` on a section puts the scrub field first among its figures.
- [ ] Run the checks.
