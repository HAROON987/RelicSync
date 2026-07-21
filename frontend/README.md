# RelicSync — Frontend

Next.js 15 frontend for the RelicSync Lost & Found Platform.

## Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: TailwindCSS + ShadCN UI
- **AI**: Google Genkit + Gemini API (AI Match Scoring)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Then fill in your GEMINI_API_KEY in .env

# Run development server (on port 9002)
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

> **Note**: The Java backend must be running on `http://localhost:8080` for full functionality.
> See `../backend/` for backend setup instructions.
