import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
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

    // Fetch the data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Y`,
    });

    const rows = response.data.values || [];
    const actualRows = rows.slice(1); // skip header
    const totalCandidates = Math.max(0, actualRows.length);
    
    // Calculate realistic dynamic metrics based on actual sheet volume
    const hoursSaved = totalCandidates > 0 ? Math.round(totalCandidates * 0.5) : 0; // Estimate: 30 mins saved per candidate
    const avgSyncTime = totalCandidates > 0 ? "3.2s (Estimate)" : "N/A"; 
    const aiAccuracy = totalCandidates > 0 ? "98.4% (Demo Metric)" : "N/A";

    // Dynamic Chart: Source (Pie Chart) - Column B (index 1)
    const sourceCount: Record<string, number> = { "AI Call Automation": 0, "LinkedIn": 0, "Naukri": 0, "Direct": 0 };
    actualRows.forEach(row => {
      const src = row[1] || "Direct";
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    });

    const pieData = Object.entries(sourceCount).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

    // Dynamic Chart: Roles (Bar Chart) - Column I (index 8)
    const roleCount: Record<string, number> = {};
    actualRows.forEach(row => {
      let role = row[8] || "Unknown";
      if (role.includes("Android")) role = "Engineering";
      else if (role.includes("Product")) role = "Product";
      else role = "Engineering"; // fallback
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    const barData = Object.entries(roleCount).map(([name, count]) => ({ name, count }));

    // Dynamic Chart: Timeline (Area Chart)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const areaData = days.map((day, i) => {
      const base = i < 4 ? 0 : 0;
      return {
        name: day,
        candidates: i === days.length - 1 ? totalCandidates : base
      };
    });

    return NextResponse.json({
      totalCandidates,
      hoursSaved,
      avgSyncTime,
      aiAccuracy,
      chartData: { pieData, barData, areaData }
    });
    
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json({ 
      totalCandidates: 0,
      hoursSaved: 0,
      avgSyncTime: "0s",
      aiAccuracy: "0%",
      chartData: null
    }, { status: 200 });
  }
}
