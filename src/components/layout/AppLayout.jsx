import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTeamDetails } from "../../services/teamService";
import { Navbar } from "./Navbar";

export function AppLayout() {
  const { userProfile } = useAuth();
  const [theme, setTheme] = useState("light");
  const currentTeam = getTeamDetails(userProfile?.team);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("steady-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("steady-theme", nextTheme);
  }

  return (
    <div className={`app-shell ${currentTeam.accentClass}`}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
