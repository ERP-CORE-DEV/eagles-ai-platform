# QA Test Scenarios Library

Reference document for @qa-tester agent. Contains click-by-click steps, expected results, and French UI labels for all 8 test scenarios.

---

## S1: Smoke Test — Navigate All Pages

**Goal**: Verify all 13 pages load without runtime JS errors.

| # | Step | Chrome DevTools Call | Expected Result |
|---|------|---------------------|-----------------|
| 1 | Navigate to Dashboard | `navigate_page(url: "http://localhost:3000/")` | Page loads |
| 2 | Check console | `list_console_messages()` | 0 error-level messages |
| 3 | Screenshot | `take_screenshot()` | Visual evidence captured |
| 4 | Repeat for each route | See route list below | Same criteria |

**Routes** (13 total):
```
/                    → Tableau de bord (Dashboard)
/campaigns           → Campagnes
/jobs                → Offres d'emploi
/postings            → Diffusions
/candidates          → Candidats
/talent-pool         → Vivier de talents
/analytics           → Analytique
/reports             → Rapports
/scheduling          → Planification
/integrations        → Intégrations
/matching            → Matching
/duplicate-detection → Détection de doublons
/settings            → Paramètres
```

**Pass criteria**: 0 error-level console messages across all 13 pages.

---

## S2: Campaign Lifecycle

**Goal**: Complete full state machine: Draft → Active → Paused → Active → Completed → Archived

| # | Step | UI Action (French) | API Call | Expected |
|---|------|--------------------|----------|----------|
| 1 | Navigate to Campagnes | `navigate_page("/campaigns")` | — | Page loads |
| 2 | Find Draft campaign | `take_snapshot()` → find row with "Brouillon" | — | Row found |
| 3 | Open actions menu | `click(uid)` on row actions | — | Menu opens |
| 4 | Activate | Click "Activer" | `POST /api/v1/campaigns/{id}/activate?department=X` | Status → "Active" |
| 5 | Pause | Click "Mettre en pause" | `POST /api/v1/campaigns/{id}/pause?department=X` | Status → "En pause" |
| 6 | Resume | Click "Reprendre" | `POST /api/v1/campaigns/{id}/resume?department=X` | Status → "Active" |
| 7 | Complete | Click "Terminer" | `POST /api/v1/campaigns/{id}/complete?department=X` | Status → "Terminée" |
| 8 | Archive | Click "Archiver" | `POST /api/v1/campaigns/{id}/archive` | Status → "Archivée" |

**Known edge case**: Paused→Active must call `/resume` (NOT `/activate`). The `/activate` endpoint only handles Draft→Active. Using `/activate` on a Paused campaign returns 400 "Transition de statut invalide".

**Pass criteria**: All 5 transitions complete with 200 responses.

---

## S3: Job Lifecycle

**Goal**: Complete job state machine: Draft → Review → Approved → Published → Closed

| # | Step | UI Action (French) | API Call | Expected |
|---|------|--------------------|----------|----------|
| 1 | Navigate to Offres | `navigate_page("/jobs")` | — | Page loads |
| 2 | Find Draft job | `take_snapshot()` → find "Brouillon" | — | Row found |
| 3 | Submit for review | Click "Soumettre" | `POST /api/v1/jobs/{id}/submit` | Status → "En révision" |
| 4 | Approve | Click "Approuver" | `POST /api/v1/jobs/{id}/approve` | Status → "Approuvée" |
| 5 | Publish | Click "Publier" | `POST /api/v1/jobs/{id}/publish` | Status → "Publiée" |
| 6 | Close | Click "Clôturer" | `POST /api/v1/jobs/{id}/close` | Status → "Clôturée" |

**French status labels**:
- Brouillon (Draft)
- En révision (In Review)
- Approuvée (Approved)
- Publiée (Published)
- Clôturée (Closed)

**Pass criteria**: All 4 transitions complete without errors.

---

## S4: Form Validation

**Goal**: Submit forms with empty/invalid data — verify validation messages, no crashes.

### Campaign Creation Form
| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | Navigate | `navigate_page("/campaigns")` | Page loads |
| 2 | Click create | Click "Créer une campagne" or "+" button | Form opens |
| 3 | Submit empty | Click "Enregistrer" without filling fields | Validation errors shown |
| 4 | Check console | `list_console_messages()` | 0 error-level (validation is not a crash) |
| 5 | Verify messages | `take_snapshot()` | Error messages visible in French |

### Job Creation Form
| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | Navigate | `navigate_page("/jobs")` | Page loads |
| 2 | Click create | Click "Créer une offre" or "+" button | Form opens |
| 3 | Submit empty | Click "Enregistrer" without filling fields | Validation errors shown |
| 4 | Check console | `list_console_messages()` | 0 error-level |

**French validation labels**:
- "Ce champ est obligatoire" (This field is required)
- "Format invalide" (Invalid format)
- "La valeur doit être supérieure à" (Value must be greater than)

**Pass criteria**: Validation messages display, 0 runtime errors.

---

## S5: GDPR Anonymization

**Goal**: Verify anonymization removes all PII.

| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | Navigate to entity | `navigate_page("/candidates")` or `/campaigns` | Page loads |
| 2 | Find entity with PII | `take_snapshot()` → find name/email visible | PII present |
| 3 | Click anonymize | Click "Anonymiser" | Confirmation dialog |
| 4 | Confirm | Click "Confirmer" | API call fires |
| 5 | Check network | `list_network_requests()` | `POST .../anonymize` returns 204 |
| 6 | Verify removal | `take_snapshot()` | Name → "Anonyme", email → redacted |
| 7 | Reload | `navigate_page()` same URL | PII still absent |

**PII fields to check**: Nom (Name), Prénom (First name), Email, Téléphone (Phone), Adresse (Address)

**Pass criteria**: All PII fields anonymized, persists after reload.

---

## S6: API Health

**Goal**: Verify 0 server errors (5xx) across all page navigations.

| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | For each of 13 routes | `navigate_page(route)` | Page loads |
| 2 | Wait for API calls | `wait_for(type: "network_idle")` | Requests complete |
| 3 | Check requests | `list_network_requests()` | All 2xx or 4xx |
| 4 | Log any 5xx | Record endpoint + status | — |

**Status categorization**:
- 2xx: Success (expected)
- 4xx: Client error (may be expected for empty data, report as WARNING)
- 5xx: Server error (CRITICAL — always a bug)

**Pass criteria**: 0 responses with status 500-599.

---

## S7: Console Audit

**Goal**: Categorize all console output per page.

| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | For each of 13 routes | `navigate_page(route)` | Page loads |
| 2 | Collect messages | `list_console_messages()` | Messages collected |
| 3 | Categorize | error/warning/info/log | Counts tabulated |

**Error patterns to flag**:
- `Cannot read properties of undefined` — null reference crash
- `Cannot convert undefined or null to object` — Object.entries/keys on null
- `Unhandled promise rejection` — async error not caught
- `ChunkLoadError` — code splitting failure
- `Network Error` — API unreachable

**Pass criteria**: 0 error-level messages. Warnings reported but not blocking.

---

## S8: Auth Guard

**Goal**: Verify protected routes are inaccessible without auth.

| # | Step | Action | Expected |
|---|------|--------|----------|
| 1 | Clear auth | `evaluate_script("localStorage.clear(); sessionStorage.clear()")` | Tokens removed |
| 2 | For each protected route | `navigate_page(route)` | — |
| 3 | Check result | `take_snapshot()` | Login page or auth error |
| 4 | Verify no data | Check snapshot for absence of business data | No PII/data visible |

**Protected routes** (all 13 except public ones):
All routes listed in S1 should redirect to login when unauthenticated.

**Pass criteria**: All protected routes redirect or show auth error. No business data rendered.
