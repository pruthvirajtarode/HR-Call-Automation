export interface ExtractedField<T> {
  value: T | null;
  confidence: number;
  source_text: string | null;
  source_timestamp?: string | null;
  speaker?: "candidate" | "recruiter" | "unknown" | null;
  status: "extracted" | "missing" | "uncertain" | "conflicting" | "manually_corrected";
}

export interface CandidateExtractionSchema {
  serial_number: ExtractedField<string>;
  source: ExtractedField<string>;
  date: ExtractedField<string>;
  job_code: ExtractedField<string>;
  candidate_name: ExtractedField<string>;
  contact_number: ExtractedField<string>;
  email: ExtractedField<string>;
  current_organization: ExtractedField<string>;
  present_designation: ExtractedField<string>;
  total_experience: ExtractedField<string>;
  relevant_experience: ExtractedField<string>;
  current_location: ExtractedField<string>;
  preferred_location: ExtractedField<string>;
  notice_period: ExtractedField<string>;
  last_working_day: ExtractedField<string>;
  qualification: ExtractedField<string>;
  year_of_passing: ExtractedField<string>;
  date_of_birth: ExtractedField<string>;
  reason_for_job_change: ExtractedField<string>;
  linkedin: ExtractedField<string>;
  offers_in_hand: ExtractedField<string>;
  permanent_or_pf: ExtractedField<string>;
  communication: ExtractedField<string>;
  current_ctc: ExtractedField<string>;
  expected_ctc: ExtractedField<string>;
  job_interest?: ExtractedField<string>;
  availability?: ExtractedField<string>;
  joining_date?: ExtractedField<string>;
  candidate_preference?: ExtractedField<string>;
  recruiter_observation?: ExtractedField<string>;
  candidate_questions?: ExtractedField<string>;
  call_outcome?: ExtractedField<string>;
  follow_up_required?: ExtractedField<string | boolean>;
}

export type CandidateProcessingStatus = 
  | "UPLOAD_PENDING"
  | "UPLOADED"
  | "TRANSCRIBING"
  | "TRANSCRIBED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "SYNCING"
  | "SYNCED"
  | "FAILED";
