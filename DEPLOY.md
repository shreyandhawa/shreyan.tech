# Deploying shreyandhawa.github.io

Every push to `main` builds the site and publishes `out/` to GitHub Pages (`.github/workflows/deploy.yml`). The repository is named `shreyandhawa.github.io`, so GitHub serves it at https://shreyandhawa.github.io/ with no base path and no DNS setup.

Pages must be on, with **Settings → Pages → Build and deployment → Source** set to **GitHub Actions**. If a deploy fails at `configure-pages` with "Get Pages site failed", Pages is off: turn it on there, then re-run the workflow.

## Adding a custom domain later

The IP addresses below are from GitHub's guide, [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), as of 22 November 2026. Check them there if anything has changed.

1. In **Settings → Pages → Custom domain**, enter the domain and **Save** (before any DNS change, so nobody else can claim it).
2. At the registrar, for an apex domain (host `@`) add four `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. For `www`, add a `CNAME` to `shreyandhawa.github.io`. Remove other `A`, `AAAA` or `CNAME` records for those hosts.
3. When the DNS check passes, tick **Enforce HTTPS** (it can take up to a day to appear).
4. Set `url` in `content/site.ts` to the new domain.

A free subdomain such as `name.is-a.dev` is set up differently: a `CNAME` to `shreyandhawa.github.io` on that service, not the `A` records.

## Analytics

The site counts visits with Umami Cloud (no cookies; see "Analytics" in DESIGN.md). It stays off until the deploy has a website ID:

1. Sign up at [umami.is](https://umami.is), add a website with the domain `shreyandhawa.github.io`, and copy its **Website ID** from the website's settings.
2. In **Settings → Secrets and variables → Actions → Variables**, add a repository variable `UMAMI_WEBSITE_ID` with that ID. It is not a secret: it shows in every page's HTML.
3. Re-run the Deploy workflow, or push to `main`.

To turn it off, delete the variable and deploy again. The script only counts visits on the host in `url` in `content/site.ts`, so after a domain change, change the website's domain in Umami too.
