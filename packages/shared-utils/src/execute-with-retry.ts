/**
 * @fileoverview Retry utility with exponential backoff and structured output validation loop.
 *
 * Wraps an async function that returns raw string output (typically an LLM call)
 * with retry logic that:
 * - Optionally validates output against a Zod schema on each attempt.
 * - Feeds structured validation error details back into the next call as feedback.
 * - Applies exponential backoff (capped at MAX_DELAY_MS) between attempts.
 * - Emits an onRetry callback before each retry for observability.
 */

import { type ZodSchema } from "zod";
import { extractJSON, validateOutput } from "./structured-output.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 100;
const MAX_DELAY_MS = 5_000;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RetryOptions<T> {
  /** Maximum number of retry attempts after the initial call. Default: 3. */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff. Default: 100. */
  baseDelayMs?: number;
  /**
   * Zod schema to validate extracted JSON from fn's output.
   * When provided, executeWithRetry returns a validated T.
   * When omitted, executeWithRetry returns the raw string.
   */
  schema?: ZodSchema<T>;
  /**
   * Called before each retry attempt (not before the first call).
   * @param attempt - 1-based retry number (1 = first retry, 2 = second, ...).
   * @param error - The Error that triggered this retry.
   * @param lastOutput - The raw string output from the previous attempt, if any.
   */
  onRetry?: (attempt: number, error: Error, lastOutput?: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeDelay(baseDelayMs: number, attempt: number): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  return Math.min(exponential, MAX_DELAY_MS);
}

function buildValidationFeedback(error: Error): string {
  return (
    `Previous output had these validation errors:\n${error.message}\n` +
    `Return corrected output.`
  );
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Execute `fn` with exponential backoff and optional structured output validation.
 *
 * On each attempt `fn` receives an optional feedback string describing why the
 * previous output failed.  The first call always receives `undefined`.
 *
 * When `options.schema` is provided the raw string is first passed through
 * `extractJSON` then `validateOutput`.  On failure the Zod error details are
 * forwarded as feedback to the next attempt.
 *
 * Non-validation errors (i.e. `fn` throws) are also retried with an empty
 * feedback string so the callee knows a retry is occurring.
 *
 * @throws {Error} when all retries are exhausted, with message:
 *   `"executeWithRetry exhausted N retries: <last error message>"`
 *
 * @example
 * ```ts
 * const result = await executeWithRetry(
 *   (feedback) => llm.call({ prompt: buildPrompt(feedback) }),
 *   { schema: MySchema, maxRetries: 3, baseDelayMs: 100 },
 * );
 * ```
 */
export async function executeWithRetry<T = string>(
  fn: (feedback?: string) => Promise<string>,
  options?: RetryOptions<T>,
): Promise<T | string> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const schema = options?.schema;
  const onRetry = options?.onRetry;

  let lastError: Error = new Error("No attempts made");
  let lastOutput: string | undefined;
  let feedback: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delayMs = computeDelay(baseDelayMs, attempt - 1);
      onRetry?.(attempt, lastError, lastOutput);
      await sleep(delayMs);
    }

    try {
      const output = await fn(feedback);
      lastOutput = output;

      if (schema === undefined) {
        return output;
      }

      // Validate structured output.
      try {
        const parsed = extractJSON(output);
        const validated = validateOutput(schema, parsed);
        return validated as T;
      } catch (validationError) {
        lastError = validationError as Error;
        feedback = buildValidationFeedback(lastError);
        // Fall through to next iteration.
      }
    } catch (fnError) {
      lastError = fnError as Error;
      feedback = undefined;
      lastOutput = undefined;
      // Fall through to next iteration.
    }
  }

  throw new Error(`executeWithRetry exhausted ${maxRetries} retries: ${lastError.message}`);
}
