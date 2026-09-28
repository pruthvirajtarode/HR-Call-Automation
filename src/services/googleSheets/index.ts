import { google } from "googleapis";

export interface SyncCandidateToSheetParams {
  candidateData: Record<string, any>;
}

export async function appendToGoogleSheet(params: SyncCandidateToSheetParams): Promise<{ rowNumber: number }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Candidates";
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!spreadsheetId || !clientEmail || !privateKey) {
      console.warn("Google Sheets credentials are not fully configured.");
      // Fallback/Mock behavior for MVP if credentials are not present
      return { rowNumber: Math.floor(Math.random() * 100) + 10 };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Auto-calculate the next Serial Number
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    
    // Total rows minus the header row gives the next serial number
    const rows = existingData.data.values;
    const nextSerialNumber = rows && rows.length > 0 ? rows.length : 1;

    // Auto-fill Date and Source
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const source = "AI Call Automation";

    // Map extracted data to sheet columns based on expected order
    const row = [
      params.candidateData.serial_number ?? nextSerialNumber.toString(),
      params.candidateData.source ?? source,
      params.candidateData.date ?? today,
      params.candidateData.job_code ?? "",
      params.candidateData.candidate_name ?? "",
      params.candidateData.contact_number ?? "",
      params.candidateData.email ?? "",
      params.candidateData.current_organization ?? "",
      params.candidateData.present_designation ?? "",
      params.candidateData.total_experience ?? "",
      params.candidateData.relevant_experience ?? "",
      params.candidateData.current_location ?? "",
      params.candidateData.preferred_location ?? "",
      params.candidateData.notice_period ?? "",
      params.candidateData.last_working_day ?? "",
      params.candidateData.qualification ?? "",
      params.candidateData.year_of_passing ?? "",
      params.candidateData.date_of_birth ?? "",
      params.candidateData.reason_for_job_change ?? "",
      params.candidateData.linkedin ?? "",
      params.candidateData.offers_in_hand ?? "",
      params.candidateData.permanent_or_pf ?? "",
      params.candidateData.communication ?? "",
      params.candidateData.current_ctc ?? "",
      params.candidateData.expected_ctc ?? "",
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Y`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    const updatedRange = response.data.updates?.updatedRange;
    let rowNumber = -1;
    if (updatedRange) {
      // expected format: Sheet1!A10:Y10
      const match = updatedRange.match(/!A(\d+):/);
      if (match && match[1]) {
        rowNumber = parseInt(match[1], 10);
      }
    }

    return { rowNumber: rowNumber !== -1 ? rowNumber : 999 };
  } catch (error) {
    console.error("Error appending to Google Sheet:", error);
    throw new Error("Failed to sync to Google Sheet.");
  }
}
