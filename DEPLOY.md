# Deploying shreyan.tech

Every push to `main` builds the site and publishes `out/` to GitHub Pages (`.github/workflows/deploy.yml`). GitHub Pages is set to deploy from GitHub Actions. What is left is pointing the domain at it.

The IP addresses below are from GitHub's guide, [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), as of 22 November 2026. Check them there if anything has changed.

## 1. Add the domain in GitHub first

GitHub asks for this before any DNS change, so nobody else can claim the domain in between.

1. Open the repository on GitHub → **Settings** → **Pages**.
2. Under **Custom domain**, enter `shreyan.tech` and click **Save**.

(`public/CNAME` already contains `shreyan.tech`; with an Actions deploy, the setting above is what counts.)

## 2. DNS records at your domain registrar

For the apex domain `shreyan.tech` (host `@`), add four `A` records:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Optionally, for IPv6, also add four `AAAA` records (keep the `A` records too):

| Type | Host | Value |
|---|---|---|
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

For `www`, add one `CNAME` record pointing at your GitHub Pages domain, without the repository name:

| Type | Host | Value |
|---|---|---|
| CNAME | www | shreyandhawa.github.io |

Remove any other `A`, `AAAA` or `CNAME` records for `@` and `www` that point elsewhere (for example a registrar's parking page).

## 3. Turn on HTTPS

Back in **Settings** → **Pages**, once the DNS check passes, tick **Enforce HTTPS**. DNS changes can take up to 24 hours to propagate, and the HTTPS option can take up to 24 hours to become available.

## Checking

```bash
dig shreyan.tech +noall +answer
```

```bash
dig www.shreyan.tech +noall +answer
```

The first should list the four `185.199.*.153` addresses; the second should show `shreyandhawa.github.io`.

Until the custom domain is set, the site at `shreyandhawa.github.io/shreyan.tech/` loads without its styles and scripts: the build serves from the domain root, with no base path.
