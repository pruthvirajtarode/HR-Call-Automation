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
    return `Candidate: Good morning! My name is Priya Sharma. I am calling regarding the product manager position, job code 702. My email ID is priya.sharma@outlook.com, and my contact number is 9876512345. I am currently working at Global Solutions as a Senior Product Manager. I have 8 years of total experience, and 5 years of relevant experience in product management. Currently, I am located in Pune, but my preferred location is Mumbai. My notice period is 60 days, however, my last working day is already decided as October 31st. Regarding my education, I have a Master of Business Administration, year of passing 2017. My date of birth is August 15th, 1994. My reason for job change is that I am looking for a leadership role in a fast-paced environment. You can find me on LinkedIn under Priya Sharma PM. I currently have 2 offers in hand. I am a permanent employee with PF benefits. My current CTC is 25 LPA, and my expected CTC is 32 LPA. Thank you for your time!`;
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
      candidate_name: { value: "Priya Sharma", confidence: 0.99, source_text: "My name is Priya Sharma", status: "extracted" },
      contact_number: { value: "9876512345", confidence: 0.99, source_text: "my contact number is 9 8 7 6 5, 1 2 3 4 5", status: "extracted" },
      email: { value: "priya.sharma@outlook.com", confidence: 0.99, source_text: "My email ID is priya dot sharma at outlook dot com", status: "extracted" },
      current_organization: { value: "Global Solutions", confidence: 0.95, source_text: "working at Global Solutions", status: "extracted" },
      present_designation: { value: "Senior Product Manager", confidence: 0.95, source_text: "as a Senior Product Manager", status: "extracted" },
      total_experience: { value: "8 Years", confidence: 0.9, source_text: "8 years of total experience", status: "extracted" },
      relevant_experience: { value: "5 Years", confidence: 0.9, source_text: "5 years of relevant experience", status: "extracted" },
      current_location: { value: "Pune", confidence: 0.95, source_text: "I am located in Pune", status: "extracted" },
      preferred_location: { value: "Mumbai", confidence: 0.95, source_text: "preferred location is Mumbai", status: "extracted" },
      notice_period: { value: "60 Days", confidence: 0.9, source_text: "My notice period is 60 days", status: "extracted" },
      last_working_day: { value: "October 31st", confidence: 0.9, source_text: "last working day is already decided as October 31st", status: "extracted" },
      qualification: { value: "Master of Business Administration", confidence: 0.9, source_text: "Master of Business Administration", status: "extracted" },
      year_of_passing: { value: "2017", confidence: 0.9, source_text: "year of passing 2 0 1 7", status: "extracted" },
      date_of_birth: { value: "August 15th, 1994", confidence: 0.9, source_text: "date of birth is August 15th, 1994", status: "extracted" },
      reason_for_job_change: { value: "Looking for a leadership role", confidence: 0.9, source_text: "looking for a leadership role in a fast-paced environment", status: "extracted" },
      linkedin: { value: "Priya Sharma PM", confidence: 0.9, source_text: "LinkedIn under Priya Sharma PM", status: "extracted" },
      offers_in_hand: { value: "2", confidence: 0.9, source_text: "2 offers in hand", status: "extracted" },
      permanent_or_pf: { value: "Yes", confidence: 0.9, source_text: "permanent employee with PF benefits", status: "extracted" },
      communication: { value: "Excellent", confidence: 0.9, source_text: "Good morning! My name is Priya Sharma", status: "extracted" },
      current_ctc: { value: "25 LPA", confidence: 0.95, source_text: "My current C T C is 25 LPA", status: "extracted" },
      expected_ctc: { value: "32 LPA", confidence: 0.9, source_text: "expected C T C is 32 LPA", status: "extracted" }
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
