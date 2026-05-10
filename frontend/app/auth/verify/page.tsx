export default function VerifyPage() {
  return (
    <main className="landing-shell">
      <div className="two-col">
        <section className="card">
          <div className="stack">
            <span className="eyebrow">Verify</span>
            <h1 className="display" style={{ fontSize: "4rem" }}>
              Confirm the device and unlock your score.
            </h1>
            <div className="field-grid">
              <label className="field">
                <span>Verification code</span>
                <input placeholder="6-digit code" />
              </label>
              <label className="field">
                <span>Business alias</span>
                <input placeholder="Optional device label" />
              </label>
            </div>
            <div className="button-row">
              <button className="button">Verify Account</button>
              <button className="button-secondary">Resend Code</button>
            </div>
          </div>
        </section>
        <section className="stack">
          <div className="card">
            <h3>Verification unlocks</h3>
            <ul className="checklist">
              <li>Transaction-backed KudiScore insights.</li>
              <li>Loan visibility and operating finance workflows.</li>
              <li>Job posting, job application, and payout release actions.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
