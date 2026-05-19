# Elenx

Simple website security scanner for DNS, SSL, reputation, and blacklist checks.

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development and fill in any API
keys you want to enable:

```bash
VIRUSTOTAL_API_KEY=
```

The scanner still runs without this key, but external reputation checks are
reported as not configured. Google Safe Browsing and AbuseIPDB are optional and
are not required for deployment.

## Deploy to Vercel

Use the default Vercel settings for a Next.js app:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave empty

Add `VIRUSTOTAL_API_KEY` in the Vercel project settings before deploying if you
want VirusTotal reputation checks enabled.
