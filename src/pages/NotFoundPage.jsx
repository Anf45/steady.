import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-section centered-card">
      <div className="card">
        <p className="eyebrow">404</p>
        <h2>NotFoundPage</h2>
        <p>The page you are looking for was not found.</p>
        <Link to="/dashboard" className="text-link">
          Go back to dashboard
        </Link>
      </div>
    </section>
  );
}
