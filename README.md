# shreyan.tech

Personal portfolio of Shreyan Dhawa. A static site with two sides:

- **Light side:** a quiet, text-first portfolio. Home (work grid), one page per project, and About.
- **Lily side:** the flower button in the top-right corner makes red spider lilies take over the screen. The same content is then reached by selecting one of eight fingers on an illustrated character (`/lily`, with the selected finger in the URL hash, e.g. `/lily#lumencell`).

Built with AI assistance (Claude Code), from a written specification and Figma designs.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (also /dev/lilies, a dev-only check of the lily renderer)
npm run build      # static export to out/
npm test           # unit tests (Vitest)
npm run test:e2e   # smoke, accessibility, keyboard and motion tests (Playwright) against out/
```

Node 26 and Python 3 (to serve `out/` for the Playwright tests) are expected.

## Editing content

All copy lives in typed data files under `content/`: `projects.ts`, `site.ts` and `lily.ts`. Pages render from that data; no copy lives in components. Project screenshots are in `public/media/<project>/` as AVIF with a WebP fallback.

The illustrated character is a placeholder. Its swap point is `components/character/`: `Character.tsx` (the SVG, one named group per body part), `geometry.ts` (sizes and pivot points) and `poses.ts` (finger and thumb positions as data). After changing it, `npm run build && npm run og` regenerates the social preview image, `public/og.png`.

## Stack

Next.js (App Router, static export), TypeScript, Tailwind CSS, GSAP for the takeover and finger timelines, React `<ViewTransition>` for page transitions, Canvas 2D for the lilies, inline SVG for the character.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `out/` to GitHub Pages. `.github/workflows/ci.yml` runs lint, typecheck, unit tests, the build and Playwright on every push and pull request. Domain and DNS setup: [DEPLOY.md](DEPLOY.md).
