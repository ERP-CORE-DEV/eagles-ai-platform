#!/usr/bin/env node
/**
 * UserPromptSubmit hook: auto-trigger team-sync when developer identifies themselves.
 * Injects additionalContext that tells Claude to call startup_check + team_status.
 */
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').toLowerCase();

    const triggers = [
      "i'm the developer",
      "i am the developer",
      "i'm the devloper",
      "i am the devloper",
      "je suis le développeur",
      "je suis le developpeur",
      "i'm developer",
      "i am developer"
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
  } catch {}
});
