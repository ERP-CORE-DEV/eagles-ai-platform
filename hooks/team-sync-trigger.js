#!/usr/bin/env node
/**
 * UserPromptSubmit hook: auto-trigger team-sync when developer identifies themselves.
 * Injects additionalContext that tells Claude to call startup_check + team_status.
 */
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf-8'));
const prompt = (data.prompt || '').toLowerCase();

const triggers = [
  "i'm the developer",
  "i am the developer",
  "je suis le développeur",
  "je suis le developpeur",
  "i'm developer",
  "i am developer",
  "hello, i am",
  "bonjour, je suis"
];

if (triggers.some(t => prompt.includes(t))) {
  console.log(JSON.stringify({
    additionalContext: [
      "MANDATORY: Developer identified themselves. You MUST:",
      "1. Use ToolSearch to find mcp__team-sync__startup_check",
      "2. Call mcp__team-sync__startup_check",
      "3. Call mcp__team-sync__team_status",
      "4. Then greet the developer with their context.",
      "Do NOT skip these steps. The team-sync banner must appear."
    ].join("\n")
  }));
}
