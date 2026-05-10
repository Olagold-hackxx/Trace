import Link from "next/link";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { formatNaira, type Job } from "@/lib/jobs";

type JobCardProps = {
  job: Job;
  href: string;
};

export function JobCard({ job, href }: JobCardProps) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="stack" style={{ gap: "10px" }}>
          <div className="job-title">{job.title}</div>
          <div className="job-meta">
            <span className="job-meta-item">{job.created_by_name}</span>
            <span className="job-meta-item">{job.location}</span>
            <span className="job-meta-item">{job.duration}</span>
          </div>
        </div>
        <JobStatusBadge status={job.status} />
      </div>
      <div className="job-pay">{formatNaira(job.pay_amount_kobo)}</div>
      <div className="job-description">{job.description}</div>
      <div className="pill-row">
        {job.required_skills.map((skill) => (
          <span key={skill} className="pill">
            {skill}
          </span>
        ))}
      </div>
      <div className="job-actions">
        <Link href={href} className="button-secondary">
          View Job
        </Link>
      </div>
    </article>
  );
}
