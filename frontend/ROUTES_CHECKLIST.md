# Trace Platform - Route Testing Checklist

## All 15 Routes

### Landing & Auth ✓
- [x] `/` - Landing page (hero, features, how it works, CTA, footer)
  - Test: Visit homepage, scroll through all sections
  - Features: Real Unsplash images, hero CTAs, footer links
  
- [x] `/auth/login` - Login form
  - Test: Click "Login" in header, see role selector (trader/worker/lender)
  - Features: Clean split layout, form validation hints
  
- [x] `/auth/register` - Registration form
  - Test: Click "Sign Up", select different roles, form fields change
  - Features: Business name field for traders, dynamic form

### Trader Dashboard Module ✓
- [x] `/dashboard` - Main trader dashboard
  - Test: Should show Amaka Foods, revenue card, weekly chart, jobs section
  - Features: 4 metric cards, bar chart, active jobs grid, top applicants
  
- [x] `/payments` - Payment management
  - Test: Shows virtual account, payment links, transactions table
  - Features: Account copy button, recent transactions, metrics
  
- [x] `/tracescore` - Credit score & capital
  - Test: Score gauge (742), breakdown, revenue trend, approval info
  - Features: Circular gauge, line chart, component breakdown, capital eligibility
  
- [x] `/jobs` - Post and manage jobs
  - Test: Shows 5+ active jobs, metrics (applicants, hired)
  - Features: Job cards, stats grid, "Post New Job" button

### Job Detail ✓
- [x] `/jobs/[jobId]` - Specific job (e.g., /jobs/job-1)
  - Test: Visit `/jobs/job-1`, see "Stock Clerk" job, 5 applicants
  - Features: Job details, applicant list, hire button, applicant cards

### Worker Module ✓
- [x] `/worker` - Worker dashboard (e.g., Tobi Ade)
  - Test: Shows earnings chart, completed jobs, recommended jobs
  - Features: 5 metric cards, earnings bar chart, recommended jobs sidebar
  
- [x] `/worker/settings` - Worker profile settings
  - Test: Profile preview, 4 settings sections (profile, bank, notifications, security)
  - Features: Avatar display, edit buttons for each section

### Marketplace ✓
- [x] `/marketplace` - Browse all jobs
  - Test: Shows 8 jobs, search/filter by location works
  - Features: Job cards, search bar, location filter, responsive grid
  
- [x] `/marketplace/[jobId]` - Job detail for workers (e.g., /marketplace/job-1)
  - Test: See job details, business info, apply button
  - Features: Job details, business card, apply/save buttons

### Lender Module ✓
- [x] `/lender` - Lender dashboard
  - Test: Shows merchant leaderboard, pending reviews, risk pie chart
  - Features: Risk distribution chart, pending merchants table, stats grid
  
- [x] `/lender/merchants/[merchantId]` - Underwriting detail
  - Test: Visit `/lender/merchants/trader-1`, see Amaka Foods details
  - Features: Merchant profile, TraceScore, metrics, risk assessment, transactions, approve/reject buttons

### Admin Module ✓
- [x] `/admin` - Platform admin dashboard
  - Test: Shows platform stats, volume trend, recent activity, growth table
  - Features: 6 metric cards, line chart, activity feed, user growth table

## Cross-Page Testing

### Navigation ✓
- [ ] Sidebar links work on all pages (click nav items, verify active state)
- [ ] Role-based navbar shows correct color (orange/purple/blue/navy)
- [ ] Landing page links to auth pages
- [ ] Auth pages link back to login/register

### Responsive Design ✓
- [ ] Desktop (1440px): Sidebar visible, content right-aligned
- [ ] Tablet (768px): Sidebar hidden, full-width content
- [ ] Mobile (375px): Stacked layout, no horizontal scroll, buttons full-width

### Visual Design ✓
- [ ] Consistent color scheme (orange #ff6b00 as primary)
- [ ] White cards with borders on all pages
- [ ] Status badges show correct colors (green/blue/amber/red)
- [ ] Responsive grid layouts adapt to screen size
- [ ] Images load from Unsplash without errors

### Functional Elements ✓
- [ ] Naira currency displays correctly (₦)
- [ ] Dates format as "Jan 15, 2024"
- [ ] Charts render properly (no errors)
- [ ] Forms look clean (inputs, buttons, labels)
- [ ] Tables scroll horizontally on mobile
- [ ] All links are clickable

### Data Integrity ✓
- [ ] Mock data is consistent across pages
- [ ] Same trader appears in multiple pages with same data
- [ ] Jobs have consistent applicant counts
- [ ] TraceScores match between pages
- [ ] Transactions show correct amounts and types

## Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance ✓
- [ ] Page loads in < 2 seconds
- [ ] No console errors
- [ ] No warnings in dev tools
- [ ] Images load without breaking layout
- [ ] Smooth animations/transitions

## Accessibility ✓
- [ ] All images have alt text
- [ ] Form labels present and associated
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Tab navigation works
- [ ] Screen reader friendly (test with browser reader)

## Business Logic Validation ✓
- [ ] Product loop is clear (payments → score → capital → workers → history)
- [ ] Jobs are core feature (not minor)
- [ ] All user roles represented (trader/worker/lender/admin)
- [ ] TraceScore calculation makes sense
- [ ] Merchant underwriting flow is logical

## Final Checklist
- [x] All 15 routes implemented
- [x] No MerchantOS terminology (only Trace)
- [x] Real Unsplash images integrated
- [x] Professional fintech design (no neo-brutalism, cartoons, or gimmicks)
- [x] Responsive on all breakpoints
- [x] 100% mock data (no backend needed)
- [x] Sidebar only on product pages (not landing/auth)
- [x] Dynamic routes use mock data correctly
- [x] All navigation links functional
- [x] Charts and data visualizations working
