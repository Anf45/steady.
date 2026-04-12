import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { StatusCard } from "../components/common/StatusCard";
import { getEarnedBadgeDetails, getTotalCheckInCountForUser } from "../services";
import { getHabitsForUser, getUserProfile, resetUserProgress } from "../services";
import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { user, logOut, refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeHabits, setActiveHabits] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const earnedBadges = getEarnedBadgeDetails(profile?.earnedBadges);

  useEffect(() => {
    async function loadProfilePage() {
      if (!user?.uid) {
        setLoadingPage(false);
        return;
      }

      try {
        setPageError("");
        setPageMessage("");
        setLoadingPage(true);

        const [savedProfile, savedHabits, savedCheckInCount] = await Promise.all([
          getUserProfile(user.uid),
          getHabitsForUser(user.uid),
          getTotalCheckInCountForUser(user.uid),
        ]);

        setProfile(savedProfile);
        setActiveHabits(savedHabits);
        setTotalCheckIns(savedCheckInCount);
      } catch (error) {
        setPageError(error.message || "Could not load your profile.");
      } finally {
        setLoadingPage(false);
      }
    }

    loadProfilePage();
  }, [user?.uid]);

  async function handleResetProgress() {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(
      "Reset your account progress? This will clear XP, badges, habits, and saved check-ins, but it will keep your login account."
    );

    if (!confirmed) {
      return;
    }

    try {
      setPageError("");
      setPageMessage("");
      setIsResetting(true);

      await resetUserProgress(user.uid);
      const [savedProfile, savedHabits, savedCheckInCount] = await Promise.all([
        getUserProfile(user.uid),
        getHabitsForUser(user.uid),
        getTotalCheckInCountForUser(user.uid),
      ]);

      setProfile(savedProfile);
      setActiveHabits(savedHabits);
      setTotalCheckIns(savedCheckInCount);
      await refreshUserProfile();
      setPageMessage("Your account progress has been reset.");
    } catch (error) {
      setPageError(error.message || "Could not reset your account progress.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <section className="page-section profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Your account</h2>
        </div>
        <div className="profile-actions">
          <button
            type="button"
            className="secondary-button danger-button"
            onClick={handleResetProgress}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset progress"}
          </button>
          <button type="button" className="secondary-button" onClick={logOut}>
            Log out
          </button>
        </div>
      </div>

      {loadingPage ? (
        <StatusCard title="Loading profile" message="Your account summary is being loaded." />
      ) : pageError ? (
        <section className="card">
          <p className="form-error status-banner">{pageError}</p>
        </section>
      ) : profile ? (
        <div className="profile-grid">
          <section className="card profile-card">
            <p className="eyebrow">Account info</p>
            <h3>{profile?.displayName || user?.displayName || "No name added"}</h3>
            <p>{profile?.email || user?.email || "No email available"}</p>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Progress</p>
            <h3>{profile?.xpTotal || 0} XP</h3>
            <p>Total XP earned so far.</p>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Habits</p>
            <h3>{activeHabits.length}</h3>
            <p>Active habits currently in your account.</p>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Check-ins</p>
            <h3>{totalCheckIns}</h3>
            <p>Total check-ins completed across all habits.</p>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Badges</p>
            {earnedBadges.length === 0 ? (
              <p>No badges earned yet.</p>
            ) : (
              <div className="badge-list">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="badge-item">
                    <strong>{badge.title}</strong>
                    <p>{badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          title="Profile not available"
          description="We could not find your account summary right now."
        />
      )}

      {pageMessage ? (
        <section className="card">
          <p className="status-text">{pageMessage}</p>
        </section>
      ) : null}
    </section>
  );
}
