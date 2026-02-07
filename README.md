# Mission Control 🦞

Real-time dashboard for OpenClaw agent activity at **dashboard.vaelcreative.com**

## Features

- **📊 Activity Feed** — Real-time log of agent actions from memory files
- **📅 Calendar View** — Scheduled tasks and cron jobs visualized
- **🔍 Global Search** — Full-text search across workspace documents

## Stack

- NextJS 14 (App Router)
- Tailwind CSS
- TypeScript

## Development

```bash
npm install
npm run dev
# http://localhost:3000
```

## Deployment

Deployed via Vercel to dashboard.vaelcreative.com

```bash
vercel --prod
```

## API Routes

- `GET /api/activities` — Parsed activities from memory files
- `GET /api/cron` — Cron jobs from OpenClaw CLI
- `GET /api/search?q=query` — Workspace search

---

*Vael Creative — Human-curated, AI-accelerated*
