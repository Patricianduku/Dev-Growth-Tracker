# AI-Assisted Developer Growth Tracker

## Project Description
This capstone project helps developers log daily learning progress. Users can write what they learned and the challenges they faced. Later phases will store entries, display history, and generate AI-powered insights.

## Tech Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Features (Current Progress)
- Homepage UI in `app/page.tsx`
- Title: "AI-Assisted Developer Growth Tracker"
- Daily entry form with:
  - "What did you learn?"
  - "Challenges faced"
  - Submit button
- Backend API route in `app/api/entries/route.ts`:
  - `POST /api/entries` saves an entry (file storage)
  - `GET /api/entries` returns all saved entries
  - `PUT /api/entries` updates an existing entry
  - `DELETE /api/entries?id=...` removes one entry
- File storage layer in `lib/entries-store.ts`:
  - Persists entries to `data/entries.json`
- Frontend and backend connected:
  - Form submission sends data to `POST /api/entries`
  - Page fetches and displays entries from `GET /api/entries`
  - Search input filters entries by text
  - Sort control orders entries by date
  - Date range filter shows recent entries
  - Simple tags are extracted from each entry
- AI insights feature:
  - `GET /api/insights` returns saved insight history
  - `POST /api/insights` analyzes current entries
  - "Generate Insights" button displays insight text
  - Insight history is persisted in `data/insights.json`
  - Uses OpenAI when `OPENAI_API_KEY` is set
  - Falls back to local rules-based insights if key is missing/fails
- Export feature:
  - `GET /api/export` returns entries + insight history as JSON payload
  - "Export Data" button downloads a `.json` file

## Planned Features
- Migrate file storage to database storage (PostgreSQL/SQLite)

## Setup Instructions
1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Optional: add OpenAI API key in `.env.local`:
   - `OPENAI_API_KEY=your_api_key_here`
4. Open:
   - [http://localhost:3000](http://localhost:3000)

## How the App Works (So Far)
- `app/page.tsx` renders the main page at `/`.
- `app/api/entries/route.ts` handles API requests for entries.
- `app/api/insights/route.ts` generates insight text from entries.
- Entries are stored in `data/entries.json` (persistent across restarts).
- Insight history is stored in `data/insights.json` (persistent across restarts).
- On page load, the frontend fetches saved entries.
- On page load, the frontend also fetches saved insight history.
- On submit, the frontend posts a new entry then refreshes the list.
- The Edit flow updates an entry via `PUT /api/entries`.
- The Delete button removes an entry via `DELETE /api/entries?id=...`.
- Search filters entries by matching learned/challenges text.
- Sort can switch between newest and oldest first.
- Date range filter supports all time, last 7 days, and last 30 days.
- Entry cards show simple tags derived from entry text.
- Clicking "Generate Insights" sends entries to `/api/insights` and displays returned analysis.
- Generated insights are also listed in an insight history panel with timestamps.
- Export section downloads all stored data as JSON for backup/analysis.
- If `OPENAI_API_KEY` exists, insights come from OpenAI.
- If not, the app returns local fallback insights so the feature still works.
