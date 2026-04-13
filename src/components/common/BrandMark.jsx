export function BrandMark({ compact = false }) {
  return (
    <div className={compact ? "brand-mark brand-mark-compact" : "brand-mark"}>
      <div className="brand-mark-inner">
        <h2>steady.</h2>
        {!compact ? <p>A Gamified Habit Tracker</p> : null}
      </div>
    </div>
  );
}
