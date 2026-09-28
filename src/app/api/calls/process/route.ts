import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { transcribeAudio, extractCandidateData } from '@/services/ai';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const candidateId = formData.get('candidateId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Save to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(filePath, buffer);

    // Create Call record
    const callRecord = await prisma.candidateCall.create({
      data: {
        audioFileName: file.name,
        audioFilePath: filePath,
        fileSize: file.size,
        mimeType: file.type,
        status: 'TRANSCRIBING',
        ...(candidateId ? { candidateId } : {})
      }
    });

    // We start the processing asynchronously or inline. For MVP, we'll await it so we can return the result, 
    // or we can implement real background jobs. The user request asks for proper states: UPLOADED -> TRANSCRIBING... 
    // Given the constraints of Next.js serverless architecture (and Vercel limits), background processing is tricky without external queues.
    // However, since we are doing this locally/for MVP, we'll await it or do it in the background if node process allows.
    // Let's do it synchronously for MVP simplicity and to return the final extracted data to UI quickly.

    try {
      // 1. Transcribe
      const transcriptText = await transcribeAudio(filePath, file.type);
      
      await prisma.candidateCall.update({
        where: { id: callRecord.id },
        data: { status: 'EXTRACTING' }
      });
      
      const transcriptRecord = await prisma.transcript.create({
        data: {
          callId: callRecord.id,
          content: transcriptText
        }
      });

      // 2. Extract
      const extractedJson = await extractCandidateData(transcriptText);
      
      const extractionRecord = await prisma.candidateExtraction.create({
        data: {
          callId: callRecord.id,
          extractedData: JSON.stringify(extractedJson),
          status: 'PENDING'
        }
      });

      await prisma.candidateCall.update({
        where: { id: callRecord.id },
        data: { status: 'REVIEW_REQUIRED' }
      });

      return NextResponse.json({
        success: true,
        callId: callRecord.id,
        transcript: transcriptRecord,
        extraction: extractionRecord,
        status: 'REVIEW_REQUIRED'
      });

    } catch (processError: any) {
      console.error("Processing error:", processError);
      await prisma.candidateCall.update({
        where: { id: callRecord.id },
        data: { 
          status: 'FAILED',
          errorMessage: processError.message 
        }
      });
      return NextResponse.json({ error: 'Processing failed', details: processError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
