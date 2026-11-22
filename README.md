# shreyan.tech

Personal portfolio of Shreyan Dhawa. A static site with two sides: a quiet, text-first light side (Home, one page per project, About) and a lily side, reached from the flower button in the top-right corner, where the same content is navigated by selecting a finger on an illustrated character.

Built with AI assistance (Claude Code), from a written specification and Figma designs.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm test           # unit tests (Vitest)
npm run test:e2e   # smoke and accessibility tests (Playwright) against out/
```

Node 26 and Python 3 (for the test server) are expected.

## Editing content

All copy lives in typed data files under `content/`. Pages render from that data; no copy lives in components.

## Deployment

Next.js builds a fully static `out/` folder (`output: 'export'`). Pushing to `main` runs `.github/workflows/deploy.yml`, which publishes `out/` to GitHub Pages at the custom domain in `public/CNAME`. DNS setup is in `DEPLOY.md`.
