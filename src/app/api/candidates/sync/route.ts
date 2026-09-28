import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { appendToGoogleSheet } from '@/services/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callId, candidateData } = body;

    if (!candidateData) {
      return NextResponse.json({ error: 'Missing candidate data' }, { status: 400 });
    }

    let candidateId = `mock-candidate-${Date.now()}`;
    let candidate = null;

    try {
      // Upsert Candidate record
      const email = candidateData.email?.value;
      
      if (email) {
        candidate = await prisma.candidate.findUnique({ where: { email } });
        if (candidate) {
          candidate = await prisma.candidate.update({
            where: { email },
            data: {
              candidateName: candidateData.candidate_name?.value,
              contactNumber: candidateData.contact_number?.value,
              currentOrganization: candidateData.current_organization?.value,
              presentDesignation: candidateData.present_designation?.value,
              totalExperience: candidateData.total_experience?.value,
              currentLocation: candidateData.current_location?.value,
            }
          });
        }
      }

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            email: email || undefined,
            candidateName: candidateData.candidate_name?.value,
            contactNumber: candidateData.contact_number?.value,
            currentOrganization: candidateData.current_organization?.value,
            presentDesignation: candidateData.present_designation?.value,
            totalExperience: candidateData.total_experience?.value,
            currentLocation: candidateData.current_location?.value,
          }
        });
      }
      candidateId = candidate.id;
    } catch (dbError) {
      console.warn("Skipping Prisma save due to read-only DB.");
    }

    // Sync to Google Sheet (This works regardless of SQLite)
    let sheetRowNumber: number | null = null;
    let syncStatus = 'PENDING';
    let errorMessage = null;
    let trackerSync = null;

    try {
      // Map ExtractedField back to raw values for google sheets
      const flattenedData: Record<string, any> = {};
      Object.keys(candidateData).forEach(key => {
        flattenedData[key] = candidateData[key]?.value ?? null;
      });

      const syncResult = await appendToGoogleSheet({ candidateData: flattenedData });
      sheetRowNumber = syncResult.rowNumber;
      syncStatus = 'SUCCESS';
    } catch (err: any) {
      syncStatus = 'FAILED';
      errorMessage = err.message;
    }

    try {
      // Record the Sync
      trackerSync = await prisma.trackerSync.create({
        data: {
          candidateId: candidateId,
          status: syncStatus,
          sheetRowNumber,
          errorMessage
        }
      });

      if (callId && !callId.startsWith('mock-')) {
        await prisma.candidateCall.update({
          where: { id: callId },
          data: { 
            status: syncStatus === 'SUCCESS' ? 'SYNCED' : 'APPROVED',
            candidateId: candidateId
          }
        });
      }
    } catch (dbError) {
      console.warn("Skipping Tracker update due to read-only DB.");
    }

    return NextResponse.json({
      success: true,
      candidate: candidate || { id: candidateId },
      sync: trackerSync || { status: syncStatus, sheetRowNumber },
      status: syncStatus
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
