# shreyandhawa.github.io

Personal portfolio of Shreyan Dhawa: a quiet, text-first static site. Home (project grid), one page per project under `/projects/`, and About.

Built with AI assistance (Claude Code), from a written specification and Figma designs.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm test           # unit tests (Vitest)
npm run test:e2e   # smoke, accessibility, keyboard and motion tests (Playwright) against out/
```

Node 26 and Python 3 (to serve `out/` for the Playwright tests) are expected.

## Editing content

All copy lives in typed data files under `content/`: `projects.ts` and `site.ts`. Pages render from that data; no copy lives in components. Project screenshots are in `public/media/<project>/` as AVIF with a WebP fallback.

`npm run build && npm run og` regenerates the social preview images: `public/og.png` from Home and `public/og/<slug>.png` from each project's card poster and name.

Colour, type and motion rules, and how to add a project or figure: [DESIGN.md](DESIGN.md).

## Stack

Next.js (App Router, static export), TypeScript, Tailwind CSS, React `<ViewTransition>` for page transitions.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `out/` to GitHub Pages. `.github/workflows/ci.yml` runs lint, typecheck, unit tests, the build, Playwright and Lighthouse (performance under 95, accessibility under 100 or CLS of 0.05 and up fail the build; `lighthouserc.json`) on every push and pull request. The site lives at https://shreyandhawa.github.io. Pages and custom-domain setup: [DEPLOY.md](DEPLOY.md).
