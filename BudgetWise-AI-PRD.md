# Product Requirements Document (PRD)

**Product:** BudgetWise AI
**Type:** AI-powered personal budget and expense management web application
**Tagline:** *Track smarter. Spend better. Save more.*

The key difference from a normal expense tracker is that it should guide the user, analyze spending, and provide personalized optimization recommendations.

---

## 1. Application Name

### Name: **BudgetWise AI**

**Tagline:** *Track smarter. Spend better. Save more.*

**UI principle:** The UI should be simple, attractive, and easy to use.

---

## 2. Problem Statement

Many people know they should create a budget, but they struggle with:

* Knowing how to create a realistic budget
* Tracking expenses consistently
* Understanding where their money is going
* Identifying unnecessary spending
* Managing monthly budget limits
* Optimizing expenses and increasing savings
* Getting actionable financial guidance instead of just charts

Existing applications often collect data and display reports, but do not actively guide the user.

**BudgetWise AI will solve this problem by acting as a personal budgeting assistant that helps users create, manage, analyze, and optimize their expenses.**

---

## 3. Target Users

### Primary users

| User Type              | Need                                  |
| ---------------------- | ------------------------------------- |
| Students               | Manage limited monthly money          |
| Young professionals    | Control spending and increase savings |
| Families               | Manage household expenses             |
| Freelancers            | Track irregular income and expenses   |
| Budget-conscious users | Improve financial discipline          |

### Future users

* Small business owners
* Teams managing shared expenses
* Financial advisors managing client budgets

---

## 4. Main Features

### A. User Onboarding

When a new user logs in, the application should not immediately show an empty dashboard.

Instead, it should guide the user.

#### Example onboarding flow

**Step 1:** Welcome

> Welcome to BudgetWise AI. Let's take control of your money.

**Step 2:** Set monthly income

Example:

* Salary: ₹80,000
* Other income: ₹10,000

**Step 3:** Select financial goals

Examples:

* Save money
* Reduce unnecessary expenses
* Pay off debt
* Build an emergency fund
* Plan for a vacation
* Invest more

**Step 4:** Create budget categories

Examples:

* Rent
* Food
* Transportation
* Shopping
* Entertainment
* Bills
* Healthcare
* Investments
* Savings

**Step 5:** Set monthly budget

Example:

| Category      |  Budget |
| ------------- | ------: |
| Food          | ₹10,000 |
| Transport     |  ₹5,000 |
| Entertainment |  ₹3,000 |
| Shopping      |  ₹5,000 |
| Savings       | ₹15,000 |

**Step 6:** Start tracking

The user reaches the dashboard.

---

## 5. Budget Management

Every budget includes a currency. Supported currencies for now: **INR (₹), GBP (£), and USD ($)**.

The user should be able to:

* Create a budget
* Update a budget
* Delete a budget
* Copy the previous month's budget
* Assign a budget to a specific month
* Create category-wise limits
* Set savings targets
* Set spending alerts

### Example

**August 2026 Budget**

Income: ₹80,000

| Category  | Planned | Actual | Remaining |
| --------- | ------: | -----: | --------: |
| Food      | ₹10,000 | ₹8,500 |    ₹1,500 |
| Shopping  |  ₹5,000 | ₹6,500 |   -₹1,500 |
| Transport |  ₹5,000 | ₹3,000 |    ₹2,000 |

The system should clearly identify when the user exceeds a budget.

---

## 6. Expense Management

Users should be able to:

* Add expenses manually
* Edit expenses
* Delete expenses
* Categorize expenses
* Add notes
* Select date
* Select payment method
* Attach receipts in a future version

### Expense example

```text
Amount: ₹1,250
Category: Food
Date: 24-Aug-2026
Payment Method: UPI
Description: Dinner with friends
```

### Payment methods

* Cash
* UPI
* Credit Card
* Debit Card
* Bank Transfer
* Wallet

---

## 7. Dashboard

The dashboard should provide a quick financial overview.

### Dashboard widgets

* Total income
* Total expenses
* Total savings
* Remaining budget
* Monthly budget utilization
* Top spending category
* Recent transactions
* Budget exceeded alerts

### Example insight

> ⚠️ You have spent 85% of your Food budget.

> 🔴 Your Shopping budget has been exceeded by ₹1,500.

> 💡 Reducing online shopping by 20% could save approximately ₹1,000 this month.

---

## 8. AI-Powered Expense Guidance

This should be the application's major differentiator.

Instead of only showing reports, the application should generate intelligent recommendations.

### Example recommendations

#### Spending pattern detection

> Your food expenses are 35% higher than your previous three-month average.

#### Budget optimization

> Your current entertainment budget is rarely used. Consider reducing it from ₹5,000 to ₹3,500.

#### Savings recommendation

> Based on your income and spending pattern, you could potentially save ₹12,000 per month.

#### Overspending detection

> You have made 8 online shopping purchases this month, totaling ₹9,200.

#### Goal guidance

> At your current savings rate, you will reach your ₹1,00,000 emergency fund goal in approximately 8 months.

---

## 9. Personalized Financial Recommendations

Instead of asking the user 20 questions at once, use **progressive personalization**.

The application should learn from:

1. User's income
2. Budget
3. Expense categories
4. Monthly spending patterns
5. Financial goals
6. Previous recommendations
7. User feedback

The AI can ask small questions when needed.

### Example

> We noticed your transportation spending increased significantly. Is this a temporary expense?

Options:

* Yes, temporary
* No, this is regular
* Skip

This creates a better UX than a long questionnaire.

---

## 10. Pages / Screens Required

### 1. Landing Page

Purpose: Explain the product.

Sections:

* Application introduction
* Problem being solved
* Key features
* How it works
* Benefits
* Login
* Sign Up

---

### 2. Login / Registration Page

Features:

* Email/password login
* Google login
* Forgot password

---

### 3. Welcome / Onboarding Page

Guided setup.

Steps:

1. Welcome
2. Add income
3. Select financial goals
4. Create categories
5. Create monthly budget
6. Complete setup

---

### 4. Dashboard

Main user screen.

Contains:

* Monthly financial summary
* Expense summary
* Budget progress
* Spending charts
* AI recommendations
* Alerts

---

### 5. Budget Management Page

Features:

* Create budget
* Select month
* Update budget
* Category allocation
* Copy previous month

---

### 6. Expense Management Page

Features:

* Add expense
* Edit expense
* Delete expense
* Filter by category
* Filter by date
* Search transactions

---

### 7. Analytics Page

Charts:

* Expenses by category
* Monthly spending trend
* Budget vs actual
* Income vs expense
* Savings trend

---

### 8. AI Insights Page

Dedicated page for:

* Spending analysis
* Expense anomalies
* Cost-saving opportunities
* Budget recommendations
* Personalized financial insights

---

### 9. Goals Page

Users can create goals.

Examples:

* Save ₹1,00,000
* Buy a car
* Emergency fund
* Vacation

The application shows:

* Goal amount
* Current savings
* Remaining amount
* Progress percentage
* Estimated completion date

---

### 10. Export Page

Users can export:

* Expenses
* Monthly budget
* Analytics report

Formats:

* CSV
* Excel
* PDF

---

### 11. Profile and Settings

Features:

* User information
* Currency (INR, GBP, USD)
* Notification preferences
* Categories
* Account deletion
* Data export

---

## 11. Technology Stack

For a modern startup MVP, I recommend:

### Frontend

**Next.js + TypeScript**

Why:

* Fast development
* Good SEO
* Modern UI support
* Suitable for web applications
* Easy deployment

#### UI

* Tailwind CSS
* shadcn/ui
* Recharts for charts

---

### Backend

**Next.js API Routes** for the MVP.

Later, if the application grows:

**Python FastAPI**

This would be especially useful for:

* AI processing
* Recommendation engine
* Data analysis
* Machine learning models

---

### Database

**PostgreSQL**

Use:

* Supabase PostgreSQL for faster MVP development

Supabase can also provide:

* Authentication
* Database
* Storage
* Row-level security

---

### AI Layer

An LLM API for:

* Spending insights
* Personalized recommendations
* Budget suggestions
* Natural-language queries

Example:

> "Why did I spend more this month?"

The AI can analyze transaction data and answer.

---

## 12. High-Level Architecture

```text
                    ┌─────────────────┐
                    │    User/Web     │
                    │   Application   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Next.js UI   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Layer     │
                    │ Business Logic  │
                    └───────┬─────────┘
                            │
              ┌─────────────┼──────────────┐
              │             │              │
       ┌──────▼─────┐ ┌────▼─────┐ ┌──────▼─────┐
       │ PostgreSQL │ │ AI Engine│ │ File Export│
       │  Database  │ │ Insights │ │ PDF/Excel  │
       └────────────┘ └──────────┘ └────────────┘
```

---

## 13. Project Folder Structure

```text
budgetwise-ai/
│
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── signup/
│   ├── onboarding/
│   ├── dashboard/
│   ├── budgets/
│   ├── expenses/
│   ├── analytics/
│   ├── insights/
│   ├── goals/
│   ├── export/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── budget/
│   ├── expenses/
│   ├── charts/
│   └── insights/
│
├── lib/
│   ├── database/
│   ├── auth/
│   ├── ai/
│   ├── analytics/
│   └── utils/
│
├── services/
│   ├── budget.service.ts
│   ├── expense.service.ts
│   ├── analytics.service.ts
│   └── ai-insights.service.ts
│
├── types/
│   ├── user.ts
│   ├── budget.ts
│   ├── expense.ts
│   └── analytics.ts
│
├── hooks/
│
├── public/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 14. Data That Needs to Be Stored

### Users

```text
User ID
Name
Email
Password/Auth ID
Currency
Created Date
```

### Income

```text
Income ID
User ID
Amount
Income Source
Date
Recurring
```

### Budgets

```text
Budget ID
User ID
Month
Year
Total Budget
Created Date
Updated Date
```

### Budget Categories

```text
Category Budget ID
Budget ID
Category
Allocated Amount
```

### Expenses

```text
Expense ID
User ID
Category
Amount
Description
Date
Payment Method
Created Date
```

### Financial Goals

```text
Goal ID
User ID
Goal Name
Target Amount
Current Amount
Target Date
Status
```

### AI Insights

```text
Insight ID
User ID
Insight Type
Insight Message
Recommendation
Created Date
Status
```

### User Feedback

```text
Feedback ID
User ID
Insight ID
Was Helpful
User Response
```

This feedback can later improve the recommendation engine.

---

## 15. Development Steps

### Phase 1 — MVP Foundation

#### Week 1

* Create UI design
* Set up Next.js project
* Configure database
* Implement authentication
* Create landing page

---

### Phase 2 — Core Budget Features

#### Week 2

* User onboarding
* Income management
* Budget creation
* Monthly budget allocation
* Budget editing

---

### Phase 3 — Expense Tracking

#### Week 3

* Add expense
* Edit expense
* Delete expense
* Categories
* Filters
* Search

---

### Phase 4 — Dashboard and Analytics

#### Week 4

* Financial dashboard
* Budget vs actual
* Spending charts
* Monthly reports
* Alerts

---

### Phase 5 — AI Features

#### Week 5

Start with rule-based intelligence:

```text
IF spending > budget
THEN generate overspending alert
```

```text
IF category spending increases > 30%
THEN generate spending increase insight
```

```text
IF savings < target
THEN recommend potential savings
```

Then add LLM-powered personalized explanations.

---

### Phase 6 — Export and Reports

#### Week 6

* CSV export
* Excel export
* PDF reports
* Monthly summary

---

### Phase 7 — Testing and Quality Engineering

As a Quality Engineering product, I strongly recommend building automation from the beginning.

#### Test layers

| Test Type           | Scope                              |
| ------------------- | ---------------------------------- |
| Unit Testing        | Business logic                     |
| API Testing         | Backend APIs                       |
| Integration Testing | Database + services                |
| UI Testing          | Critical workflows                 |
| E2E Testing         | Complete user journeys             |
| Security Testing    | Authentication and user data       |
| Performance Testing | Dashboard/API load                 |
| AI Testing          | Recommendation accuracy and safety |

#### Critical E2E flow

```text
Register
   ↓
Complete onboarding
   ↓
Create August budget
   ↓
Add expenses
   ↓
Exceed category limit
   ↓
Verify dashboard alert
   ↓
View AI recommendation
   ↓
Update budget
   ↓
Export monthly report
```

---

## 16. Deployment Approach

### MVP Architecture

```text
Frontend + Backend
       │
       ▼
   Vercel/Cloud
       │
       ▼
   PostgreSQL
   (Supabase)
       │
       ▼
    AI API
```

### Recommended deployment

* Frontend: Vercel
* Backend: Next.js API initially
* Database: Supabase PostgreSQL
* Authentication: Supabase Auth
* File storage: Supabase Storage
* CI/CD: GitHub Actions
* Monitoring: Application logging + error tracking

---

## 17. Recommended MVP Scope

To avoid overbuilding, the **first release should contain only**:

### Must Have

* User registration/login
* Guided onboarding
* Monthly budget creation
* Budget categories
* Expense CRUD
* Dashboard
* Budget vs actual analysis
* Overspending alerts
* Basic AI recommendations
* CSV/Excel export

### Phase 2

* Advanced AI assistant
* Receipt scanning
* Bank account integration
* Credit card integration
* PDF reports
* Shared family budgets
* Mobile application
* Predictive expense forecasting

---

## Recommended Product Vision

**BudgetWise AI is not just an expense tracker.**

The product should evolve through three levels:

```text
Level 1
TRACK
"Where did my money go?"

        ↓

Level 2
ANALYZE
"Why am I spending more?"

        ↓

Level 3
GUIDE
"What should I do to improve?"
```

That third level—**AI-guided financial behavior and personalized expense optimization**—is where the startup can differentiate itself.
