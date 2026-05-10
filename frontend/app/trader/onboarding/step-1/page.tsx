export default function TraderOnboardingStepOne() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Trader Onboarding</span>
            <h1>Step 1: Business identity</h1>
            <p className="subtitle">
              Start with the merchant story KudiScore should understand before payment and job
              activity deepen the profile.
            </p>
          </div>
          <span className="badge">Step 1 of 3</span>
        </div>
        <div className="card">
          <div className="field-grid">
            <label className="field">
              <span>Business name</span>
              <input placeholder="Mama Ngozi's Provisions" />
            </label>
            <label className="field">
              <span>Trade category</span>
              <input placeholder="Groceries" />
            </label>
            <label className="field">
              <span>Market or address</span>
              <input placeholder="Mile 12 Market" />
            </label>
            <label className="field">
              <span>State</span>
              <input placeholder="Lagos" />
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
