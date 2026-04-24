import { getCurrentRank, getLevelFromXp, getXpForNextLevel, getXpProgressInLevel } from "../../services";

export function XPBar({ value = 0, label = "Total XP" }) {
  const totalXp = Math.max(0, Number(value || 0));
  const level = getLevelFromXp(totalXp);
  const rank = getCurrentRank(totalXp);
  const nextMilestone = getXpForNextLevel(totalXp);
  const progressValue = getXpProgressInLevel(totalXp);
  const progressPercent = Math.min((progressValue / 100) * 100, 100);

  return (
    <section className="card">
      <div className="card-row">
        <h3>{label}</h3>
        <span>{totalXp}</span>
      </div>
      <p className="muted-text">
        Level {level} {rank.title !== "No title yet" ? `· ${rank.title}` : ""}
      </p>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="muted-text">Progress to Level {level + 1} ({nextMilestone} XP)</p>
    </section>
  );
}
