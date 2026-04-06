import { describe, it, expect } from "vitest";
import { normalize } from "../src/mission/normalizer.js";

describe("normalize", () => {
  it("French informal: strips stopwords and resolves slang alias", () => {
    const result = normalize("rendez moi ça propre");
    expect(result.keywords).toEqual(["clean"]);
  });

  it("French security: resolves verb, adjective, and project aliases", () => {
    const result = normalize("vérif sécu compta");
    expect(result.keywords).toEqual(["review", "security", "agent-comptable"]);
  });

  it("English with project: keeps known keyword, resolves project alias", () => {
    const result = normalize("review agent-comptable architecture");
    expect(result.keywords).toEqual(["review", "agent-comptable", "architecture"]);
  });

  it("Skill extraction: pulls /skill tokens into skills array", () => {
    const result = normalize("review compta /security-scan /gdpr-check");
    expect(result.skills).toEqual(["/security-scan", "/gdpr-check"]);
    expect(result.keywords).toEqual(["review", "agent-comptable"]);
  });

  it("Flag extraction: pulls --key value pairs into flags record", () => {
    const result = normalize("review compta --scope backend");
    expect(result.flags).toEqual({ scope: "backend" });
    expect(result.keywords).toEqual(["review", "agent-comptable"]);
  });

  it("Mixed French/English: resolves slang and project alias", () => {
    const result = normalize("fix the broken truc in eagles");
    expect(result.keywords).toContain("fix");
    expect(result.keywords).toContain("broken");
    expect(result.keywords).toContain("thing");
    expect(result.keywords).toContain("eagles-ai-platform");
  });

  it("Empty input: returns empty arrays and empty flags", () => {
    const result = normalize("");
    expect(result.keywords).toEqual([]);
    expect(result.skills).toEqual([]);
    expect(result.flags).toEqual({});
  });

  it("Pure stopwords: returns empty keywords array", () => {
    const result = normalize("le la les un une");
    expect(result.keywords).toEqual([]);
  });

  it("Slang: c'est pété faut fixer compta resolves broken, fix, agent-comptable", () => {
    const result = normalize("c'est pété faut fixer compta");
    expect(result.keywords).toContain("broken");
    expect(result.keywords).toContain("fix");
    expect(result.keywords).toContain("agent-comptable");
  });

  it("Preserves originalInput: output field matches exact input string", () => {
    const input = "vérif sécu compta --scope backend /gdpr-check";
    const result = normalize(input);
    expect(result.originalInput).toBe(input);
  });
});
