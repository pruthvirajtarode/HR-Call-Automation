import { NextResponse } from 'next/server';
import { checkDuplicateInGoogleSheet } from '@/services/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, name } = body;

    const result = await checkDuplicateInGoogleSheet(email, phone, name);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Check duplicate error:", error);
    return NextResponse.json({ isDuplicate: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
