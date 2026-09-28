import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY;
  const isGoogleSheetsConfigured = !!(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">System configuration and integration status.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Configuration</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="font-medium text-slate-800">Gemini API</p>
              <p className="text-sm text-slate-500 mt-1">Used for Audio Transcription and Data Extraction</p>
            </div>
            {isGeminiConfigured ? (
              <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <AlertCircle className="w-4 h-4" /> Missing API Key
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Google Sheets Integration</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="font-medium text-slate-800">Google Service Account</p>
              <p className="text-sm text-slate-500 mt-1">Used to sync candidate data to HR Tracker</p>
            </div>
            {isGoogleSheetsConfigured ? (
              <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <AlertCircle className="w-4 h-4" /> Credentials Missing
              </span>
            )}
          </div>
          {!isGoogleSheetsConfigured && (
            <p className="mt-4 text-sm text-slate-500">
              Please check your <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">.env</code> file and ensure <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GOOGLE_SHEETS_SPREADSHEET_ID</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GOOGLE_PRIVATE_KEY</code> are set.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
