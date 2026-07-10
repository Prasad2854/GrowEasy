# GrowEasy AI-Powered CSV Importer

A production-ready application for importing, previewing, and mapping arbitrary CSV data into a strict CRM schema using the Google Gemini AI.

## Features
- **Smart Data Mapping**: Automatically suggests mappings from your messy CSV columns to the CRM schema using Gemini AI.
- **Robust Batch Processing**: Processes full CSV files in chunks of 20 with an enforced concurrency limit of 3 to maximize throughput and prevent rate limits.
- **Data Cleansing**: Enforces strict rules (e.g. skipping rows with no email/mobile, appending multiple emails to notes, normalizing statuses).
- **Resilience**: Exponential backoff retry logic for AI API failures.
- **Real-time Progress Tracker**: Smooth UI polling to display import progress without WebSockets.
- **Rich Results & Export**: A TanStack data table with search, sorting, pagination, and 1-click JSON/CSV export functionality.

## Architecture

This project is structured as a **Monorepo** using npm workspaces.

- `apps/web`: Next.js 15 App Router frontend (Tailwind, shadcn/ui, TanStack Table, React Query).
- `apps/api`: Node.js Express backend (Multer, PapaParse, Pino, Zod).
- `packages/shared-types`: Shared Zod schemas ensuring strict type-safety across the stack.

## Local Setup

### Prerequisites
- Node.js (v20+)
- npm
- Google Gemini API Key

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   - Copy `apps/api/.env.example` to `apps/api/.env` and add your `GEMINI_API_KEY`.
   - *(Optional)* Copy `apps/web/.env.example` to `apps/web/.env`.

### Running the App
Start the development servers from the project root:

```bash
# Terminal 1: Start Backend API (runs on port 8080)
npm run dev --workspace=@groweasy/api

# Terminal 2: Start Frontend Web (runs on port 3000)
npm run dev --workspace=web
```
Open `http://localhost:3000` in your browser.

## Deployment

### Deploying the Frontend (Vercel)
The Next.js frontend is fully optimized for Vercel.
1. Connect your GitHub repository to Vercel.
2. Select the `apps/web` directory as the Root Directory.
3. Add the following environment variable:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://groweasy-api.onrender.com/api`).
4. Click Deploy.

### Deploying the Backend (Render)
The Express backend includes a `render.yaml` blueprint and a production-ready `Dockerfile`.
1. Connect your GitHub repository to Render.
2. Render will automatically detect the `render.yaml` file (or you can use the Docker environment).
3. Add the following environment variables in the Render dashboard:
   - `GEMINI_API_KEY`: Your secret Gemini key.
   - `FRONTEND_URL`: The URL of your deployed Vercel app (e.g., `https://groweasy-web.vercel.app`) to strictly configure CORS.
4. Deploy.

### Docker Compose
You can also run the full production build locally via Docker Compose:
```bash
GEMINI_API_KEY=your_key_here docker-compose up --build
```

## API Documentation

### `POST /api/upload`
Uploads a CSV file using `multipart/form-data`.
Returns a `jobId`, extracted `headers`, and `sampleRows` for mapping.

### `POST /api/mapping`
Accepts `jobId`, `headers`, and `sampleRows`.
Calls Gemini to return AI-suggested mappings matching the CRM schema.

### `POST /api/process`
Accepts `jobId` and finalized `mappings`.
Initiates the background batch processing of the entire CSV file.

### `GET /api/process/:jobId/status`
Returns the real-time processing status (`pending`, `processing`, `completed`, `failed`) and row counts.

### `GET /api/process/:jobId/result`
Returns the finalized metrics (`imported`, `skipped`, `failed`) and the fully transformed CRM `records` array.
