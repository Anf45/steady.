export function EmptyState({ title, description, action = null }) {
  return (
    <section className="card empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </section>
  );
}
