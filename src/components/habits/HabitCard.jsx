import { Link } from "react-router-dom";
import { formatHabitFrequency, getHabitProgressSummary } from "../../utils/habits";
import { CheckInButton } from "./CheckInButton";

export function HabitCard({
  habit,
  onEdit,
  onArchive,
  onDelete,
  onCheckIn,
  isCheckingIn = false,
  checkInFeedback = "",
}) {
  const progress = getHabitProgressSummary(habit);

  return (
    <article className="card habit-card">
      <div className="card-row">
        <div>
          <h3>{habit.title}</h3>
          <p>{formatHabitFrequency(habit)}</p>
        </div>
        <CheckInButton
          onClick={() => onCheckIn(habit)}
          isLoading={isCheckingIn}
          isCompleted={progress.isTargetComplete}
          feedbackMessage={checkInFeedback}
          progressLabel={progress.label}
        />
      </div>

      <div className="habit-stats">
        <p>Current streak: {habit.streakCurrent}</p>
        <p>Best streak: {habit.streakBest}</p>
      </div>

      {habit.description ? <p>{habit.description}</p> : null}

      <div className="habit-actions">
        <Link to={`/habits/${habit.id}`} className="text-link">
          Details
        </Link>
        <button type="button" className="secondary-button" onClick={() => onEdit(habit)}>
          Edit
        </button>
        <button type="button" className="secondary-button" onClick={() => onArchive(habit)}>
          Archive
        </button>
        <button type="button" className="secondary-button danger-button" onClick={() => onDelete(habit)}>
          Delete
        </button>
      </div>
    </article>
  );
}
