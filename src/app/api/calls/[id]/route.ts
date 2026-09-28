import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const call = await prisma.candidateCall.findUnique({
      where: { id },
      include: {
        transcript: true,
        extraction: true,
      }
    });

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error: any) {
    console.error("GET call error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
