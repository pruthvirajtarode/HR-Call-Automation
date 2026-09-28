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

    let callRecordId = `mock-call-${Date.now()}`;
    let isDbWritable = true;
    
    // Create Call record
    try {
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
      callRecordId = callRecord.id;
    } catch (dbError) {
      console.warn("Database write failed (likely Vercel read-only file system). Proceeding with AI processing in-memory...");
      isDbWritable = false;
    }

    try {
      // 1. Transcribe
      const transcriptText = await transcribeAudio(filePath, file.type);
      
      let transcriptRecord = { id: `mock-tx-${Date.now()}`, content: transcriptText };
      if (isDbWritable) {
        await prisma.candidateCall.update({
          where: { id: callRecordId },
          data: { status: 'EXTRACTING' }
        });
        
        transcriptRecord = await prisma.transcript.create({
          data: { callId: callRecordId, content: transcriptText }
        });
      }

      // 2. Extract
      const extractedJson = await extractCandidateData(transcriptText);
      
      let extractionRecord = { id: `mock-ex-${Date.now()}`, extractedData: JSON.stringify(extractedJson) };
      if (isDbWritable) {
        extractionRecord = await prisma.candidateExtraction.create({
          data: {
            callId: callRecordId,
            extractedData: JSON.stringify(extractedJson),
            status: 'PENDING'
          }
        });

        await prisma.candidateCall.update({
          where: { id: callRecordId },
          data: { status: 'REVIEW_REQUIRED' }
        });
      }

      return NextResponse.json({
        success: true,
        callId: callRecordId,
        transcript: transcriptRecord,
        extraction: extractionRecord,
        status: 'REVIEW_REQUIRED'
      });

    } catch (processError: any) {
      console.error("Processing error:", processError);
      if (isDbWritable) {
        await prisma.candidateCall.update({
          where: { id: callRecordId },
          data: { 
            status: 'FAILED',
            errorMessage: processError.message 
          }
        });
      }
      return NextResponse.json({ error: 'Processing failed', details: processError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
