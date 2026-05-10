import type { JobActivity } from "@/lib/jobs";

export function JobTimeline({ activities }: { activities: JobActivity[] }) {
  return (
    <div className="job-timeline">
      {activities.map((activity) => (
        <div key={activity.id} className="job-timeline-item">
          <div className="job-timeline-dot" />
          <div className="job-timeline-content">
            <strong>{activity.action.replaceAll("_", " ")}</strong>
            <p className="subtitle">{activity.note}</p>
            <span className="muted">
              {new Date(activity.created_at).toLocaleString("en-NG")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
