import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { StatusCard } from "../components/common/StatusCard";
import {
  getBadgeProgressDetails,
  getCurrentRank,
  getLevelFromXp,
  getTotalCheckInCountForUser,
  getXpForNextLevel,
  getXpProgressInLevel,
} from "../services";
import { getHabitsForUser, getUserProfile, resetUserProgress, updateUserTeam } from "../services";
import { useAuth } from "../hooks/useAuth";
import { TEAM_OPTIONS, getTeamDetails } from "../services/teamService";

export function ProfilePage() {
  const { user, logOut, refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeHabits, setActiveHabits] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const badgeProgress = getBadgeProgressDetails(profile?.earnedBadges).slice().reverse();
  const currentTeam = getTeamDetails(profile?.team);
  const totalXp = Number(profile?.xpTotal || 0);
  const level = getLevelFromXp(totalXp);
  const rank = getCurrentRank(totalXp);
  const nextLevelXp = getXpForNextLevel(totalXp);
  const xpIntoLevel = getXpProgressInLevel(totalXp);

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

  async function handleTeamChange(nextTeam) {
    if (!user?.uid || !profile || nextTeam === profile.team) {
      return;
    }

    try {
      setPageError("");
      setPageMessage("");
      setIsSavingTeam(true);

      await updateUserTeam(user.uid, nextTeam);
      const savedProfile = await getUserProfile(user.uid);
      setProfile(savedProfile);
      await refreshUserProfile();
      setPageMessage(`Team changed to ${getTeamDetails(nextTeam).title}.`);
    } catch (error) {
      setPageError(error.message || "Could not update your team.");
    } finally {
      setIsSavingTeam(false);
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
            <p className="muted-text">
              Team: {currentTeam.icon} {currentTeam.title}
            </p>
            <p className="muted-text">
              Title: {rank.title === "No title yet" ? "No title unlocked yet" : rank.title}
            </p>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Team</p>
            <h3>
              {currentTeam.icon} {currentTeam.title}
            </h3>
            <p>{currentTeam.description}</p>
            <div className="team-grid">
              {TEAM_OPTIONS.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={
                    profile?.team === team.id
                      ? `team-option-card ${team.accentClass} active-team-option`
                      : `team-option-card ${team.accentClass}`
                  }
                  onClick={() => handleTeamChange(team.id)}
                  disabled={isSavingTeam}
                >
                  <strong>
                    {team.icon} {team.title}
                  </strong>
                  <span>{team.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card profile-card">
            <p className="eyebrow">Progress</p>
            <h3>Level {level}</h3>
            <p>{totalXp} XP earned so far.</p>
            <p className="muted-text">
              {rank.title === "No title yet"
                ? `Earn ${nextLevelXp - totalXp} more XP to unlock Amateur.`
                : `${rank.title} title unlocked · ${100 - xpIntoLevel} XP to Level ${level + 1}`}
            </p>
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

          <section className="card profile-card profile-badges-card">
            <p className="eyebrow">Badges</p>
            <div className="badge-list">
              {badgeProgress.map((badge) => (
                <div
                  key={badge.id}
                  className={badge.isEarned ? "badge-item" : "badge-item badge-item-locked"}
                >
                  <div className="badge-item-header">
                    <span
                      className={`badge-shape badge-shape-${badge.shape} badge-color-${badge.color}`}
                      aria-hidden="true"
                    />
                    <div className="badge-copy">
                      <strong>{badge.title}</strong>
                      <span className="muted-text">
                        {badge.isEarned ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                  <p>{badge.description}</p>
                  {!badge.isEarned ? <p className="muted-text">Unlock: {badge.unlockHint}</p> : null}
                </div>
              ))}
            </div>
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
