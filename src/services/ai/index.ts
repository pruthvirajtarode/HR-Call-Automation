import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize Gemini SDK
// If GEMINI_API_KEY is missing, we use a fallback mock mode for the demo
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) 
  : null;

export async function transcribeAudio(filePath: string, mimeType: string = "audio/mp3"): Promise<string> {
  if (!ai) {
    console.warn("No GEMINI_API_KEY provided. Using mock transcription.");
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `HR: Hello, can you hear me?
Candidate: Yes, I can hear you clearly.
HR: Great. Can you tell me about your current organization and role?
Candidate: I am currently working at ABC Technologies as a Senior Android Developer.
HR: How much experience do you have?
Candidate: I have around 5 years of total experience, and 4 years of relevant experience in Android.
HR: What's your current location and preferred location?
Candidate: I'm based in Bengaluru, and I prefer to stay in Bengaluru.
HR: What is your current CTC and expected CTC?
Candidate: My current CTC is 10 LPA and I am expecting around 14 LPA.
HR: And what is your notice period?
Candidate: I have a 30 days notice period.
HR: Thank you, we will get back to you.`;
  }

  try {
    const fileBytes = fs.readFileSync(filePath);
    const base64Data = fileBytes.toString("base64");
    
    // Gemini 1.5 models support audio via inlineData
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Please transcribe this audio recording of a job interview. Label the speakers if possible."
            }
          ]
        }
      ]
    });
    
    return response.text ?? "Failed to extract transcript text.";
  } catch (error) {
    console.error("Transcription failed:", error);
    throw new Error("Failed to transcribe audio using AI.");
  }
}

export async function extractCandidateData(transcript: string) {
  if (!ai) {
    console.warn("No GEMINI_API_KEY provided. Using mock extraction.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      candidate_name: { value: "Unknown", confidence: 0, source_text: null, status: "missing" },
      contact_number: { value: null, confidence: 0, source_text: null, status: "missing" },
      email: { value: null, confidence: 0, source_text: null, status: "missing" },
      current_organization: { value: "ABC Technologies", confidence: 0.95, source_text: "I am currently working at ABC Technologies", status: "extracted" },
      present_designation: { value: "Senior Android Developer", confidence: 0.95, source_text: "as a Senior Android Developer", status: "extracted" },
      total_experience: { value: "5 Years", confidence: 0.9, source_text: "I have around 5 years of total experience", status: "extracted" },
      relevant_experience: { value: "4 Years", confidence: 0.9, source_text: "4 years of relevant experience in Android", status: "extracted" },
      current_location: { value: "Bengaluru", confidence: 0.95, source_text: "I'm based in Bengaluru", status: "extracted" },
      preferred_location: { value: "Bengaluru", confidence: 0.95, source_text: "prefer to stay in Bengaluru", status: "extracted" },
      notice_period: { value: "30 Days", confidence: 0.9, source_text: "I have a 30 days notice period", status: "extracted" },
      current_ctc: { value: "10 LPA", confidence: 0.95, source_text: "My current CTC is 10 LPA", status: "extracted" },
      expected_ctc: { value: "14 LPA", confidence: 0.9, source_text: "expecting around 14 LPA", status: "extracted" }
    };
  }

  const prompt = `
You are an expert HR recruitment assistant. Extract candidate information from the following interview transcript.
Follow these strict rules:
1. Extract ONLY information supported by the transcript.
2. Never hallucinate.
3. Never infer personal information without evidence.
4. Preserve exact values when possible (e.g. "around 5 years").
5. If information is unclear, mark status as "uncertain".
6. If information is absent, mark status as "missing" and value as null.
7. Return STRICT STRUCTURED JSON matching the requested schema.

Transcript:
"""
${transcript}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            candidate_name: getFieldSchema(),
            contact_number: getFieldSchema(),
            email: getFieldSchema(),
            current_organization: getFieldSchema(),
            present_designation: getFieldSchema(),
            total_experience: getFieldSchema(),
            relevant_experience: getFieldSchema(),
            current_location: getFieldSchema(),
            preferred_location: getFieldSchema(),
            notice_period: getFieldSchema(),
            last_working_day: getFieldSchema(),
            qualification: getFieldSchema(),
            year_of_passing: getFieldSchema(),
            date_of_birth: getFieldSchema(),
            reason_for_job_change: getFieldSchema(),
            linkedin: getFieldSchema(),
            offers_in_hand: getFieldSchema(),
            permanent_or_pf: getFieldSchema(),
            communication: getFieldSchema(),
            current_ctc: getFieldSchema(),
            expected_ctc: getFieldSchema()
          },
          required: [
            "candidate_name", "contact_number", "email", "current_organization", 
            "present_designation", "total_experience", "relevant_experience", 
            "current_location", "preferred_location", "notice_period", "current_ctc", "expected_ctc"
          ]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Extraction failed:", error);
    throw new Error("Failed to extract candidate data using AI.");
  }
}

function getFieldSchema() {
  return {
    type: "OBJECT",
    properties: {
      value: { type: "STRING", nullable: true },
      confidence: { type: "NUMBER" },
      source_text: { type: "STRING", nullable: true },
      status: { type: "STRING", enum: ["extracted", "missing", "uncertain"] }
    },
    required: ["value", "confidence", "status"]
  };
}
