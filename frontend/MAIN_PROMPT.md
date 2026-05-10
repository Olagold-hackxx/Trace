# KudiScore Main Prompt

KudiScore helps traders, lenders, and business operators turn real payment activity into credit, jobs, and income opportunities.

────────────────────────────────────────
IMPORTANT PRODUCT NAMING
────────────────────────────────────────

The product name is KudiScore.

Do NOT use:
- MerchantOS
- KudiScore by MerchantOS
- MerchantOS / KudiScore

Use only:
- KudiScore

KudiScore helps traders, lenders, and business operators turn real payment activity into credit, jobs, and income opportunities.

────────────────────────────────────────
JOBS MODULE — SHARED FEATURE, NOT A SEPARATE SIDE
────────────────────────────────────────

Jobs must be built as a shared feature inside both the Trader side and the Lender side.

Do NOT create a separate Worker side.
Do NOT create:
/worker/dashboard
/worker/jobs
/worker/earnings
/worker/onboarding

Instead:
- Traders can create jobs, apply for jobs, manage jobs, and pay workers.
- Lenders can create jobs, apply for jobs, manage jobs, and pay workers.
- A worker is not a separate major app side. A worker is any user who applies for or accepts a job.

This means the job system is role-flexible:
- A trader can post a job.
- A lender can post a job.
- A trader can apply for a job.
- A lender can apply for a job.
- A user can act as a job creator in one moment and a worker in another moment.

The Jobs feature should feel like part of KudiScore’s business growth layer, not a separate product.

────────────────────────────────────────
UPDATED PAGES TO BUILD
────────────────────────────────────────

Trader job pages to add
═══════════════════════════════
14. /trader/jobs
═══════════════════════════════

This is the trader’s job dashboard.

Purpose:
- Show jobs created by the trader
- Show jobs the trader applied to
- Show active jobs
- Show completed jobs
- Show available jobs nearby

Page structure:
- Header: "Jobs"
- Subtitle: "Create work requests, find helpers, or earn from available tasks."
- Top stat cards:
  - Jobs Created
  - Active Jobs
  - Applications
  - Completed Jobs
- CTA buttons:
  - "Create Job"
  - "Find Jobs"
- Tabs:
  - My Jobs
  - Available Jobs
  - Applied
  - Active
  - Completed

My Jobs table:
Columns:
- Job Title
- Category
- Pay
- Applicants
- Status
- Date
- Action

Available Jobs grid:
Each job card should show:
- Job title
- Posted by
- Location
- Pay amount
- Duration
- Required skill
- Status badge
- "View Job" button

Use orange accents for trader jobs.
═══════════════════════════════
15. /trader/jobs/new
═══════════════════════════════

Create job page for traders.

Form fields:
- Job title
- Job category
  - Sales assistant
  - Delivery helper
  - Inventory helper
  - POS/payment assistant
  - Market helper
  - Field verification
  - Other
- Job description
- Location
- State
- Pay amount
- Duration
- Required skills
- Urgency
  - Today
  - This week
  - Flexible
- Payment method
  - Pay after completion
  - Pay upfront
  - Split payment
- "Post Job" button

Show an orange info card:
"Workers can apply once your job is live. You choose who to accept."
═══════════════════════════════
16. /trader/jobs/[id]
═══════════════════════════════

Trader job detail page.

If trader created the job:
- Show job details
- Show applicant list
- Allow trader to accept/reject applicants
- Show selected worker
- Mark job as completed
- Release payment button

If trader is applying to the job:
- Show job details
- Show poster information
- Show pay, location, duration
- "Apply for Job" button
- "Withdraw Application" button if already applied

Sections:
- Job summary card
- Creator card
- Applicants table
- Job activity timeline
- Payment status card

Applicant table:
Columns:
- Applicant
- Role context
- Location
- Reliability
- Status
- Action

Lender job pages to add
═══════════════════════════════
21. /lender/jobs
═══════════════════════════════

This is the lender’s job dashboard.

Purpose:
- Let lenders create operational jobs
- Let lenders find field workers
- Let lenders track job applicants
- Let lenders also apply for jobs if needed

Page structure:
- Header: "Jobs"
- Subtitle: "Create field tasks, verification jobs, surveys, and operational work."
- Top stat cards:
  - Jobs Posted
  - Field Tasks Active
  - Applications
  - Completed Jobs
- CTA buttons:
  - "Create Job"
  - "Find Jobs"
- Tabs:
  - My Jobs
  - Available Jobs
  - Applied
  - Active
  - Completed

Lender job examples:
- Field agent needed for shop verification
- Market survey assistant
- KYC document collector
- Repayment follow-up agent
- Business location checker
- Merchant onboarding assistant

Use blue accents for lender jobs.
═══════════════════════════════
22. /lender/jobs/new
═══════════════════════════════

Create job page for lenders.

Form fields:
- Job title
- Job category
  - Field verification
  - KYC collection
  - Market survey
  - Loan follow-up
  - Merchant onboarding
  - Business inspection
  - Other
- Job description
- Location
- State
- Pay amount
- Duration
- Required skills
- Urgency
- Verification requirement
  - ID required
  - Prior job history required
  - No requirement
- Payment method
- "Post Job" button

Show a blue info card:
"Use jobs to assign field work, verification tasks, and merchant operations."
═══════════════════════════════
23. /lender/jobs/[id]
═══════════════════════════════

Lender job detail page.

If lender created the job:
- Show job details
- Show applicants
- Accept/reject applicant
- Assign field worker
- Track completion
- Release payment

If lender is applying to another job:
- Show job information
- Allow application
- Track application status

Sections:
- Job summary
- Applicant list
- Field task checklist
- Completion proof
- Payment status

────────────────────────────────────────
UPDATED SIDEBAR RULES
────────────────────────────────────────

Trader sidebar:
- Dashboard
- Payments
- Transactions
- KudiScore
- Loan
- Jobs
- Profile

Lender sidebar:
- Dashboard
- Merchants
- Loans
- Portfolio
- Jobs
- Profile

There should be no separate Worker sidebar.
Jobs appear inside both Trader and Lender dashboards.

────────────────────────────────────────
UPDATED FILE STRUCTURE
────────────────────────────────────────

/app
  /page.tsx                    → Landing

  /auth
    /register/page.tsx
    /login/page.tsx
    /verify/page.tsx

  /trader
    /layout.tsx                → Trader sidebar layout
    /onboarding
      /step-1/page.tsx
      /step-2/page.tsx
      /step-3/page.tsx
    /dashboard/page.tsx
    /payments/page.tsx
    /transactions/page.tsx
    /score/page.tsx
    /loan/page.tsx
    /loan/[id]/page.tsx
    /jobs/page.tsx
    /jobs/new/page.tsx
    /jobs/[id]/page.tsx
    /profile/page.tsx

  /lender
    /layout.tsx                → Lender sidebar layout
    /dashboard/page.tsx
    /merchants/page.tsx
    /merchants/[id]/page.tsx
    /loans/page.tsx
    /loans/[id]/page.tsx
    /portfolio/page.tsx
    /jobs/page.tsx
    /jobs/new/page.tsx
    /jobs/[id]/page.tsx
    /profile/page.tsx

  /admin
    /demo/page.tsx
    /jobs/page.tsx

Add job components
/components/jobs
  JobCard.tsx
  JobForm.tsx
  JobTable.tsx
  ApplicantRow.tsx
  ApplicantCard.tsx
  JobStatusBadge.tsx
  JobTimeline.tsx
  PaymentStatusCard.tsx

And update existing components:

/components/trader
  TransactionRow.tsx
  ScoreBreakdown.tsx
  LoanCard.tsx
  PaymentCard.tsx
  TraderJobSummary.tsx

/components/lender
  MerchantCard.tsx
  LoanRow.tsx
  PortfolioStats.tsx
  LenderJobSummary.tsx

────────────────────────────────────────
MOCK JOB DATA
────────────────────────────────────────

Jobs:
[
  {
    id: "job_001",
    title: "Sales assistant needed today",
    category: "Sales assistant",
    createdBy: "Mama Ngozi's Provisions",
    creatorRoleContext: "trader",
    location: "Mile 12 Market, Lagos",
    pay: 8000,
    duration: "1 day",
    status: "open",
    applicants: 6,
    requiredSkills: ["Sales", "Customer handling", "Cash handling"],
    description: "Need someone to assist with sales and customer management during market rush."
  },
  {
    id: "job_002",
    title: "Field agent for shop verification",
    category: "Field verification",
    createdBy: "BlueRiver Microfinance",
    creatorRoleContext: "lender",
    location: "Yaba, Lagos",
    pay: 12000,
    duration: "4 hours",
    status: "open",
    applicants: 3,
    requiredSkills: ["Verification", "Smartphone", "Reporting"],
    description: "Visit merchant location, confirm business activity, and upload verification notes."
  },
  {
    id: "job_003",
    title: "Inventory helper for electronics shop",
    category: "Inventory helper",
    createdBy: "Chidi's Electronics",
    creatorRoleContext: "trader",
    location: "Onitsha Main Market",
    pay: 10000,
    duration: "1 day",
    status: "active",
    applicants: 9,
    requiredSkills: ["Inventory", "Lifting", "Organization"],
    description: "Assist with stock counting and product arrangement."
  }
]

Applicants:
[
  {
    id: "app_001",
    name: "Timi Ade",
    roleContext: "trader",
    location: "Ketu, Lagos",
    reliabilityScore: 92,
    status: "pending"
  },
  {
    id: "app_002",
    name: "Aisha Bello",
    roleContext: "lender",
    location: "Yaba, Lagos",
    reliabilityScore: 87,
    status: "accepted"
  },
  {
    id: "app_003",
    name: "Daniel Okafor",
    roleContext: "user",
    location: "Mile 12, Lagos",
    reliabilityScore: 79,
    status: "pending"
  }
]

────────────────────────────────────────
JOBS DATA MODEL
────────────────────────────────────────

Job:
- id
- title
- description
- category
- location
- state
- pay_amount_kobo
- duration
- required_skills
- created_by_user_id
- creator_role_context
- assigned_user_id
- status
- payment_status
- created_at
- updated_at

JobApplication:
- id
- job_id
- applicant_user_id
- applicant_role_context
- message
- status
- created_at

JobActivity:
- id
- job_id
- actor_user_id
- action
- note
- created_at

Important:

creator_role_context can be trader or lender.
applicant_role_context can be trader, lender, or general user.
Do not create a separate worker role table for MVP.
Anyone applying to a job is treated as the worker for that job.

────────────────────────────────────────
JOBS API CONTRACT
────────────────────────────────────────

GET    /api/v1/jobs
       returns all available jobs

POST   /api/v1/jobs
       creates a new job
       body: {
         title,
         description,
         category,
         location,
         state,
         pay_amount_kobo,
         duration,
         required_skills,
         creator_role_context
       }

GET    /api/v1/jobs/my
       returns jobs created by current user

GET    /api/v1/jobs/applied
       returns jobs current user applied for

GET    /api/v1/jobs/{job_id}
       returns job detail

POST   /api/v1/jobs/{job_id}/apply
       applies to a job
       body: {
         applicant_role_context,
         message
       }

POST   /api/v1/jobs/{job_id}/applications/{application_id}/accept
       accepts applicant and assigns job

POST   /api/v1/jobs/{job_id}/applications/{application_id}/reject
       rejects applicant

POST   /api/v1/jobs/{job_id}/complete
       marks job completed

POST   /api/v1/jobs/{job_id}/release-payment
       releases payment after completion

Update Admin Demo

Add this to /admin/demo:

Jobs demo controls:
- Simulate Job Created
- Simulate Worker Applied
- Simulate Worker Accepted
- Simulate Job Completed
- Simulate Worker Paid

Live feed should show:
- New job created by trader
- New job created by lender
- Applicant applied
- Applicant accepted
- Payment released

Final demo story

Use this exact flow:

Trader receives Squad payment
↓
KudiScore updates
↓
Lender sees trader as loan-ready
↓
Loan is approved
↓
Trader creates a job for sales help
↓
Another user applies
↓
Trader accepts applicant
↓
Job is completed
↓
Payment is released
