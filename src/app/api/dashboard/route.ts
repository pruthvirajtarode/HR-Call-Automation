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
    // Filter out rows that are completely empty or represent the header
    const actualRows = rows.filter(row => {
      if (!row || row.length === 0) return false;
      if (row[0] === 'Sl No' || row[1] === 'Source') return false; // Skip header
      if (!row[0] && !row[1] && !row[4]) return false; // Skip empty rows
      return true;
    });

    const totalCandidates = actualRows.length;
    
    // Calculate realistic dynamic metrics based on actual sheet volume
    const hoursSaved = totalCandidates > 0 ? Math.round(totalCandidates * 0.5) : 0; // Estimate: 30 mins saved per candidate
    const avgSyncTime = totalCandidates > 0 ? "3.2s (Estimate)" : "N/A"; 
    const aiAccuracy = totalCandidates > 0 ? "98.4% (Demo Metric)" : "N/A";

    // Dynamic Chart: Source (Pie Chart) - Column B (index 1)
    const sourceCount: Record<string, number> = {};
    actualRows.forEach(row => {
      let src = row[1]?.trim() || "Direct";
      if (src.toLowerCase() === 'ai call') src = 'AI Call Automation';
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    });

    const pieData = Object.entries(sourceCount).map(([name, value]) => ({ name, value }));

    // Dynamic Chart: Roles (Bar Chart) - Column I (index 8)
    const roleCount: Record<string, number> = {};
    actualRows.forEach(row => {
      let role = row[8]?.trim() || "Unknown";
      // Simplify long role names or categorize them
      if (role.toLowerCase().includes("software") || role.toLowerCase().includes("developer")) role = "Engineering";
      else if (role.toLowerCase().includes("product")) role = "Product";
      else if (role.toLowerCase().includes("data") || role.toLowerCase().includes("analyst")) role = "Data";
      else if (role.length > 15) role = role.substring(0, 15) + '...'; // truncate long unknown roles
      
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    const barData = Object.entries(roleCount).map(([name, count]) => ({ name, count }));

    // Dynamic Chart: Timeline (Area Chart) - Column C (index 2)
    const dateCount: Record<string, number> = {};
    actualRows.forEach(row => {
      let dateStr = row[2]?.trim();
      if (!dateStr) return;
      
      // Attempt to standardize date parsing. e.g. "28 Sept 2026"
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          // format as "DD MMM"
          const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          dateCount[formatted] = (dateCount[formatted] || 0) + 1;
        } else {
          // fallback if parsing fails
          dateCount[dateStr.substring(0, 6)] = (dateCount[dateStr.substring(0, 6)] || 0) + 1;
        }
      } catch (e) {
        dateCount[dateStr.substring(0, 6)] = (dateCount[dateStr.substring(0, 6)] || 0) + 1;
      }
    });

    let areaData = Object.entries(dateCount)
      .map(([name, candidates]) => ({ name, candidates }));
      
    // If we don't have enough data points, pad it for a better looking chart
    if (areaData.length === 0) {
      areaData = [{ name: 'Today', candidates: 0 }];
    } else if (areaData.length === 1) {
      areaData.unshift({ name: 'Prev', candidates: 0 });
    }

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
