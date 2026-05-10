import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="landing-shell">
      <div className="two-col">
        <section className="card">
          <div className="stack">
            <span className="eyebrow">Login</span>
            <h1 className="display" style={{ fontSize: "4rem" }}>
              Return to your operating dashboard.
            </h1>
            <div className="field-grid">
              <label className="field">
                <span>Phone or email</span>
                <input placeholder="Enter account identifier" />
              </label>
              <label className="field">
                <span>Password</span>
                <input placeholder="Enter password" type="password" />
              </label>
            </div>
            <div className="button-row">
              <button className="button">Login</button>
              <Link href="/auth/verify" className="button-secondary">
                Verify Device
              </Link>
            </div>
          </div>
        </section>
        <section className="stack">
          <div className="card">
            <h3>Inside your session</h3>
            <p className="subtitle">
              Payment events, score movement, loan readiness, operational tasks, job applications,
              and payout flows all sit in one visible workspace.
            </p>
          </div>
          <div className="card">
            <h3>Shared jobs reminder</h3>
            <p className="subtitle">
              You do not need a special worker login. If you apply to a job, you become the worker
              for that task context.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
