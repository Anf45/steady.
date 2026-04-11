import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user, userProfile, logOut } = useAuth();
  const displayName = user?.displayName || "there";
  const totalXp = userProfile?.xpTotal || 0;

  return (
    <header className="navbar">
      <div className="nav-brand">
        <p className="eyebrow">steady.</p>
        <h1>steady.</h1>
        <p>Welcome back, {displayName}.</p>
      </div>
      <nav className="nav-links" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-user">
        <div className="xp-chip">
          <span className="xp-label">Total XP</span>
          <strong>{totalXp}</strong>
        </div>
        <button type="button" className="secondary-button" onClick={logOut}>
          Log out
        </button>
      </div>
    </header>
  );
}
