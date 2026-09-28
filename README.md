# HR Call Automation

A modern Next.js AI-powered web application for automating HR recruitment call processing.

This application allows HR to upload candidate call recordings, automatically transcribe them, extract structured candidate data using AI (Gemini), review the information, and sync it directly to Google Sheets.

## Features
- **Audio Upload:** Drag-and-drop support for MP3, WAV, M4A, WEBM
- **AI Transcription:** Uses Gemini 1.5 Flash to transcribe call audio
- **AI Data Extraction:** Uses Gemini Structured JSON Output to enforce extraction rules (no hallucination)
- **HR Review Interface:** Edit missing or uncertain candidate fields
- **Google Sheets Sync:** Automatically pushes data to an HR tracker
- **Modern UI:** Built with Tailwind CSS, shadcn/ui, and Lucide icons

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm
- A Google Cloud Project (for Google Sheets API)
- A Gemini API Key

### 2. Installation
```bash
npm install
# Note: npm install may have already been run, but run again if missing dependencies
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the following variables:
- `GEMINI_API_KEY`: Your Gemini API Key from Google AI Studio.
- `GOOGLE_SHEETS_SPREADSHEET_ID`: The ID of your spreadsheet (found in the URL).
- `GOOGLE_SHEETS_SHEET_NAME`: E.g. "Candidates".
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The client email from your Google Service Account JSON.
- `GOOGLE_PRIVATE_KEY`: The private key from your Google Service Account JSON (ensure newlines are preserved).

### 4. Database Setup
This project uses SQLite for MVP.
```bash
npx prisma db push
npx prisma generate
```

### 5. Google Sheets API Setup
1. Go to Google Cloud Console.
2. Enable **Google Sheets API**.
3. Create a **Service Account** and generate a JSON key.
4. Extract `client_email` and `private_key` into `.env`.
5. **IMPORTANT:** Go to your Google Sheet, click "Share", and share Editor access with the `client_email` from your service account.

### 6. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 7. Production Build
```bash
npm run build
npm start
```

## Testing & Demo Mode
If `GEMINI_API_KEY` is not provided in `.env`, the system runs in **Mock Mode**, providing a sample transcript and extracted candidate data to simulate the workflow without hitting the API.

To test actual AI extraction, you must provide a valid `GEMINI_API_KEY` and upload a real audio file.
