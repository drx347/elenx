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
GOOGLE_SAFE_BROWSING_API_KEY=
ABUSEIPDB_API_KEY=
```

The scanner still runs without these keys, but external reputation checks are
reported as not configured.

## Deploy to Vercel

Use the default Vercel settings for a Next.js app:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave empty

Add the environment variables above in the Vercel project settings before
deploying.
