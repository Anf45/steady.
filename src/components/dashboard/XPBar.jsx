export function XPBar({ value = 0, label = "Total XP" }) {
  const totalXp = Math.max(0, Number(value || 0));
  const nextMilestone = Math.max(100, Math.ceil(totalXp / 100) * 100);
  const currentMilestoneStart = Math.max(0, nextMilestone - 100);
  const progressValue = totalXp - currentMilestoneStart;
  const progressPercent = Math.min((progressValue / 100) * 100, 100);

  return (
    <section className="card">
      <div className="card-row">
        <h3>{label}</h3>
        <span>{totalXp}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="muted-text">Progress to {nextMilestone} XP</p>
    </section>
  );
}
