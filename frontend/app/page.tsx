import Link from "next/link";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { JobCard } from "@/components/jobs/JobCard";
import { demoStory, jobs, merchants } from "@/lib/mock-data";

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <div className="landing-stack">
        <section className="hero-grid">
          <div className="card fade-in" style={{ gridColumn: "span 2" }}>
            <div className="stack">
              <span className="eyebrow">KudiScore</span>
              <h1 className="display">
                Turn payment history into credit strength, job access, and daily income mobility.
              </h1>
              <p className="lead">
                KudiScore is a neo-brutalist operating surface for traders and lenders. It reads
                real business activity, surfaces credit readiness, and folds jobs into the same
                workflow so users can create work, find help, or earn from nearby tasks.
              </p>
              <div className="button-row">
                <Link className="button" href="/auth/register">
                  Register
                </Link>
                <Link className="button-secondary" href="/trader/dashboard">
                  View Trader Demo
                </Link>
                <Link className="button-secondary" href="/lender/dashboard">
                  View Lender Demo
                </Link>
              </div>
            </div>
          </div>
          <div className="card fade-in">
            <div className="stack">
              <span className="badge">Shared Jobs Module</span>
              <h3>No separate worker side.</h3>
              <p className="subtitle">
                A trader can post or apply. A lender can post or apply. The worker is simply the
                user who accepts or is assigned a job.
              </p>
              <ul className="checklist">
                <li>Create jobs from operating cash flow.</li>
                <li>Apply to nearby jobs to earn income.</li>
                <li>Release payment after proof and completion.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="stat-grid">
          <StatCard label="Live merchant score" value="82 / 100" foot="Powered by real payment activity" />
          <StatCard label="Jobs activated" value="348" foot="Shared across trader and lender sides" />
          <StatCard label="Loans approved" value="NGN 48M" foot="Readiness surfaced from verified transactions" />
          <StatCard label="Worker payouts" value="NGN 6.2M" foot="Released from completed tasks" />
        </section>

        <section className="two-col">
          <SectionCard
            title="Trader growth loop"
            subtitle="Payments increase trust, trust improves score, score opens credit, and jobs extend the business operating layer."
          >
            <div className="timeline-rail">
              {demoStory.map((step, index) => (
                <div key={step} className="feed-item">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="Role-flexible users"
            subtitle="KudiScore is not split into product silos. The same person can borrow, hire, work, repay, and build stronger reputation from one account context."
          >
            <div className="stack">
              <div className="callout">
                Traders use the jobs layer for rush-hour staffing, stock handling, delivery help,
                payment desk support, and temporary field tasks.
              </div>
              <div className="callout">
                Lenders use the same module for merchant verification, KYC collection, market
                survey work, follow-up, inspections, and onboarding support.
              </div>
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Available jobs right now"
          subtitle="Jobs appear as part of the business growth layer, with the same loud orange neo-brutalist visual language used across the rest of the product."
        >
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                href={job.creator_role_context === "trader" ? `/trader/jobs/${job.id}` : `/lender/jobs/${job.id}`}
              />
            ))}
          </div>
        </SectionCard>

        <section className="two-col">
          <SectionCard
            title="Lender intelligence"
            subtitle="Underwriters do not just see a static profile. They see payment depth, merchant activity, field verification demand, and whether operating jobs are being completed well."
          >
            <div className="stack">
              {merchants.map((merchant) => (
                <div key={merchant.id} className="progress-item">
                  <div>
                    <strong>{merchant.name}</strong>
                    <p className="subtitle">
                      {merchant.sector} · {merchant.location}
                    </p>
                  </div>
                  <span className="badge">Score {merchant.score}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="What ships in this frontend folder"
            subtitle="A complete route scaffold for Trader, Lender, and Admin pages, shared job components, mock-data-only screens, and a matching product prompt file."
          >
            <ul className="bullet-list">
              <li>Landing and auth pages.</li>
              <li>Trader dashboard, score, loans, jobs, and profile flows.</li>
              <li>Lender merchants, portfolio, jobs, and profile flows.</li>
              <li>Admin demo controls and live feed pages.</li>
            </ul>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
