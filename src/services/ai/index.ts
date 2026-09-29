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
    return `Recruiter: Hello Rahul sir, good morning. Prakash this side from ABC consultancy. Am I speaking with Rahul Sharma?
Candidate: Yes, speaking.
Recruiter: Sir, can you confirm your email and number for our records? Is it rahul.s@gmail.com and 9876543210?
Candidate: Yes, that's correct.
Recruiter: Actually sir, aapka profile dekha tha. Ek opening hai Senior Software Engineer ki. Are you looking for a change?
Candidate: Yes, actually I am.
Recruiter: Achha okay. Currently kaha work kar rahe ho?
Candidate: Infosys.
Recruiter: Okay. Designation?
Candidate: Senior Software Engineer.
Recruiter: Total experience kitna hai?
Candidate: Six years overall, relevant around four and half.
Recruiter: Achha. Current location?
Candidate: Pune.
Recruiter: This position is Bangalore. Relocation possible?
Candidate: Yes, that's fine.
Recruiter: Okay. Notice period?
Candidate: 60 days.
Recruiter: Current CTC?
Candidate: Around 12.5 LPA.
Recruiter: Expected?
Candidate: Maybe 16, depending on the role.
Recruiter: Okay okay.
Candidate: Actually sir, I already have one offer.
Recruiter: Oh okay. What's the offer?
Candidate: Around 15.
Recruiter: Fine. And why are you looking for a change?
Candidate: Better growth and role.
Recruiter: Okay sir, I'll send you the JD on WhatsApp. You can check it.
Candidate: Sure sir.
Recruiter: Thank you.
Candidate: Thank you.`;
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
      candidate_name: { value: "Rahul Sharma", confidence: 0.98, source_text: "Am I speaking with Rahul Sharma? ... Yes, speaking.", speaker: "candidate", status: "extracted" },
      contact_number: { value: "9876543210", confidence: 0.98, source_text: "9876543210? ... Yes, that's correct.", speaker: "candidate", status: "extracted" },
      email: { value: "rahul.s@gmail.com", confidence: 0.98, source_text: "rahul.s@gmail.com ... Yes, that's correct.", speaker: "candidate", status: "extracted" },
      current_organization: { value: "Infosys", confidence: 0.98, source_text: "Infosys.", speaker: "candidate", status: "extracted" },
      present_designation: { value: "Senior Software Engineer", confidence: 0.98, source_text: "Senior Software Engineer.", speaker: "candidate", status: "extracted" },
      total_experience: { value: "6 years", confidence: 0.98, source_text: "Six years overall", speaker: "candidate", status: "extracted" },
      relevant_experience: { value: "4.5 years", confidence: 0.95, source_text: "relevant around four and half.", speaker: "candidate", status: "extracted" },
      current_location: { value: "Pune", confidence: 0.98, source_text: "Pune.", speaker: "candidate", status: "extracted" },
      preferred_location: { value: "Bangalore", confidence: 0.95, source_text: "Yes, that's fine.", speaker: "candidate", status: "extracted" },
      notice_period: { value: "60 days", confidence: 0.98, source_text: "60 days.", speaker: "candidate", status: "extracted" },
      current_ctc: { value: "12.5 LPA", confidence: 0.95, source_text: "Around 12.5 LPA.", speaker: "candidate", status: "extracted" },
      expected_ctc: { value: "16 LPA", confidence: 0.90, source_text: "Maybe 16, depending on the role.", speaker: "candidate", status: "extracted" },
      offers_in_hand: { value: "1 (15 LPA)", confidence: 0.98, source_text: "I already have one offer. [...] Around 15.", speaker: "candidate", status: "extracted" },
      reason_for_job_change: { value: "Better growth and role", confidence: 0.98, source_text: "Better growth and role.", speaker: "candidate", status: "extracted" },
      job_interest: { value: "interested", confidence: 0.95, source_text: "Yes, actually I am.", speaker: "candidate", status: "extracted" },
      follow_up_required: { value: "true", confidence: 0.95, source_text: "I'll send you the JD on WhatsApp. You can check it.", speaker: "recruiter", status: "extracted" },
    };
  }

  const prompt = `
You are an expert HR recruitment assistant. Extract candidate information from the following natural conversation transcript between a Recruiter and a Candidate.
The conversation may be in English, Hindi, or Hinglish. Do not get confused by casual chat, small talk, or greetings.
Follow these strict rules:
1. CONVERSATION SHOULD BE TREATED AS A WHOLE: Read the entire transcript. The order of information is random.
2. SPEAKER AWARENESS: Identify if the Recruiter or Candidate said it. Prefer Candidate-confirmed information. If Recruiter states a fact (e.g. "You are in Pune") and Candidate corrects it ("No, Mumbai"), use the corrected value.
3. HANDLE CORRECTIONS: The latest clear correction overrides earlier values. If there is an unresolved contradiction, set status to "conflicting".
4. APPROXIMATE INFORMATION: Preserve approximate values (e.g., "around 5 years", "almost 60 days"). Do not unnecessarily convert them to false precision.
5. NEVER HALLUCINATE MISSING INFO: If not discussed, set status to "missing" and value to null.
6. FIELD-LEVEL EVIDENCE: Provide the exact source_text (and source_timestamp if available), and assign a realistic confidence score (0.0 to 1.0). High confidence means candidate explicitly stated it.
7. RECRUITER SMALL TALK: Ignore greetings, jokes, or casual chat. Only extract recruitment data.

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
            expected_ctc: getFieldSchema(),
            job_interest: getFieldSchema(),
            availability: getFieldSchema(),
            joining_date: getFieldSchema(),
            candidate_preference: getFieldSchema(),
            recruiter_observation: getFieldSchema(),
            candidate_questions: getFieldSchema(),
            call_outcome: getFieldSchema(),
            follow_up_required: getFieldSchema()
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
      source_timestamp: { type: "STRING", nullable: true },
      speaker: { type: "STRING", enum: ["candidate", "recruiter", "unknown"], nullable: true },
      status: { type: "STRING", enum: ["extracted", "missing", "uncertain", "conflicting", "manually_corrected"] }
    },
    required: ["value", "confidence", "status"]
  };
}
