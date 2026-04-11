import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthPage } from "../../pages/AuthPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { HabitDetailPage } from "../../pages/HabitDetailPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { ProfilePage } from "../../pages/ProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/habits/:habitId" element={<HabitDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
