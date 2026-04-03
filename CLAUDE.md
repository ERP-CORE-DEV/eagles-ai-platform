# RH-OptimERP — Shared Team Instructions

## Session Start (MANDATORY)
When a developer identifies themselves ("I am the developer X", "i'm X", etc.), you MUST:
1. Call `mcp__team-sync__startup_check` FIRST
2. Call `mcp__team-sync__team_status` to show the dashboard
3. Then greet the developer with their context

This is non-negotiable. The team-sync banner must appear at the start of every session.

## Team
| Developer | Branch | Microservice |
|-----------|--------|-------------|
| HATIM | hatim | MS 5.1 — Sourcing & Candidate Attraction |
| MOHAMMED-REDA | MOHAMMED-REDA | MS 5.8 — Talent Management |
| HOUSSINE | HOUSSINE | MS 5.3 — Hiring Process Management |
| HOUDAIFA | HOUDAIFA | MS 5.12 — Integration & Onboarding |
| HASSAN | HASSAN | MS 5.2 — Candidate Evaluation |

## Architecture
- **12 microservices** under `C:\RH-OptimERP\`
- **EAGLES AI Platform**: `C:\RH-OptimERP\eagles-ai-platform\`
- **MCPs**: `C:\RH-OptimERP\MCPs\`
- **Shared config**: `C:\RH-OptimERP\eagles-claude-config\`
- **Pattern**: Controller-Service-Repository (NOT CQRS)
- **Stack**: .NET 8 + React 18 + Cosmos DB + Azure AKS

## Healing
If MCPs are broken, run in Git Bash:
```bash
cd /c/RH-OptimERP/eagles-claude-config && git fetch origin main && git reset --hard origin/main && node scripts/heal.js
```
Then restart VS Code.
