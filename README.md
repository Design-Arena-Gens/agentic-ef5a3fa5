Apex Markup Studio delivers a premium markup calculator suite spanning web, Excel, and Google Sheets so commercial teams can quote confidently and stay margin-positive.

## Contents
- `web/` – Next.js app with the interactive calculator experience
- `web/public/downloads/markup-calculator-excel.xlsx` – Excel-ready template
- `web/public/downloads/markup-calculator-google-sheets.xlsx` – Google Sheets import template
- `.venv/` (optional) – Python virtual environment scaffolded for spreadsheet generation scripts

## Quickstart
```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

## Production build & test
```bash
cd web
npm run lint
npm run build
```

## Spreadsheet templates
- Excel: open the workbook directly in Microsoft 365 or Numbers.
- Google Sheets: upload via “File → Import → Upload → Replace spreadsheet”; formulas and styling persist.

Both templates expose the same inputs as the web app (costs, markup vs margin, discount, tax, target profit) plus an identical scenario modeller.

## Deployment
The project is ready for Vercel via `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ef5a3fa5`.

