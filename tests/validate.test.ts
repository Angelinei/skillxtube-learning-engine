import { describe, expect, it } from "vitest";
import { createLearningPack, LearningPackValidationError, validateLearningPack } from "../src/index.js";
import type { LearningPack, LearningSource } from "../src/index.js";

const source: LearningSource = {
  title: "Retrieval practice",
  text: "Retrieval practice means actively recalling information from memory. Spaced practice distributes learning over time.",
};

const validPack: LearningPack = {
  title: "Retrieval practice basics",
  summary: "Two practical ideas for remembering information.",
  objectives: [{
    id: "objective-1",
    description: "Explain retrieval practice.",
    evidence: "actively recalling information from memory",
  }],
  quiz: [{
    id: "question-1",
    question: "What does retrieval practice involve?",
    options: [
      { id: "a", text: "Actively recalling information from memory" },
      { id: "b", text: "Reading the same page without a goal" },
    ],
    correctOptionId: "a",
    explanation: "The source defines it as actively recalling information.",
    evidence: "Retrieval practice means actively recalling information from memory.",
  }],
};

describe("validateLearningPack", () => {
  it("accepts a pack with evidence found in the source", () => {
    expect(validateLearningPack(source, validPack).valid).toBe(true);
  });

  it("flags evidence that is not an exact source excerpt", () => {
    const pack = structuredClone(validPack);
    pack.quiz[0]!.evidence = "The source says something else.";
    const result = validateLearningPack(source, pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.code === "EVIDENCE_NOT_IN_SOURCE")).toBe(true);
  });

  it("flags a correct option that does not exist", () => {
    const pack = structuredClone(validPack);
    pack.quiz[0]!.correctOptionId = "missing";
    expect(validateLearningPack(source, pack).issues.some(issue => issue.code === "INVALID_CORRECT_OPTION")).toBe(true);
  });
});

describe("createLearningPack", () => {
  it("returns a valid pack from a caller-provided generator", async () => {
    await expect(createLearningPack(source, async () => validPack)).resolves.toEqual(validPack);
  });

  it("throws a structured error when generated content is invalid", async () => {
    const invalid = structuredClone(validPack);
    invalid.quiz[0]!.evidence = "not in source";
    await expect(createLearningPack(source, async () => invalid)).rejects.toBeInstanceOf(LearningPackValidationError);
  });
});
