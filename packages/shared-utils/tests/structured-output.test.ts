import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  extractJSON,
  validateOutput,
  buildStructuredOutputInstruction,
} from "../src/structured-output.js";

// ---------------------------------------------------------------------------
// extractJSON — all 5 strategies
// ---------------------------------------------------------------------------

describe("extractJSON — 5 extraction strategies", () => {
  it("strategy1_directJSON_parsesImmediately", () => {
    const result = extractJSON('{"a":1}');
    expect(result).toEqual({ a: 1 });
  });

  it("strategy2_jsonFencedBlock_extractsContent", () => {
    const result = extractJSON("```json\n{\"x\": 42}\n```");
    expect(result).toEqual({ x: 42 });
  });

  it("strategy3_bareFencedBlock_extractsContent", () => {
    const result = extractJSON("``` \n{\"y\": true}\n ```");
    expect(result).toEqual({ y: true });
  });

  it("strategy4_prefixObjectSuffix_slicesObject", () => {
    const result = extractJSON('Here is the result: {"score": 99} end');
    expect(result).toEqual({ score: 99 });
  });

  it("strategy5_prefixArraySuffix_slicesArray", () => {
    const result = extractJSON("Result: [1, 2, 3] done");
    expect(result).toEqual([1, 2, 3]);
  });

  it("noValidJSON_throwsError", () => {
    expect(() => extractJSON("this is not json at all")).toThrow(Error);
  });
});

// ---------------------------------------------------------------------------
// validateOutput — typed errors with field path information
// ---------------------------------------------------------------------------

describe("validateOutput — Zod schema validation", () => {
  const PersonSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it("validData_returnsTypedResult", () => {
    const result = validateOutput(PersonSchema, { name: "Alice", age: 30 });
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("wrongShape_throwsErrorContainingFieldPath", () => {
    // "age" is present but wrong type — error must mention the field path.
    let caughtError: Error | null = null;
    try {
      validateOutput(PersonSchema, { name: "Alice", age: "thirty" });
    } catch (err) {
      caughtError = err as Error;
    }

    expect(caughtError).not.toBeNull();
    // The error message must contain the failing field name — behavioral proof
    // that validateOutput surfaces structured Zod issue paths, not a bare boolean.
    expect(caughtError!.message).toContain("age");
  });

  it("missingRequiredField_throwsErrorNamingMissingField", () => {
    let caughtError: Error | null = null;
    try {
      validateOutput(PersonSchema, { name: "Alice" });
    } catch (err) {
      caughtError = err as Error;
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toContain("age");
  });

  it("nestedFieldError_includesNestedPath", () => {
    const AddressSchema = z.object({
      address: z.object({
        zip: z.string(),
      }),
    });

    let caughtError: Error | null = null;
    try {
      validateOutput(AddressSchema, { address: { zip: 12345 } });
    } catch (err) {
      caughtError = err as Error;
    }

    expect(caughtError).not.toBeNull();
    // The error must show the dotted path "address.zip", not just "zip".
    expect(caughtError!.message).toContain("address.zip");
  });
});

// ---------------------------------------------------------------------------
// Retry feedback loop (simulated)
// ---------------------------------------------------------------------------

describe("structured-output — retry feedback loop (simulated)", () => {
  const ResultSchema = z.object({ answer: z.number() });

  /**
   * Simulates an LLM call that accepts a prompt and returns raw text.
   * Uses validateOutput + extractJSON to build the retry loop inline,
   * mirroring what an agent would do in production.
   */
  async function callWithRetry(
    llm: (prompt: string) => Promise<string>,
    maxRetries: number,
  ): Promise<z.infer<typeof ResultSchema>> {
    let lastError = "";
    let prompt = "Initial prompt";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const raw = await llm(prompt);
      let parsed: unknown;
      try {
        parsed = extractJSON(raw);
      } catch {
        lastError = `Could not extract JSON from: ${raw.slice(0, 50)}`;
        prompt = `Initial prompt\n\nPrevious attempt failed: ${lastError}`;
        continue;
      }
      try {
        return validateOutput(ResultSchema, parsed) as z.infer<typeof ResultSchema>;
      } catch (err) {
        lastError = (err as Error).message;
        prompt = `Initial prompt\n\nPrevious attempt failed:\n${lastError}`;
      }
    }
    throw new Error(`Max retries (${maxRetries}) exhausted. Last error: ${lastError}`);
  }

  it("llmFailsOnceThenSucceeds_calledExactlyTwice_secondPromptContainsZodError", async () => {
    const callLog: string[] = [];

    const mockLlm = vi.fn(async (prompt: string) => {
      callLog.push(prompt);
      if (callLog.length === 1) {
        // First call: return bad JSON (wrong type for `answer`).
        return '{"answer": "not-a-number"}';
      }
      // Second call: return valid JSON.
      return '{"answer": 42}';
    });

    const result = await callWithRetry(mockLlm, 3);

    // LLM called exactly 2 times.
    expect(mockLlm).toHaveBeenCalledTimes(2);

    // The second call's prompt must include the Zod validation error from the first attempt.
    const secondPrompt = callLog[1];
    expect(secondPrompt).toContain("answer");

    // Final result is the correctly parsed output.
    expect(result).toEqual({ answer: 42 });
  });

  it("llmAlwaysFails_maxRetriesExhausted_throwsError", async () => {
    const mockLlm = vi.fn(async () => '{"answer": "always-wrong"}');

    await expect(callWithRetry(mockLlm, 2)).rejects.toThrow(/Max retries \(2\) exhausted/);

    // maxRetries=2 means initial + 2 retries = 3 total calls.
    expect(mockLlm).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// buildStructuredOutputInstruction
// ---------------------------------------------------------------------------

describe("buildStructuredOutputInstruction", () => {
  it("outputContainsSchemaFieldNames", () => {
    const Schema = z.object({ score: z.number(), label: z.string() });
    const instruction = buildStructuredOutputInstruction(Schema);

    expect(instruction).toContain("score");
    expect(instruction).toContain("label");
  });

  it("outputContainsMandatoryFormatDirective", () => {
    const Schema = z.object({ ok: z.boolean() });
    const instruction = buildStructuredOutputInstruction(Schema);

    // Must tell the LLM to respond with ONLY valid JSON.
    expect(instruction).toContain("ONLY valid JSON");
  });
});
