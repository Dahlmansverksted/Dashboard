# Dahlman Dashboard

Personal dashboard hosted on Cloudflare Pages with Cloudflare D1 synchronization.

Start with [`START_HER.md`](START_HER.md).

## Architecture

- Static frontend: HTML, CSS, JavaScript
- Hosting: Cloudflare Pages
- Server endpoint: Cloudflare Pages Function at `/api/state`
- Database: Cloudflare D1
- Source control and automatic deployments: GitHub

## Local validation

```bash
npm install
npm run check
```

Never commit `DASHBOARD_TOKEN`, `.dev.vars`, passwords, or API tokens.
