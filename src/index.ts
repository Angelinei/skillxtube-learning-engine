export * from "./types.js";
export * from "./validate.js";

import type {
  LearningPack,
  LearningPackGenerator,
  LearningSource,
} from "./types.js";
import { validateLearningPack } from "./validate.js";

export class LearningPackValidationError extends Error {
  readonly issues: ReturnType<typeof validateLearningPack>["issues"];

  constructor(issues: ReturnType<typeof validateLearningPack>["issues"]) {
    super(`Learning pack failed validation with ${issues.length} issue(s).`);
    this.name = "LearningPackValidationError";
    this.issues = issues;
  }
}

/**
 * Ask a caller-supplied generator to create a pack, then validate it before
 * returning it. The library never calls an AI provider or sends data anywhere.
 */
export async function createLearningPack(
  source: LearningSource,
  generate: LearningPackGenerator
): Promise<LearningPack> {
  if (!source.title.trim()) {
    throw new TypeError("source.title must not be empty.");
  }
  if (!source.text.trim()) {
    throw new TypeError("source.text must not be empty.");
  }

  const pack = await generate(source);
  const result = validateLearningPack(source, pack);
  if (!result.valid) throw new LearningPackValidationError(result.issues);
  return pack;
}
