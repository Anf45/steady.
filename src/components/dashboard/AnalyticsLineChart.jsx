export function AnalyticsLineChart({
  eyebrow,
  title,
  description,
  data = [],
  emptyTitle,
  emptyDescription,
  valueSuffix = "",
  compact = false,
}) {
  const highestValue = data.reduce((currentHighest, item) => Math.max(currentHighest, item.value), 0);
  const hasValues = highestValue > 0;
  const chartWidth = 320;
  const chartHeight = 120;
  const padding = 16;
  const usableWidth = chartWidth - padding * 2;
  const usableHeight = chartHeight - padding * 2;

  // Spread points evenly across the chart so the line stays readable on any screen size.
  const points = data.map((item, index) => {
    const x = padding + (usableWidth / Math.max(data.length - 1, 1)) * index;
    const normalizedValue = highestValue > 0 ? item.value / highestValue : 0;
    const y = chartHeight - padding - normalizedValue * usableHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${
        chartHeight - padding
      } Z`
    : "";

  return (
    <section className={`card analytics-card${compact ? " analytics-card-compact" : ""}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {hasValues ? (
        <div className="line-chart-card">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="line-chart"
            role="img"
            aria-label={title}
          >
            <path className="line-chart-area" d={areaPath} />
            <path className="line-chart-path" d={linePath} />
            {points.map((point) => (
              <circle key={point.label} className="line-chart-point" cx={point.x} cy={point.y} r="4" />
            ))}
          </svg>

          <div className="line-chart-labels">
            {points.map((point) => (
              <div key={point.label} className="line-chart-label-item">
                <span>{point.label}</span>
                <strong>
                  {point.value}
                  {valueSuffix}
                </strong>
              </div>
            ))}
          </div>
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
