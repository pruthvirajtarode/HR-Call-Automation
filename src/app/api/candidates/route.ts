import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:Y`,
    });

    const rows = response.data.values || [];
    
    // Reverse rows so newest is first
    rows.reverse();

    const candidates = rows.map((row, index) => {
      return {
        id: `sheet-row-${index}`,
        candidateName: row[4] || "Unknown",
        email: row[6] || "",
        contactNumber: row[5] || "",
        currentOrganization: row[7] || "",
        totalExperience: row[9] || "",
        currentLocation: row[11] || "",
        createdAt: row[2] || new Date().toLocaleDateString(),
        calls: [{ status: "SYNCED" }],
        trackerSyncs: [{ status: "SUCCESS", sheetRowNumber: rows.length - index + 1 }]
      };
    });

    return NextResponse.json(candidates);
  } catch (error: any) {
    console.error("GET candidates from sheets error:", error);
    return NextResponse.json([]);
  }
}
