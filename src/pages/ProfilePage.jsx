import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { StatusCard } from "../components/common/StatusCard";
import { getEarnedBadgeDetails } from "../services";
import { getHabitsForUser, getUserProfile } from "../services";
import { useAuth } from "../hooks/useAuth";

export function ProfilePage() {
  const { user, logOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeHabits, setActiveHabits] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const earnedBadges = getEarnedBadgeDetails(profile?.earnedBadges);

  useEffect(() => {
    async function loadProfilePage() {
      if (!user?.uid) {
        setLoadingPage(false);
        return;
      }

      try {
        setPageError("");
        setLoadingPage(true);

        const [savedProfile, savedHabits] = await Promise.all([
          getUserProfile(user.uid),
          getHabitsForUser(user.uid),
        ]);

        setProfile(savedProfile);
        setActiveHabits(savedHabits);
      } catch (error) {
        setPageError(error.message || "Could not load your profile.");
      } finally {
        setLoadingPage(false);
      }
    }

    loadProfilePage();
  }, [user?.uid]);

  return (
    <section className="page-section profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Your account</h2>
        </div>
        <button type="button" className="secondary-button" onClick={logOut}>
          Log out
        </button>
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
    </section>
  );
}
