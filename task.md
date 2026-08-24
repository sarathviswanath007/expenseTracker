# BudgetWise AI — Implementation Task List

Derived from `BudgetWise-AI-PRD.md`, grouped by the development phases in Section 15.
Phase 7 (Testing and Quality Engineering) has no standalone section here — its test
tasks (Unit, API, Integration, UI, E2E, Security, Performance, AI) are folded into
each phase under that phase's own **Testing** subsection, so quality work lands next
to the feature that produced it instead of being deferred to the end.

Each top-level checkbox is scoped to be implementable and independently verifiable.

---

## Phase 1 — MVP Foundation (Week 1)

### Project setup
- [x] Initialize Next.js + TypeScript project using the folder structure in Section 13 (`app/`, `components/`, `lib/`, `services/`, `types/`, `hooks/`, `tests/`)
- [x] Install and configure Tailwind CSS + shadcn/ui
- [x] Set up ESLint, Prettier, and base tooling scripts
- [ ] Create a Supabase project (PostgreSQL + Auth + Storage)
- [x] Configure environment variables / secrets handling for local (`.env.local.example` + gitignored `.env.local`)
- [ ] Set up GitHub Actions CI skeleton (lint, type-check, build, test)

### Database
- [ ] Create `users` table matching the schema in Section 14
- [ ] Configure Supabase row-level security policies on `users`

### Authentication
- [ ] Implement email/password registration
- [ ] Implement email/password login
- [ ] Implement Google OAuth login
- [ ] Implement forgot-password flow
- [ ] Implement logout and session handling

### UI design & Landing Page (Section 10.1)
- [ ] Define base design tokens (colors, typography, spacing) in Tailwind config
- [ ] Build Landing Page: application introduction section
- [ ] Build Landing Page: problem statement section
- [ ] Build Landing Page: key features section
- [ ] Build Landing Page: how it works section
- [ ] Build Landing Page: benefits section
- [ ] Build Landing Page: Login / Sign Up CTAs
- [ ] Build Login / Registration page UI (Section 10.2)

### Testing
- [ ] Unit test: registration/login form validation logic
- [ ] API test: registration endpoint (valid input, duplicate email, weak password)
- [ ] API test: login endpoint (valid credentials, invalid credentials, locked/unknown account)
- [ ] Integration test: successful auth creates the corresponding `users` row
- [ ] Security test: password hashing, session/token handling, RLS policy enforcement on `users`
- [ ] Security test: brute-force / rate-limiting protection on login
- [ ] UI test: landing page renders and Login/Sign Up CTAs navigate correctly
- [ ] E2E test: user registers, confirms account, and logs in successfully

---

## Phase 2 — Core Budget Features (Week 2)

### Data model
- [ ] Create `income` table per Section 14 schema
- [ ] Create `budgets` table per Section 14 schema
- [ ] Create `budget_categories` table per Section 14 schema

### Onboarding flow (Section 4, Section 10.3)
- [ ] Build onboarding Step 1: welcome screen
- [ ] Build onboarding Step 2: set monthly income (salary + other income)
- [ ] Build onboarding Step 3: select financial goals (multi-select)
- [ ] Build onboarding Step 4: create budget categories (defaults + custom entry)
- [ ] Build onboarding Step 5: set monthly budget per category
- [ ] Build onboarding Step 6: complete setup and redirect to dashboard
- [ ] Persist in-progress onboarding state so a user can resume if interrupted

### Income management
- [ ] API: create/update/delete income entries (with recurring flag)
- [ ] UI: income entry form with recurring toggle

### Budget CRUD (Section 5, Section 10.5)
- [ ] API: create budget for a given month/year
- [ ] API: update budget (total + category allocations)
- [ ] API: delete budget
- [ ] API: copy previous month's budget
- [ ] API: set category-wise limits
- [ ] API: set savings targets
- [ ] API: set spending alert thresholds
- [ ] UI: Budget Management page — create budget form
- [ ] UI: Budget Management page — month selector
- [ ] UI: Budget Management page — category allocation editor
- [ ] UI: Budget Management page — "copy previous month" action
- [ ] Support multi-currency budgets (INR ₹, GBP £, USD $)

### Testing
- [ ] Unit test: budget planned/actual/remaining calculation logic
- [ ] Unit test: currency formatting for INR/GBP/USD
- [ ] API test: budget CRUD endpoints (create/update/delete/copy)
- [ ] API test: income CRUD endpoints
- [ ] Integration test: budget + budget_categories persist correctly together
- [ ] Integration test: onboarding writes correct rows across `users`/`income`/`budgets`/`budget_categories`
- [ ] UI test: onboarding step navigation (back/next/skip, resume mid-flow)
- [ ] UI test: budget management create/edit flows
- [ ] E2E test: complete onboarding end-to-end and land on dashboard with the new budget visible

---

## Phase 3 — Expense Tracking (Week 3)

### Data model
- [ ] Create `expenses` table per Section 14 schema

### Expense CRUD (Section 6)
- [ ] API: add expense (amount, category, date, payment method, description)
- [ ] API: edit expense
- [ ] API: delete expense
- [ ] API: list expenses with pagination

### Categorization, filters & search
- [ ] Implement category selection UI (reuses the user's budget categories)
- [ ] Implement filter by category
- [ ] Implement filter by date range
- [ ] Implement search by description/notes

### Expense Management Page (Section 10.6)
- [ ] UI: add-expense form with payment method selector (Cash, UPI, Credit Card, Debit Card, Bank Transfer, Wallet)
- [ ] UI: expense list/table with edit/delete actions
- [ ] UI: filter and search controls

### Testing
- [ ] Unit test: expense validation (amount, required fields, date format)
- [ ] API test: expense CRUD endpoints
- [ ] API test: filter/search query parameters
- [ ] Integration test: adding/editing/deleting an expense updates the budget's "actual" totals
- [ ] UI test: add/edit/delete expense flow
- [ ] UI test: filter and search interactions
- [ ] E2E test: add expenses that push a category over its budget limit and confirm the data is correctly queryable

---

## Phase 4 — Dashboard and Analytics (Week 4)

### Dashboard (Section 7, Section 10.4)
- [ ] API: aggregate endpoint for total income/expenses/savings/remaining budget
- [ ] API: monthly budget utilization calculation
- [ ] API: top spending category calculation
- [ ] API: recent transactions list
- [ ] API: budget-exceeded / threshold alert detection (e.g., 85% used, exceeded)
- [ ] UI: dashboard summary widgets (income, expenses, savings, remaining)
- [ ] UI: monthly budget utilization widget
- [ ] UI: top spending category widget
- [ ] UI: recent transactions widget
- [ ] UI: budget exceeded / alert banners

### Analytics Page (Section 10.7)
- [ ] API: expenses-by-category aggregation
- [ ] API: monthly spending trend aggregation
- [ ] API: budget-vs-actual aggregation
- [ ] API: income-vs-expense aggregation
- [ ] API: savings trend aggregation
- [ ] UI: expenses-by-category chart (Recharts)
- [ ] UI: monthly spending trend chart
- [ ] UI: budget vs actual chart
- [ ] UI: income vs expense chart
- [ ] UI: savings trend chart

### Testing
- [ ] Unit test: dashboard aggregation math (totals, utilization %, top category)
- [ ] Unit test: alert threshold logic (warning vs. exceeded)
- [ ] API test: dashboard summary and analytics endpoints
- [ ] Integration test: dashboard reflects live data immediately after expense changes
- [ ] UI test: charts render with sample data and update on filter/month change
- [ ] Performance test: dashboard/API response under large transaction volume
- [ ] E2E test: exceed a category budget and verify the dashboard alert appears

---

## Phase 5 — AI Features (Week 5)

### Data model
- [ ] Create `ai_insights` table per Section 14 schema
- [ ] Create `user_feedback` table per Section 14 schema

### Rule-based insight engine (Section 8)
- [ ] Implement rule: spending > budget → overspending alert
- [ ] Implement rule: category spending increase > 30% → spending increase insight
- [ ] Implement rule: savings < target → savings recommendation
- [ ] Implement spending-pattern detection vs. previous 3-month average
- [ ] Implement budget optimization suggestion for underused category budgets
- [ ] Implement goal-completion estimate (time to reach a goal at current savings rate)
- [ ] Persist generated insights to `ai_insights`

### LLM-powered explanations (Section 8, Section 9)
- [ ] Integrate LLM API client under `lib/ai`
- [ ] Build prompt templates that turn rule outputs into natural-language explanations
- [ ] Implement natural-language query endpoint (e.g., "Why did I spend more this month?")
- [ ] Implement progressive-personalization micro-questions (e.g., "Is this a temporary expense?")
- [ ] API: submit user feedback on an insight (helpful / response)

### AI Insights Page (Section 10.8)
- [ ] UI: spending analysis section
- [ ] UI: expense anomalies section
- [ ] UI: cost-saving opportunities section
- [ ] UI: budget recommendations section
- [ ] UI: personalized insights feed with helpful/not-helpful feedback controls
- [ ] UI: micro-question prompt component with option buttons (Yes/No/Skip style)

### Testing
- [ ] Unit test: each rule-based insight generator (overspending, 30% increase, savings shortfall)
- [ ] Unit test: goal-completion date estimation math
- [ ] API test: insights endpoint returns correct recommendations against fixture data
- [ ] AI test: recommendation accuracy against a labeled set of test scenarios
- [ ] AI test: LLM output safety (no hallucinated numbers, no overreaching financial advice, graceful handling of missing data)
- [ ] Integration test: user feedback persists and links to the correct insight
- [ ] UI test: insights page renders insights and feedback interactions work
- [ ] E2E test: overspend a category and confirm the corresponding AI recommendation appears on the Insights page

---

## Phase 6 — Export and Reports (Week 6)

### Export functionality (Section 10.10)
- [ ] API: export expenses as CSV
- [ ] API: export expenses as Excel
- [ ] API: export monthly budget as CSV/Excel
- [ ] API: export analytics report as PDF
- [ ] API: generate monthly summary report
- [ ] UI: Export page with format selection (CSV/Excel/PDF) and scope selection (expenses/budget/analytics)

### Profile and Settings (Section 10.11)
- [ ] UI: user information settings
- [ ] UI: currency preference (INR/GBP/USD)
- [ ] UI: notification preferences
- [ ] UI: manage categories
- [ ] UI: account deletion flow
- [ ] UI: data export shortcut from settings

### Testing
- [ ] Unit test: CSV/Excel column mapping and currency formatting
- [ ] Unit test: PDF report layout generation
- [ ] API test: each export endpoint returns correct content for its format
- [ ] Integration test: exported data matches the underlying database records
- [ ] Security test: exports and settings are scoped strictly to the authenticated user (no cross-user data leakage)
- [ ] UI test: export page format/scope selection and download trigger
- [ ] E2E test — full critical journey (Section 15): register → complete onboarding → create August budget → add expenses → exceed category limit → verify dashboard alert → view AI recommendation → update budget → export monthly report
