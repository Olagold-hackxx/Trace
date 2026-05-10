import { ApplicantCard } from "@/components/jobs/ApplicantCard";
import { ApplicantRow } from "@/components/jobs/ApplicantRow";
import { JobTimeline } from "@/components/jobs/JobTimeline";
import { PaymentStatusCard } from "@/components/jobs/PaymentStatusCard";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatNaira } from "@/lib/jobs";
import { getActivitiesForJob, getApplicationsForJob, getJob } from "@/lib/mock-data";

export default function LenderJobDetailPage({
  params
}: {
  params: { id: string };
}) {
  const job = getJob(params.id);
  const jobApplicants = getApplicationsForJob(job.id);
  const activities = getActivitiesForJob(job.id);

  return (
    <main className="page lender-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>{job.title}</h1>
            <p className="subtitle">
              This lender detail view handles both creator and applicant perspectives while keeping
              the task brief, worker review, proof, and payout status in one long-form workspace.
            </p>
          </div>
          <div className="button-row">
            <button className="button">Assign Field Worker</button>
            <button className="button-secondary">Track Application</button>
          </div>
        </div>

        <section className="two-col">
          <SectionCard title="Job summary" subtitle="Purpose, pay, location, and verification context.">
            <div className="stack">
              <JobStatusBadge status={job.status} />
              <strong>{formatNaira(job.pay_amount_kobo)}</strong>
              <p className="subtitle">{job.description}</p>
              <p className="subtitle">
                {job.location} · {job.duration} · Creator role {job.creator_role_context}
              </p>
            </div>
          </SectionCard>
          <SectionCard title="Field task checklist" subtitle="What should be confirmed before the task is marked complete.">
            <ul className="checklist">
              <li>Identity or merchant evidence reviewed.</li>
              <li>Location proof captured and attached.</li>
              <li>Short field report submitted.</li>
            </ul>
          </SectionCard>
        </section>

        <SectionCard title="Applicant list" subtitle="Accept or reject applicants and assign the best fit for the task.">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Role context</th>
                  <th>Location</th>
                  <th>Reliability</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobApplicants.map((applicant) => (
                  <ApplicantRow key={applicant.id} applicant={applicant} />
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <section className="two-col">
          <SectionCard title="Completion proof" subtitle="Review evidence before payout release.">
            <div className="applicant-list">
              {jobApplicants.map((applicant) => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Job activity timeline" subtitle="Each step should be observable and reviewable.">
            <JobTimeline activities={activities} />
          </SectionCard>
        </section>

        <PaymentStatusCard
          status={job.payment_status}
          amount={formatNaira(job.pay_amount_kobo)}
          role="lender"
        />
      </div>
    </main>
  );
}
