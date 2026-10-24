/** Plain-text source material supplied by the caller. */
export interface LearningSource {
  title: string;
  text: string;
  language?: string;
}

/** A measurable learning objective grounded in the source. */
export interface LearningObjective {
  id: string;
  description: string;
  /** Exact excerpt copied from source.text that supports this objective. */
  evidence: string;
}

/** A multiple-choice question. Exactly one option must match correctOptionId. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
  /** Exact excerpt copied from source.text that supports the correct answer. */
  evidence: string;
}

export interface LearningPack {
  title: string;
  summary: string;
  objectives: LearningObjective[];
  quiz: QuizQuestion[];
}

export interface ValidationIssue {
  code:
    | "EMPTY_SOURCE"
    | "EMPTY_TITLE"
    | "EMPTY_SUMMARY"
    | "NO_OBJECTIVES"
    | "NO_QUESTIONS"
    | "DUPLICATE_ID"
    | "INVALID_OPTIONS"
    | "INVALID_CORRECT_OPTION"
    | "MISSING_EVIDENCE"
    | "EVIDENCE_NOT_IN_SOURCE";
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export type LearningPackGenerator = (
  source: LearningSource
) => Promise<LearningPack>;
