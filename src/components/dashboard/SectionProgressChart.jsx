export function SectionProgressChart({ sections = [] }) {
  const highestCheckInCount = sections.reduce(
    (currentHighest, section) => Math.max(currentHighest, section.checkIns),
    0
  );

  return (
    <section className="card analytics-card">
      <div>
        <p className="eyebrow">Section progress</p>
        <h3>Where you are most active</h3>
        <p>A simple view of which habit sections are getting the most check-ins.</p>
      </div>

      {highestCheckInCount > 0 ? (
        <div className="analytics-chart">
          {sections.map((section) => (
            <div key={section.label} className="analytics-bar-group">
              <div className="analytics-bar-meta">
                <span>{section.label}</span>
                <strong>{section.checkIns} check-ins</strong>
              </div>
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill"
                  style={{
                    width: `${Math.max(
                      (section.checkIns / highestCheckInCount) * 100,
                      section.checkIns > 0 ? 12 : 0
                    )}%`,
                  }}
                />
              </div>
              <p className="muted-text">
                {section.habits} habit{section.habits === 1 ? "" : "s"} in this section, {section.xp} XP
                earned
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="analytics-empty-state">
          <h4>No section activity yet</h4>
          <p>Once you start checking in, your busiest habit sections will show up here.</p>
        </div>
      )}
    </section>
  );
}
