Apex Markup Studio – Web App
================================

## Run locally
```bash
npm install
npm run dev
# http://localhost:3000
```

## Lint & production build
```bash
npm run lint
npm run build
```

## Features
- Three pricing modes (markup, margin, direct price) with instant reconciliation.
- Live profitability metrics, tax + discount handling, target-profit guidance.
- Scenario modeller covering value, core, premium, and executive markup plays.
- Download links for companion Excel and Google Sheets templates.

## CI/CD
- Production deploy: `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ef5a3fa5`.
- Static assets (spreadsheets) live under `public/downloads/`.

