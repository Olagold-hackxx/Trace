export default function TraderOnboardingStepTwo() {
  return (
    <main className="page trader-page">
      <div className="stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Trader Onboarding</span>
            <h1>Step 2: Payment footprint</h1>
            <p className="subtitle">
              Connect the payment channels and operating habits that help KudiScore build credit
              confidence around the business.
            </p>
          </div>
          <span className="badge">Step 2 of 3</span>
        </div>
        <div className="card">
          <ul className="checklist">
            <li>Primary settlement provider and average daily inflow.</li>
            <li>Cash versus transfer sales mix.</li>
            <li>Peak days, repeat buyers, and turnover rhythm.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
