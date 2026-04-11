export function StatusCard({ title, message, tone = "default" }) {
  const className = tone === "error" ? "status-card status-banner" : "card status-card";

  return (
    <section className={className}>
      <h3>{title}</h3>
      <p>{message}</p>
    </section>
  );
}
