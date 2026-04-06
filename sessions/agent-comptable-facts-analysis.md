# Agent-Comptable User Testing Facts — Structured Analysis

**Source**: Live user testing session 2026-04-06 by Hatim Hajji (CEO, ELYSTEK CONSULTING)
**App**: agent-comptable at localhost:8765 (backend) + localhost:5173 (frontend)
**Production DB**: C:/agent-comptable/backend/data/agent_comptable.db

---

## Page-by-Page Status

| Page | Status | Notes |
|------|--------|-------|
| Login | ✅ OK | admin@agent-comptable.fr works (required manual DB promotion viewer→admin) |
| Dashboard | ⚠️ Partial | 132 suppliers, 0 active sessions, all show "Expired" COOKIE status |
| Sessions | ❌ KO | 11 bugs identified (see below) |
| Jobs | ❌ KO | 50/50 failed (stale SCAN jobs from Feb 15-16) |
| Suppliers | ❌ KO | No taxonomy — everything treated as "supplier with portal" |
| Scanner | ❌ KO | Generates fake URLs, no real progress tracking |

---

## 11 Bugs Identified by User

| # | Bug | Severity | Detail |
|---|-----|----------|--------|
| 1 | Session status stale | HIGH | Qonto connected via auto-login but still shows "Expired" |
| 2 | Supplier model wrong | CRITICAL | No distinction: real suppliers vs employees vs expense categories vs clients vs CEO |
| 3 | Auto-refresh KO | MEDIUM | Toggle exists but doesn't work |
| 4 | Status column KO | HIGH | Not reflecting actual session state |
| 5 | Config URL not updated | HIGH | Scraper connected but didn't write back the portal URL |
| 6 | TOTP modal wrong | MEDIUM | Shown as default auth config for all suppliers. Should adapt per supplier auth method |
| 7 | Config URLs batch KO | CRITICAL | Generates hallucinated URLs from template (`https://www.{slug}.fr/espace-client`). All 78 are fake. |
| 8 | Person categorization wrong | CRITICAL | HATIM HAJJI = CEO of ELYSTEK/EI HATIM HAJJI/EXODUS TECH (not employee, not supplier). El Houcine HAJJI = employee. |
| 9 | Fake confidence scores | HIGH | "80% confiance" displayed on completely wrong generated URLs |
| 10 | Scanner batch: no tracking | HIGH | Shows "78 URL(s) configurées avec succès" + "Scanner en cours" badges but no real progress, no errors, no completion % — fire-and-forget |
| 11 | All entries scanned equally | CRITICAL | No classification logic — restaurants, hotels, Google Ads, Microsoft charges all treated as suppliers with invoice portals. User should decide categorization, not the app auto-deciding. |

---

## The Domain Model Problem (Root Cause)

The app has NO transaction counterparty taxonomy. Everything imported from Qonto is dumped into a single "supplier" table. In reality:

| Category | Examples | Has Portal? | Needs Scraping? | Invoice Type |
|----------|---------|-------------|-----------------|--------------|
| **Real Suppliers** | Alan, Qonto, PayFit, Anthropic, OVH | YES | YES | Digital portal invoice |
| **CEO/Founder** | HATIM HAJJI (CEO ELYSTEK/EI HATIM/EXODUS) | NO | NO | Dividends, expense reports |
| **Employees** | El Houcine HAJJI | NO | NO | Bulletin de paie (from PayFit) |
| **One-time expenses** | SNCF-VOYAGEURS, Transavia, Hotels, Restaurants | NO | NO | Paper receipt or app receipt |
| **Card charges** | GOOGLE ADS, MSFT E0300, AFRIQ OAFZ | NO | NO | Digital receipt (in-app) |
| **Clients** | EXODUS TECH, INSIDE | N/A | N/A | They pay US — outgoing invoices |
| **Paper-only** | Brioche Dorée | NO | NO | Paper receipt, scan & upload |

**Current state**: ALL 132 entries go through "scan portal" flow = broken for 80%+ of entries.

---

## What Previous Reviews Missed

| Review | What it checked | What it should have checked |
|--------|----------------|---------------------------|
| ADR-001 (architecture) | Code patterns, security, test coverage | Is the domain model correct? |
| 3-engine analysis | Auth/Scraper/Matcher algorithms | Should these entities even exist in the scraper? |
| E2E tests | Does the API return 200? | Does the data make business sense? |
| 3-team review | Backend code, frontend code, broken endpoints | User workflow: import → classify → scrape → match |

**The gap**: Code auditor vs domain auditor. All reviews validated implementation correctness but never questioned whether the implementation solves the right problem.

---

## User's Key Question

> "Why didn't you write these kind of advanced tests? Why didn't the architecture review dive into this re-thinking?"

**Answer documented by Claude in the other chat**:
1. Treated supplier table as ground truth — never questioned if 132 "suppliers" made sense
2. Reviewed code patterns, not business logic
3. Tests validated implementation, not intent
4. No domain expert challenge — an accountant would immediately ask "why are you scraping a restaurant meal?"

---

## Missing Test Category: Business Rule Validation

Tests that should exist but don't:

```python
def test_ceo_transfers_are_not_supplier_invoices():
    """HATIM HAJJI transactions should be categorized as CEO/founder, not supplier"""

def test_one_time_card_payments_have_no_portal():
    """GOOGLE ADS, MSFT charges should not trigger portal scanning"""

def test_employee_salary_requires_bulletin_not_scraping():
    """El Houcine HAJJI payroll should link to PayFit bulletin, not scrape a portal"""

def test_only_classified_suppliers_get_auto_login():
    """Only entries marked as 'real_supplier' with verified portal URL should get auto-login"""

def test_user_must_classify_before_scanning():
    """New imports require user classification step before any automation"""

def test_fake_url_generation_blocked():
    """Template-based URL generation (slug.fr/espace-client) must not produce fake URLs"""

def test_confidence_score_requires_real_validation():
    """80% confidence must mean something — not just a template fill"""
```

---

## Recommended Next Steps for Other Chat

1. **DO NOT fix bugs yet** — the domain model needs redesign first
2. **Add counterparty_type enum**: `real_supplier | employee | ceo_founder | one_time_expense | card_charge | client | paper_only`
3. **Add classification step**: after Qonto import, user sees unclassified entries and assigns types
4. **Only `real_supplier` type enters the scraper/auth/session pipeline**
5. **Then fix the 11 bugs** — most become irrelevant once classification exists

---

## Prompt for Other Chat

Paste this in the agent-comptable chat to continue:

```
Read C:/RH-OptimERP/eagles-ai-platform/sessions/agent-comptable-facts-analysis.md

This is a structured analysis of 11 bugs found during live user testing.
The root cause is a missing domain taxonomy — the app treats all 132 Qonto
transaction counterparties as "suppliers with portals" when only ~20 are real suppliers.

DO NOT fix individual bugs. The domain model needs redesign first.

Call mcp__orchestrator__task_create to enroll DAG, then propose:
1. counterparty_type enum (7 categories from the analysis)
2. Classification workflow (import → user classifies → automation runs on real_suppliers only)
3. Which of the 11 bugs become irrelevant after classification exists
```
