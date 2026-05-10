import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="landing-shell">
      <div className="two-col">
        <section className="card">
          <div className="stack">
            <span className="eyebrow">Register</span>
            <h1 className="display" style={{ fontSize: "4rem" }}>
              Create your KudiScore profile.
            </h1>
            <p className="lead">
              Start as a trader, lender, or general business operator. Jobs stay shared, so your
              account can hire, apply, complete work, and build trust over time.
            </p>
            <div className="field-grid">
              <label className="field">
                <span>Full name</span>
                <input placeholder="Timi Ade" />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input placeholder="+234..." />
              </label>
              <label className="field">
                <span>Email</span>
                <input placeholder="name@example.com" />
              </label>
              <label className="field">
                <span>Primary role</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Select role
                  </option>
                  <option>Trader</option>
                  <option>Lender</option>
                  <option>Business operator</option>
                </select>
              </label>
            </div>
            <div className="button-row">
              <button className="button">Create Account</button>
              <Link href="/auth/login" className="button-secondary">
                Already have an account
              </Link>
            </div>
          </div>
        </section>
        <section className="stack">
          <div className="card">
            <h3>Why register</h3>
            <ul className="checklist">
              <li>Turn real transaction history into a visible credit story.</li>
              <li>Create jobs for staff, market help, and field operations.</li>
              <li>Apply to jobs when you want extra income or flexible work.</li>
            </ul>
          </div>
          <div className="card">
            <h3>Trust signals collected</h3>
            <p className="subtitle">
              KudiScore uses payment consistency, business activity, operational follow-through,
              and job reliability to create a richer picture than static onboarding alone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
