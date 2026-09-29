import { google } from "googleapis";

export interface SyncCandidateToSheetParams {
  candidateData: Record<string, any>;
  action?: 'create' | 'update';
  updateRowNumber?: number;
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
      params.candidateData.serial_number ?? nextSerialNumber.toString(), // A (0)
      params.candidateData.source ?? source, // B (1)
      params.candidateData.date ?? today, // C (2)
      params.candidateData.job_code ?? "", // D (3)
      params.candidateData.candidate_name ?? "", // E (4)
      params.candidateData.contact_number ?? "", // F (5)
      params.candidateData.email ?? "", // G (6)
      params.candidateData.current_organization ?? "", // H (7)
      params.candidateData.present_designation ?? "", // I (8)
      params.candidateData.total_experience ?? "", // J (9)
      params.candidateData.relevant_experience ?? "", // K (10)
      params.candidateData.current_location ?? "", // L (11)
      params.candidateData.preferred_location ?? "", // M (12)
      params.candidateData.notice_period ?? "", // N (13)
      params.candidateData.last_working_day ?? "", // O (14)
      params.candidateData.qualification ?? "", // P (15)
      params.candidateData.year_of_passing ?? "", // Q (16)
      params.candidateData.date_of_birth ?? "", // R (17)
      params.candidateData.reason_for_job_change ?? "", // S (18)
      params.candidateData.linkedin ?? "", // T (19)
      params.candidateData.current_ctc ?? "", // U (20) - CTC
      params.candidateData.expected_ctc ?? "", // V (21) - ECTC
      params.candidateData.offers_in_hand ?? "", // W (22) - Offers in hand
      // Additional data appended after the main columns
      params.candidateData.permanent_or_pf ?? "", // X (23)
      params.candidateData.communication ?? "", // Y (24)
      params.candidateData.job_interest ?? "", // Z (25)
      params.candidateData.availability ?? "", // AA (26)
      params.candidateData.joining_date ?? "", // AB (27)
      params.candidateData.candidate_preference ?? "", // AC (28)
      params.candidateData.recruiter_observation ?? "", // AD (29)
      params.candidateData.candidate_questions ?? "", // AE (30)
      params.candidateData.call_outcome ?? "", // AF (31)
      params.candidateData.follow_up_required ?? "", // AG (32)
    ];

    if (params.action === 'update' && params.updateRowNumber) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${params.updateRowNumber}:AI${params.updateRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
      return { rowNumber: params.updateRowNumber };
    }

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

export async function checkDuplicateInGoogleSheet(email: string, phone: string, name: string): Promise<{ isDuplicate: boolean, rowNumber?: number, matchType?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Candidates";
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!spreadsheetId || !clientEmail || !privateKey) return { isDuplicate: false };

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Y`, // Check up to Y, where Email is G (6), Phone is F (5), Name is E (4)
    });

    const rows = response.data.values || [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rEmail = r[6];
      const rPhone = r[5];
      const rName = r[4];
      
      if (email && rEmail && rEmail.toLowerCase() === email.toLowerCase()) {
        return { isDuplicate: true, rowNumber: i + 1, matchType: 'email' };
      }
      if (phone && rPhone && rPhone.replace(/\D/g, '') === phone.replace(/\D/g, '')) {
        return { isDuplicate: true, rowNumber: i + 1, matchType: 'phone' };
      }
      if (name && rName && rName.toLowerCase() === name.toLowerCase()) {
         return { isDuplicate: true, rowNumber: i + 1, matchType: 'name' };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Duplicate check failed:", error);
    return { isDuplicate: false };
  }
}
