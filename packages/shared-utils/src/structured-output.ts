/**
 * @fileoverview Structured output utilities for agent responses.
 *
 * Provides JSON extraction, Zod validation, and system-prompt injection so
 * that agents can return typed, schema-validated output.
 *
 * Ported from open-multi-agent with EAGLES adaptations:
 * - Inline zodToJsonSchema (no zod-to-json-schema package dependency)
 * - Named exports (no defaults)
 * - Strict TypeScript types throughout
 */

import { type ZodSchema, type ZodTypeAny, ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodOptional, ZodNullable, ZodEnum, ZodLiteral } from "zod";

// ---------------------------------------------------------------------------
// Internal: minimal Zod → JSON Schema conversion
// ---------------------------------------------------------------------------

type JsonSchemaNode =
  | { type: "string" }
  | { type: "number" }
  | { type: "boolean" }
  | { type: "array"; items: JsonSchemaNode }
  | { type: "object"; properties: Record<string, JsonSchemaNode>; required: string[] }
  | { enum: unknown[] }
  | { const: unknown }
  | Record<string, never>;

/**
 * Converts a Zod schema to a plain JSON Schema object.
 *
 * Covers the common structural types used in agent output schemas
 * (object, string, number, boolean, array, optional, nullable, enum, literal).
 * Complex types (union, intersection, transform) fall back to `{}`.
 *
 * @internal
 */
function zodToJsonSchema(schema: ZodTypeAny): JsonSchemaNode {
  if (schema instanceof ZodString) {
    return { type: "string" };
  }
  if (schema instanceof ZodNumber) {
    return { type: "number" };
  }
  if (schema instanceof ZodBoolean) {
    return { type: "boolean" };
  }
  if (schema instanceof ZodArray) {
    return { type: "array", items: zodToJsonSchema(schema._def.type as ZodTypeAny) };
  }
  if (schema instanceof ZodObject) {
    const shape = schema._def.shape() as Record<string, ZodTypeAny>;
    const properties: Record<string, JsonSchemaNode> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      const isOptional =
        value instanceof ZodOptional || value instanceof ZodNullable;
      if (!isOptional) {
        required.push(key);
      }
    }

    return { type: "object", properties, required };
  }
  if (schema instanceof ZodOptional) {
    return zodToJsonSchema(schema._def.innerType as ZodTypeAny);
  }
  if (schema instanceof ZodNullable) {
    return zodToJsonSchema(schema._def.innerType as ZodTypeAny);
  }
  if (schema instanceof ZodEnum) {
    return { enum: schema._def.values as unknown[] };
  }
  if (schema instanceof ZodLiteral) {
    return { const: schema._def.value as unknown };
  }

  // Fallback for union, intersection, transform, etc.
  return {} as Record<string, never>;
}

// ---------------------------------------------------------------------------
// System-prompt instruction builder
// ---------------------------------------------------------------------------

/**
 * Build a JSON-mode instruction block to append to the agent's system prompt.
 *
 * Converts the Zod schema to JSON Schema and formats it as a clear directive
 * for the LLM to respond with valid JSON matching the schema.
 *
 * @example
 * ```ts
 * const instruction = buildStructuredOutputInstruction(MySchema);
 * const systemPrompt = basePrompt + instruction;
 * ```
 */
export function buildStructuredOutputInstruction(schema: ZodSchema): string {
  const jsonSchema = zodToJsonSchema(schema as ZodTypeAny);
  return [
    "",
    "## Output Format (REQUIRED)",
    "You MUST respond with ONLY valid JSON that conforms to the following JSON Schema.",
    "Do NOT include any text, markdown fences, or explanation outside the JSON object.",
    "Do NOT wrap the JSON in ```json code fences.",
    "",
    "```",
    JSON.stringify(jsonSchema, null, 2),
    "```",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// JSON extraction
// ---------------------------------------------------------------------------

/**
 * Attempt to extract and parse JSON from the agent's raw text output.
 *
 * Handles three cases in order:
 * 1. The output is already valid JSON (ideal case).
 * 2. The output contains a ` ```json ` fenced block.
 * 3. The output contains a bare JSON object/array (first `{`/`[` to last `}`/`]`).
 *
 * @throws {Error} when no valid JSON can be extracted.
 *
 * @example
 * ```ts
 * const parsed = extractJSON('{"result": 42}');
 * // or
 * const parsed = extractJSON('```json\n{"result": 42}\n```');
 * ```
 */
export function extractJSON(raw: string): unknown {
  const trimmed = raw.trim();

  // Case 1: Direct parse.
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to fallback strategies.
  }

  // Case 2a: Prefer ```json tagged fence.
  const jsonFenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/);
  if (jsonFenceMatch?.[1]) {
    try {
      return JSON.parse(jsonFenceMatch[1].trim());
    } catch {
      // Continue.
    }
  }

  // Case 2b: Fall back to bare ``` fence.
  const bareFenceMatch = trimmed.match(/```\s*([\s\S]*?)```/);
  if (bareFenceMatch?.[1]) {
    try {
      return JSON.parse(bareFenceMatch[1].trim());
    } catch {
      // Continue.
    }
  }

  // Case 3: Find first { to last } (object).
  const objStart = trimmed.indexOf("{");
  const objEnd = trimmed.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    try {
      return JSON.parse(trimmed.slice(objStart, objEnd + 1));
    } catch {
      // Fall through.
    }
  }

  // Case 3b: Find first [ to last ] (array).
  const arrStart = trimmed.indexOf("[");
  const arrEnd = trimmed.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(trimmed.slice(arrStart, arrEnd + 1));
    } catch {
      // Fall through.
    }
  }

  throw new Error(
    `Failed to extract JSON from output. Raw output begins with: "${trimmed.slice(0, 100)}"`,
  );
}

// ---------------------------------------------------------------------------
// Zod validation
// ---------------------------------------------------------------------------

/**
 * Validate a parsed JSON value against a Zod schema.
 *
 * @returns The validated (and potentially transformed) value on success.
 * @throws {Error} with a human-readable Zod error message on failure.
 *
 * @example
 * ```ts
 * const validated = validateOutput(MySchema, parsed) as MyType;
 * ```
 */
export function validateOutput(schema: ZodSchema, data: unknown): unknown {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  const issues = result.error.issues
    .map(
      (issue) =>
        `  - ${issue.path.length > 0 ? issue.path.join(".") : "(root)"}: ${issue.message}`,
    )
    .join("\n");
  throw new Error(`Output validation failed:\n${issues}`);
}
