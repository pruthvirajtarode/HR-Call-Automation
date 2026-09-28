import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        calls: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        trackerSyncs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(candidates);
  } catch (error: any) {
    console.error("GET candidates error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
