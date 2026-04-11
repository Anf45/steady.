export function XPBar({ value = 0, label = "Total XP" }) {
  const safeValue = Math.max(0, Math.min(value, 100));

  // TODO: Replace this with real XP progress data from the database.
  return (
    <section className="card">
      <div className="card-row">
        <h3>{label}</h3>
        <span>{safeValue}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </section>
  );
}
