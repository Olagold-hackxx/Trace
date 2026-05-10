import { ApplicantCard } from "@/components/jobs/ApplicantCard";
import { ApplicantRow } from "@/components/jobs/ApplicantRow";
import { JobTimeline } from "@/components/jobs/JobTimeline";
import { PaymentStatusCard } from "@/components/jobs/PaymentStatusCard";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { formatNaira } from "@/lib/jobs";
import { getActivitiesForJob, getApplicationsForJob, getJob } from "@/lib/mock-data";

export default function TraderJobDetailPage({
  params
}: {
  params: { id: string };
}) {
  const job = getJob(params.id);
  const jobApplicants = getApplicationsForJob(job.id);
  const activities = getActivitiesForJob(job.id);

  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <h1>{job.title}</h1>
            <p className="subtitle">
              This detail page supports both states: the trader as creator and the trader as an
              applicant. The UI stays long-form so the task, worker, payment, and proof context are
              visible without leaving the page.
            </p>
          </div>
          <div className="button-row">
            <button className="button">Apply for Job</button>
            <button className="button-secondary">Withdraw Application</button>
          </div>
        </div>

        <section className="two-col">
          <SectionCard title="Job summary card" subtitle="Core task details, pay, duration, and status live here.">
            <div className="stack">
              <JobStatusBadge status={job.status} />
              <strong>{formatNaira(job.pay_amount_kobo)}</strong>
              <p className="subtitle">
                {job.description}
              </p>
              <div className="pill-row">
                {job.required_skills.map((skill) => (
                  <span key={skill} className="pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Creator card" subtitle="If the trader is applying, this gives poster context. If the trader created the job, it serves as the posting identity card.">
            <div className="stack">
              <strong>{job.created_by_name}</strong>
              <p className="subtitle">
                {job.location} · {job.state} · {job.duration}
              </p>
              <p className="subtitle">
                Creator role context: {job.creator_role_context}. A creator can be a trader or a
                lender, and the accepted applicant becomes the worker for this task.
              </p>
            </div>
          </SectionCard>
        </section>

        <SectionCard
          title="Applicants table"
          subtitle="If the trader created the job, this is where applicants can be accepted or rejected."
        >
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
          <SectionCard
            title="Applicant list"
            subtitle="Card-based review mode for quick scanning before a decision is made."
          >
            <div className="applicant-list">
              {jobApplicants.map((applicant) => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="Job activity timeline"
            subtitle="This timeline makes job progression auditable from posting through acceptance and payout release."
          >
            <JobTimeline activities={activities} />
          </SectionCard>
        </section>

        <PaymentStatusCard
          status={job.payment_status}
          amount={formatNaira(job.pay_amount_kobo)}
          role="trader"
        />
      </div>
    </main>
  );
}
