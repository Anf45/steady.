export function AnalyticsBarChart({
  eyebrow,
  title,
  description,
  data = [],
  emptyTitle,
  emptyDescription,
  valueSuffix = "",
}) {
  const highestValue = data.reduce((currentHighest, item) => Math.max(currentHighest, item.value), 0);
  const hasValues = highestValue > 0;

  return (
    <section className="card analytics-card">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {hasValues ? (
        <div className="analytics-chart">
          {data.map((item) => (
            <div key={item.label} className="analytics-bar-group">
              <div className="analytics-bar-meta">
                <span>{item.label}</span>
                <strong>
                  {item.value}
                  {valueSuffix}
                </strong>
              </div>
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill"
                  style={{
                    width: `${Math.max((item.value / highestValue) * 100, item.value > 0 ? 12 : 0)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="analytics-empty-state">
          <h4>{emptyTitle}</h4>
          <p>{emptyDescription}</p>
        </div>
      )}
    </section>
  );
}
