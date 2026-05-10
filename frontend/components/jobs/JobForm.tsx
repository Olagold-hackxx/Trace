type JobFormProps = {
  role: "trader" | "lender";
  categories: string[];
  infoMessage: string;
};

export function JobForm({ role, categories, infoMessage }: JobFormProps) {
  return (
    <div className="stack">
      <div className={`info-card ${role}`}>
        <strong>{infoMessage}</strong>
      </div>
      <form className="card">
        <div className="stack">
          <div>
            <h3>Create Job</h3>
            <p className="subtitle">
              Build an operational request that can be posted, matched, assigned, tracked, and
              paid from inside the same KudiScore role workspace.
            </p>
          </div>
          <div className="job-form-grid">
            <label className="field">
              <span>Job title</span>
              <input defaultValue="" placeholder="Enter clear job title" />
            </label>
            <label className="field">
              <span>Job category</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="field job-form-full">
              <span>Job description</span>
              <textarea placeholder="Describe the task, expectations, and what good completion looks like." />
            </label>
            <label className="field">
              <span>Location</span>
              <input placeholder="Street, market, or business area" />
            </label>
            <label className="field">
              <span>State</span>
              <input placeholder="Lagos" />
            </label>
            <label className="field">
              <span>Pay amount</span>
              <input placeholder="8000" />
            </label>
            <label className="field">
              <span>Duration</span>
              <input placeholder="1 day" />
            </label>
            <label className="field">
              <span>Required skills</span>
              <input placeholder="Sales, reporting, cash handling" />
            </label>
            <label className="field">
              <span>Urgency</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select urgency
                </option>
                <option>Today</option>
                <option>This week</option>
                <option>Flexible</option>
              </select>
            </label>
            {role === "lender" ? (
              <label className="field">
                <span>Verification requirement</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Select requirement
                  </option>
                  <option>ID required</option>
                  <option>Prior job history required</option>
                  <option>No requirement</option>
                </select>
              </label>
            ) : null}
            <label className="field">
              <span>Payment method</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select payment method
                </option>
                <option>Pay after completion</option>
                <option>Pay upfront</option>
                <option>Split payment</option>
              </select>
            </label>
          </div>
          <div className="button-row">
            <button className="button" type="submit">
              Post Job
            </button>
            <button className="button-secondary" type="button">
              Save Draft
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
