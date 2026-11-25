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
- The accent is rare on purpose. It marks where you are and what you selected, nothing else.
- Film grain (`.grain`, in the site layout) sits over everything at 20% multiply. Keep new grounds light enough for it.

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
- Small links get `tap relative`, a 44px touch target on phones that moves nothing.
- Every image and clip carries its width and height, so nothing shifts on load. CI fails a page whose CLS reaches 0.05.

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

1. **One wow moment per page.** A page gets one piece of motion people notice; everything else stays small and quick. Today Home and the project pages share theirs, the card media morphing into the project hero; a project figure opening into its lightbox is the same morph, played only on a click. About and 404 have none beyond the page enter.
2. **Everything rests under reduced motion.** With `prefers-reduced-motion: reduce` nothing moves or autoplays: at most a short opacity fade. View transitions, zoom, nudges, the underline draw and the rail marker go instant, clips stay on their poster, and the system cursor replaces the custom one. A new animation ships with its reduced-motion branch and a test in `e2e/motion.spec.ts`.
3. **No scroll-jacking.** Never take over wheel or touch scrolling, change its speed, or pin or scrub content against scroll position. Scroll listeners may read the position (the rail's active section does) but never set it. Smooth scrolling is for in-page anchors and is off under reduced motion.
4. Hover effects live under `@media (hover: hover)`, so touch screens don't get stuck hover states.

### What moves today

| Motion              | Where                                    | Normal                                    | Reduced motion |
| ------------------- | ---------------------------------------- | ----------------------------------------- | -------------- |
| Page enter          | `.enter`, `[--i:n]` per block (six at most) | Blur 6px and fade, 450ms, 40ms stagger | 150ms fade     |
| Card → hero morph   | `<ViewTransition name="media-<slug>">` on the card and the hero | 400ms, `cubic-bezier(0.2, 0, 0, 1)` | Instant |
| Figure → lightbox   | `components/Lightbox.tsx`, `name="zoom-<src>"` | The card morph; backdrop (`--bg` at 95%) cross-fades in 200ms | 150ms fade, nothing named |
| Route change        | `::view-transition-*(root)`              | 200ms cross-fade                          | Instant        |
| Underline draw      | `draw` utility (via `ExternalLink`)      | Draws in from the left, 250ms             | Instant        |
| Arrow nudge         | `.nudge`, `.nudge-back`                  | 3px toward where it points, 200ms         | None           |
| Card zoom           | `MediaFrame hover`                       | Media scales 2% inside its frame, 500ms   | None           |
| Rail marker         | `components/Rail.tsx`                    | Slides to the active item, 200ms          | Instant        |
| Cursor              | `components/Cursor.tsx`                  | Follows the pointer exactly; label opens in 120ms | System cursor |
| Card clips          | `components/Clip.tsx`                    | Play while on screen                      | Poster only    |

## Links

External links use `components/ExternalLink.tsx`: new tab, `rel="noopener noreferrer"`, the `draw` underline, a non-breaking `↗` and a screen-reader "(opens in a new tab)". The footer's GitHub, LinkedIn and Resume links are the exception: plain text with a cursor label and a colour change on hover.

## Adding a project

1. Put its media in `public/media/<slug>/`. Stills are `<name>.avif` plus `<name>.webp`. The card and hero clip is `card.mp4` with its poster `card-poster.avif` and `.webp`. Then run `npm run media` to write the 840px copies of anything wider.
2. In `content/projects.ts`, add a `media.<slug>` entry (`img()` for stills, `clip()` for the card), then the project in `projects`. Array order is grid order, and the first project spans both columns. Leave out facts you don't have (`role`, `where`, `deployed` and `code` hide their rows) rather than writing placeholders; the unit test fails on "TODO". Optional: `stats` (two to four figures, only ones the copy already states) and `cite` (a BibTeX entry for the Cite button). A `code` link on GitHub and a `deployed` link to pypi.org/project/<name> add badges fetched at build (last commit, PyPI version); a failed fetch hides the badge.
3. The first section must be titled "Overview". With more than one section the rail lists them on the project page.
4. Add the slug to the grid-order test in `content/content.test.ts`, to `routes` in `e2e/routes.spec.ts` and to the URLs in `lighthouserc.json`. The sitemap and static params pick it up from `projects`.
5. Run `npm run build && npm run og` to write the project's share image, `public/og/<slug>.png` (its card poster and name), and to regenerate `public/og.png` if the top of Home changed. Commit only the images that should change.

## Adding a figure

1. Save the image as `public/media/<slug>/<name>.avif` and `.webp`, and run `npm run media`.
2. Add `img("<slug>/<name>", width, height, alt, caption?)` under `media.<slug>`. Width and height are the file's pixel size. Alt text says what the image shows (the test wants more than 10 characters). The caption, if any, appears as a chip in the corner.
3. List it in a section's `figures`. Figures sit below that section's paragraphs, full column width; portrait images centre at up to 640px tall. A click opens the full-size file in a lightbox.

## Adding a note

1. Write `content/notes/<slug>.mdx`. The file name is the URL. It opens with frontmatter, one `key: value` per line, strings in double quotes:
   ```
   ---
   title: "A title"
   date: 2026-11-25
   summary: "One sentence for the index, the feed and the share card."
   draft: true
   ---
   ```
2. `draft: true` builds the page at its URL with `noindex` but keeps it off `/notes/`, the feed and the sitemap. Delete the line to publish.
3. Body type comes from `mdx-components.tsx`: `##` headings are labels, links keep an underline. Put `<Sidenote>…</Sidenote>` right after the sentence it annotates, inside the paragraph.
4. Add its URL to `lighthouserc.json`. The index, `/notes/feed.xml`, the sitemap, static params and the e2e route list read `content/notes/` themselves.
