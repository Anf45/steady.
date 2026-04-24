import { NavLink } from "react-router-dom";
import { BrandMark } from "../common/BrandMark";
import { useAuth } from "../../hooks/useAuth";
import { getCurrentRank, getLevelFromXp } from "../../services";
import { getTeamDetails } from "../../services/teamService";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
];

export function Navbar({ theme = "light", onToggleTheme }) {
  const { user, userProfile, logOut } = useAuth();
  const displayName = user?.displayName || "there";
  const totalXp = userProfile?.xpTotal || 0;
  const level = getLevelFromXp(totalXp);
  const rank = getCurrentRank(totalXp);
  const currentTeam = getTeamDetails(userProfile?.team);

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-row">
          <BrandMark compact />
          <div>
            <p className="eyebrow">Habit tracker</p>
            <h1>Welcome back</h1>
          </div>
        </div>
        <p>
          Welcome back, {displayName}. Team {currentTeam.icon} {currentTeam.title}.{" "}
          {rank.title !== "No title yet" ? `${rank.title} · ` : ""}Level {level}.
        </p>
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
          <span className="xp-label">
            Level {level}
            {rank.title !== "No title yet" ? ` · ${rank.title}` : ""}
          </span>
          <strong>{totalXp} XP</strong>
        </div>
        <button type="button" className="secondary-button" onClick={onToggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button type="button" className="secondary-button" onClick={logOut}>
          Log out
        </button>
      </div>
    </header>
  );
}
