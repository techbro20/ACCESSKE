# ACCESSKE Frontend (Next.js)

Next.js App Router UI for ACCES Kenya Alumni. Talks to the FastAPI + Socket.IO backend on the VPS — realtime chat stays on the VPS, not in this process.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` / `https://api.example.com` | REST API origin |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` / `wss://api.example.com` | Socket.IO origin (normalized to http/https for the client) |
| `NEXT_PUBLIC_BYPASS_AUTH` | `false` | Set `false` to use real API auth |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — serve production build
- `npm run lint` — ESLint
