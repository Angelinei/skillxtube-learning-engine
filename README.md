# Skillxtube Learning Engine

A small, provider-agnostic TypeScript library for turning learning content into structured learning packs and checking that learning objectives and quiz answers cite evidence from the supplied source.

**Status:** early MVP (0.1.0). Contributions and feedback are welcome.

## What it does

- Defines a simple data model for source text, learning objectives, summaries and multiple-choice quizzes.
- Accepts any generator function, so you can connect your own model, local model or hand-written content.
- Checks IDs, quiz options, correct-answer references and exact evidence excerpts.
- Exports plain TypeScript types; no database, server, API key or provider dependency.

## What it does not do

- It does not call an AI model or send your content anywhere.
- Exact text matching is not a guarantee of factual accuracy, pedagogical quality or absence of hallucinations.
- It does not download or transcribe YouTube videos. Supply text you have the right to use.

## Requirements

- Node.js 20+
- npm

## Install locally

```bash
npm install
npm run build
npm test
```

## Quick start

```ts
import { createLearningPack } from "@skillxtube/learning-engine";

const source = {
  title: "Retrieval practice",
  text: "Retrieval practice means actively recalling information from memory."
};

const pack = await createLearningPack(source, async (input) => {
  // Connect your preferred AI SDK here, or return hand-written content.
  // The generator must return the LearningPack shape.
  return {
    title: "Retrieval practice",
    summary: "A short introduction to retrieval practice.",
    objectives: [{
      id: "objective-1",
      description: "Explain retrieval practice.",
      evidence: "actively recalling information from memory"
    }],
    quiz: [{
      id: "question-1",
      question: "What does retrieval practice involve?",
      options: [
        { id: "a", text: "Actively recalling information from memory" },
        { id: "b", text: "Only rereading a page" }
      ],
      correctOptionId: "a",
      explanation: "The source describes active recall.",
      evidence: "Retrieval practice means actively recalling information from memory."
    }]
  };
});

console.log(pack);
```

## API

### `validateLearningPack(source, pack)`

Returns `{ valid, issues }`. Each issue includes a stable-ish code, path and human-readable message.

### `createLearningPack(source, generate)`

Calls your async generator and returns the pack only if validation passes. Throws `LearningPackValidationError` with structured `issues` if validation fails.

### Evidence design

Evidence strings must be exact excerpts from `source.text`. This makes it easier for downstream interfaces to show where a question came from. It is a lightweight guardrail, not a semantic fact checker.

## Roadmap

- [ ] Add JSON Schema export for cross-language consumers
- [ ] Add Markdown export helper
- [ ] Add examples for OpenAI-compatible and local model adapters
- [ ] Add difficulty and question-type metadata
- [ ] Add optional semantic evidence checking behind a pluggable interface

## Contributing

Issues, bug reports, documentation fixes and pull requests are welcome. Please include tests for behavior changes.

## License

MIT. See [LICENSE](./LICENSE).
