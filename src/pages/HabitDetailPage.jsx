import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { StatusCard } from "../components/common/StatusCard";
import { CheckInButton } from "../components/habits/CheckInButton";
import { useAuth } from "../hooks/useAuth";
import { completeHabitCheckIn, getHabitById, getRecentCheckInsForHabit } from "../services";
import { formatHabitDifficulty, formatHabitFrequency, getHabitProgressSummary } from "../utils/habits";

export function HabitDetailPage() {
  const { habitId } = useParams();
  const { user, refreshUserProfile } = useAuth();
  const [habit, setHabit] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loadingHabit, setLoadingHabit] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInFeedback, setCheckInFeedback] = useState("");
  const progress = getHabitProgressSummary(habit);

  useEffect(() => {
    async function loadHabitDetails() {
      if (!user?.uid || !habitId) {
        setLoadingHabit(false);
        return;
      }

      try {
        setPageError("");
        setLoadingHabit(true);
        const [savedHabit, savedCheckIns] = await Promise.all([
          getHabitById(user.uid, habitId),
          getRecentCheckInsForHabit(user.uid, habitId),
        ]);
        setHabit(savedHabit);
        setRecentCheckIns(savedCheckIns);
      } catch (error) {
        setPageError(error.message || "Could not load the habit.");
      } finally {
        setLoadingHabit(false);
      }
    }

    loadHabitDetails();
  }, [habitId, user?.uid]);

  async function handleCheckIn() {
    if (!user?.uid || !habitId) {
      return;
    }

    try {
      setPageError("");
      setIsCheckingIn(true);

      const result = await completeHabitCheckIn(user.uid, habitId);

      setHabit(result.updatedHabit);
      setCheckInFeedback(
        result.status === "already-completed"
          ? "Target already reached for today."
          : result.updatedHabit.isCompletedToday
            ? `Daily target complete. +${result.xpAwarded} XP`
            : `Progress saved. ${result.updatedHabit.todayCompletionCount}/${result.updatedHabit.frequencyTarget} today, +${result.xpAwarded} XP`
      );

      const savedCheckIns = await getRecentCheckInsForHabit(user.uid, habitId);
      setRecentCheckIns(savedCheckIns);
      await refreshUserProfile();
    } catch (error) {
      setPageError(error.message || "Could not complete the check-in.");
    } finally {
      setIsCheckingIn(false);
    }
  }

  return (
    <section className="page-section habit-detail-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Habit detail</p>
          <h2>{habit?.title || "Habit details"}</h2>
        </div>
        <CheckInButton
          onClick={handleCheckIn}
          isLoading={isCheckingIn}
          isCompleted={progress.isTargetComplete}
          feedbackMessage={checkInFeedback}
          progressLabel={progress.label}
        />
      </div>

      <Link to="/dashboard" className="text-link">
        Back to dashboard
      </Link>

      <section className="card habit-detail-card">
        {loadingHabit ? (
          <StatusCard
            title="Loading habit"
            message="We are loading this habit and its recent activity."
          />
        ) : pageError ? (
          <p className="form-error status-banner">{pageError}</p>
        ) : habit ? (
          <>
            <h3>{habit.title}</h3>
            <p>{habit.description || "No description added yet."}</p>
            <div className="habit-detail-list">
              <p>
                <strong>Frequency:</strong> {formatHabitFrequency(habit)}
              </p>
              <p>
                <strong>Difficulty:</strong> {formatHabitDifficulty(habit)}
              </p>
              <p>
                <strong>Current streak:</strong> {habit.streakCurrent}
              </p>
              <p>
                <strong>Best streak:</strong> {habit.streakBest}
              </p>
              <p>
                <strong>Last check-in:</strong> {habit.lastCheckInDate || "No check-ins yet"}
              </p>
              <p>
                <strong>Today:</strong> {progress.label}
              </p>
            </div>
          </>
        ) : (
          <p>Habit not found.</p>
        )}
      </section>

      <section className="card habit-detail-card">
        <div>
          <p className="eyebrow">Recent activity</p>
          <h3>Recent check-ins</h3>
        </div>

        {loadingHabit ? (
          <p>Loading recent check-ins...</p>
        ) : recentCheckIns.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            description="Once you check in, your recent dates will be listed here."
          />
        ) : (
          <ul className="check-in-history">
            {recentCheckIns.map((checkIn) => (
              <li key={checkIn.id}>
                {checkIn.id} - {checkIn.completionCount} completion
                {checkIn.completionCount === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
