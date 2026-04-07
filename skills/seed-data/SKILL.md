---
name: seed-data
description: Seed realistic French HR demo data into running backend via PowerShell script
user-invocable: true
tags: testing, data, seeding, dev
---

Seed realistic French HR demo data into all backend engines via REST API calls.

## Usage

- `/seed-data` — Run the seed script against the running backend

## Prerequisites

1. Backend running at `http://localhost:5287` (or custom port)
2. PowerShell 7+ (`pwsh`) available

## What It Creates

| Engine | Count | Details |
|--------|-------|---------|
| Campaigns | 6 | 1 Draft, 2 Active, 1 Paused, 1 Completed, 1 Archived |
| Jobs | 2 | 1 Draft (submittable), 1 Approved (publishable) |
| TalentPool | 6 | Linked to existing candidates, mixed availability |
| Postings | 4 | Linked to active campaigns, realistic job ads |
| Interviews | 4 | Video, OnSite, Telephone — future dates |

## Execution

Run the PowerShell script:

```bash
pwsh -ExecutionPolicy Bypass -File scripts/Seed-DemoData.ps1
```

Optional: specify custom backend URL:

```bash
pwsh -ExecutionPolicy Bypass -File scripts/Seed-DemoData.ps1 -BaseUrl "http://localhost:5000"
```

$ARGUMENTS
