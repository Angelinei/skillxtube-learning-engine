import type {
  LearningPack,
  LearningSource,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

/**
 * Validate a generated pack's shape and check that each evidence excerpt is
 * present verbatim in the supplied source. This does not prove that a claim
 * is true or that an explanation is pedagogically sound.
 */
export function validateLearningPack(
  source: LearningSource,
  pack: LearningPack
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const add = (code: ValidationIssue["code"], path: string, message: string) =>
    issues.push({ code, path, message });

  if (!source.text.trim()) add("EMPTY_SOURCE", "source.text", "Source text must not be empty.");
  if (!pack.title.trim()) add("EMPTY_TITLE", "title", "Pack title must not be empty.");
  if (!pack.summary.trim()) add("EMPTY_SUMMARY", "summary", "Pack summary must not be empty.");
  if (pack.objectives.length === 0) add("NO_OBJECTIVES", "objectives", "Add at least one learning objective.");
  if (pack.quiz.length === 0) add("NO_QUESTIONS", "quiz", "Add at least one quiz question.");

  const ids = new Set<string>();
  const checkId = (id: string, path: string) => {
    if (!id.trim()) {
      add("DUPLICATE_ID", path, "IDs must be non-empty and unique.");
      return;
    }
    if (ids.has(id)) add("DUPLICATE_ID", path, `Duplicate ID "${id}".`);
    ids.add(id);
  };

  const checkEvidence = (evidence: string, path: string) => {
    if (!evidence.trim()) {
      add("MISSING_EVIDENCE", path, "Provide an exact source excerpt as evidence.");
    } else if (!source.text.includes(evidence)) {
      add("EVIDENCE_NOT_IN_SOURCE", path, "Evidence must appear verbatim in source.text.");
    }
  };

  pack.objectives.forEach((objective, index) => {
    checkId(objective.id, `objectives[${index}].id`);
    if (!objective.description.trim()) {
      add("EMPTY_SUMMARY", `objectives[${index}].description`, "Objective description must not be empty.");
    }
    checkEvidence(objective.evidence, `objectives[${index}].evidence`);
  });

  pack.quiz.forEach((question, index) => {
    const path = `quiz[${index}]`;
    checkId(question.id, `${path}.id`);
    if (!question.question.trim()) {
      add("EMPTY_SUMMARY", `${path}.question`, "Question text must not be empty.");
    }
    if (question.options.length < 2) {
      add("INVALID_OPTIONS", `${path}.options`, "A question needs at least two answer options.");
    }
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (!option.id.trim() || optionIds.has(option.id)) {
        add("INVALID_OPTIONS", `${path}.options`, "Option IDs must be non-empty and unique within a question.");
      }
      optionIds.add(option.id);
      if (!option.text.trim()) {
        add("INVALID_OPTIONS", `${path}.options`, "Option text must not be empty.");
      }
    }
    if (!optionIds.has(question.correctOptionId)) {
      add("INVALID_CORRECT_OPTION", `${path}.correctOptionId`, "The correct option must reference an existing option.");
    }
    if (!question.explanation.trim()) {
      add("EMPTY_SUMMARY", `${path}.explanation`, "Add an explanation for the answer.");
    }
    checkEvidence(question.evidence, `${path}.evidence`);
  });

  return { valid: issues.length === 0, issues };
}
