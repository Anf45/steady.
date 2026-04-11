export function CheckInButton({
  onClick,
  isLoading = false,
  isCompleted = false,
  feedbackMessage = "",
  progressLabel = "",
}) {
  const buttonLabel = isLoading
    ? "Checking in..."
    : isCompleted
      ? "Target reached today"
      : "Check in";

  return (
    <div className="check-in-block">
      <button
        type="button"
        className="secondary-button"
        onClick={onClick}
        disabled={isLoading || isCompleted}
      >
        {buttonLabel}
      </button>
      {progressLabel ? <p className="muted-text">{progressLabel}</p> : null}
      {feedbackMessage ? <p className="status-text">{feedbackMessage}</p> : null}
    </div>
  );
}
