import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionHeader } from "../components/common/SectionHeader";
import { AnalyticsBarChart } from "../components/dashboard/AnalyticsBarChart";
import { AnalyticsLineChart } from "../components/dashboard/AnalyticsLineChart";
import { SectionProgressChart } from "../components/dashboard/SectionProgressChart";
import { StatusCard } from "../components/common/StatusCard";
import { XPBar } from "../components/dashboard/XPBar";
import { HabitCard } from "../components/habits/HabitCard";
import { HabitForm } from "../components/habits/HabitForm";
import { useAuth } from "../hooks/useAuth";
import { groupHabitsBySection } from "../utils/habits";
import {
  archiveHabit,
  completeHabitCheckIn,
  createHabit,
  deleteHabit,
  getDashboardAnalytics,
  getHabitsForUser,
  getTipOfTheDay,
  getTotalCheckInCountForUser,
  restoreHabit,
  updateHabit,
} from "../services";

export function DashboardPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [habits, setHabits] = useState([]);
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isSavingHabit, setIsSavingHabit] = useState(false);
  const [checkingInHabitId, setCheckingInHabitId] = useState("");
  const [checkInFeedbackByHabit, setCheckInFeedbackByHabit] = useState({});
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [analytics, setAnalytics] = useState({
    weeklyCheckIns: [],
    weeklyXp: [],
    completionTrend: [],
    sectionProgress: [],
  });
  const habitFormRef = useRef(null);
  const displayName = user?.displayName || "friend";
  const totalXp = userProfile?.xpTotal || 0;
  const dailyTip = getTipOfTheDay();
  const groupedHabits = groupHabitsBySection(habits);
  const mostConsistentDay = analytics.completionTrend.reduce(
    (bestDay, currentDay) => (currentDay.value > bestDay.value ? currentDay : bestDay),
    { label: "No data yet", value: 0 }
  ).label;
  const currentStreak = habits.reduce(
    (highestStreak, habit) => Math.max(highestStreak, Number(habit.streakCurrent || 0)),
    0
  );
  const bestStreak = habits.reduce(
    (highestStreak, habit) => Math.max(highestStreak, Number(habit.streakBest || 0)),
    0
  );

  async function loadDashboardData() {
    if (!user?.uid) {
      setHabits([]);
      setArchivedHabits([]);
      setTotalCheckIns(0);
      setAnalytics({
        weeklyCheckIns: [],
        weeklyXp: [],
        completionTrend: [],
        sectionProgress: [],
      });
      setLoadingHabits(false);
      return;
    }

    try {
      setPageError("");
      setLoadingHabits(true);
      const [savedHabits, savedArchivedHabits, savedCheckInCount, savedAnalytics] = await Promise.all([
        getHabitsForUser(user.uid),
        getHabitsForUser(user.uid, { includeArchived: true }),
        getTotalCheckInCountForUser(user.uid),
        getDashboardAnalytics(user.uid),
      ]);
      setHabits(savedHabits);
      setArchivedHabits(savedArchivedHabits.filter((habit) => habit.archived));
      setTotalCheckIns(savedCheckInCount);
      setAnalytics(savedAnalytics);
    } catch (error) {
      setPageError(error.message || "Could not load habits.");
    } finally {
      setLoadingHabits(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [user?.uid]);

  useEffect(() => {
    if (!isFormOpen || !habitFormRef.current) {
      return;
    }

    habitFormRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isFormOpen, selectedHabit?.id]);

  function openCreateForm() {
    setSelectedHabit(null);
    setIsFormOpen(true);
  }

  function openEditForm(habit) {
    setSelectedHabit(habit);
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedHabit(null);
    setIsFormOpen(false);
  }

  async function handleSaveHabit(formValues) {
    if (!user?.uid) {
      return;
    }

    try {
      setPageError("");
      setIsSavingHabit(true);

      if (selectedHabit?.id) {
        await updateHabit(user.uid, selectedHabit.id, formValues);
      } else {
        await createHabit(user.uid, formValues);
      }

      await loadDashboardData();
      closeForm();
    } catch (error) {
      setPageError(
        error.message ||
          (selectedHabit?.id ? "Could not update the habit." : "Could not create the habit.")
      );
    } finally {
      setIsSavingHabit(false);
    }
  }

  async function handleArchiveHabit(habit) {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(`Archive "${habit.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setPageError("");
      await archiveHabit(user.uid, habit.id);
      await loadDashboardData();
    } catch (error) {
      setPageError(error.message || "Could not archive the habit.");
    }
  }

  async function handleRestoreHabit(habit) {
    if (!user?.uid) {
      return;
    }

    try {
      setPageError("");
      await restoreHabit(user.uid, habit.id);
      await loadDashboardData();
    } catch (error) {
      setPageError(error.message || "Could not restore the habit.");
    }
  }

  async function handleDeleteHabit(habit) {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${habit.title}" permanently? This is mainly for removing accidental habits.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPageError("");
      await deleteHabit(user.uid, habit.id);
      setCheckInFeedbackByHabit((currentValues) => {
        const nextValues = { ...currentValues };
        delete nextValues[habit.id];
        return nextValues;
      });
      await loadDashboardData();
    } catch (error) {
      setPageError(error.message || "Could not delete the habit.");
    }
  }

  async function handleCheckIn(habit) {
    if (!user?.uid) {
      return;
    }

    try {
      setPageError("");
      setCheckingInHabitId(habit.id);

      const result = await completeHabitCheckIn(user.uid, habit.id);
      await loadDashboardData();

      setCheckInFeedbackByHabit((currentValues) => ({
        ...currentValues,
        [habit.id]:
          result.status === "already-completed"
            ? "Target already reached for today."
            : result.updatedHabit.isCompletedToday
              ? `Daily target complete. +${result.xpAwarded} XP`
              : `Progress saved. ${result.updatedHabit.todayCompletionCount}/${result.updatedHabit.frequencyTarget} today, +${result.xpAwarded} XP`,
      }));

      await refreshUserProfile();
    } catch (error) {
      setPageError(error.message || "Could not complete the check-in.");
    } finally {
      setCheckingInHabitId("");
    }
  }

  return (
    <section className="page-section dashboard-shell">
      <SectionHeader
        eyebrow="Dashboard"
        title={`Welcome, ${displayName}`}
        description="This is your home base for habits, streaks, check-ins, and momentum."
        action={
          <button type="button" onClick={openCreateForm}>
            Create Habit
          </button>
        }
      />

      <div className="dashboard-grid">
        <XPBar value={totalXp} label="Total XP" />

        <section className="card dashboard-note">
          <p className="eyebrow">Tip of the day</p>
          <h3>{dailyTip.title}</h3>
          <p>{dailyTip.description}</p>
        </section>
      </div>

      <section className="card dashboard-stats-card">
        <SectionHeader
          eyebrow="Stats"
          title="Summary"
          description="A quick snapshot of how your routine is building up."
        />

        <div className="dashboard-stats-grid dashboard-stats-grid-wide">
          <div className="dashboard-stat-item">
            <p className="eyebrow">Total habits</p>
            <h3>{habits.length}</h3>
          </div>
          <div className="dashboard-stat-item">
            <p className="eyebrow">🔥 Current streak</p>
            <h3>{currentStreak}</h3>
          </div>
          <div className="dashboard-stat-item">
            <p className="eyebrow">🏆 Best streak</p>
            <h3>{bestStreak}</h3>
          </div>
          <div className="dashboard-stat-item">
            <p className="eyebrow">⚡ Total check-ins</p>
            <h3>{totalCheckIns}</h3>
          </div>
        </div>
      </section>

      <section className="analytics-layout">
        <div className="analytics-column">
          {loadingHabits ? (
            <>
              <section className="card analytics-card analytics-card-compact">
                <StatusCard
                  title="Loading weekly check-ins"
                  message="Your recent activity chart is being prepared."
                />
              </section>
              <section className="card analytics-card analytics-card-compact">
                <StatusCard title="Loading XP trend" message="Your XP trend is being prepared." />
              </section>
            </>
          ) : (
            <>
              <AnalyticsLineChart
                eyebrow="Analytics"
                title="Check-ins this week"
                description="See how often you showed up over the last 7 days."
                data={analytics.weeklyCheckIns}
                emptyTitle="No check-ins this week"
                emptyDescription="Your weekly graph will start filling in after your first check-in."
                compact
              />
              <AnalyticsBarChart
                eyebrow="XP trend"
                title="XP earned this week"
                description={`Most consistent day: ${mostConsistentDay}`}
                data={analytics.weeklyXp}
                emptyTitle="No XP earned yet"
                emptyDescription="XP will start showing up here as you complete habits."
                valueSuffix=" XP"
                compact
              />
            </>
          )}
        </div>

        <div className="analytics-column">
          {loadingHabits ? (
            <>
              <section className="card analytics-card">
                <StatusCard
                  title="Loading section progress"
                  message="We are checking which sections are getting the most activity."
                />
              </section>
              <section className="card analytics-card analytics-card-compact">
                <StatusCard
                  title="Loading completion trend"
                  message="Your daily habit coverage is being prepared."
                />
              </section>
            </>
          ) : (
            <>
              <SectionProgressChart sections={analytics.sectionProgress} />
              <AnalyticsLineChart
                eyebrow="Completion trend"
                title="7-day completion trend"
                description="Habits completed each day."
                data={analytics.completionTrend}
                emptyTitle="No completion trend yet"
                emptyDescription="As you complete habits, this will show how full each day was."
                compact
              />
            </>
          )}
        </div>
      </section>

      <section className="stack">
        <SectionHeader
          eyebrow="Archived"
          title="Archived habits"
          description="Habits you have parked for later stay here until you restore them."
        />

        {loadingHabits ? (
          <StatusCard title="Loading archived habits" message="Archived habits are being loaded." />
        ) : archivedHabits.length === 0 ? (
          <p className="muted-text">No archived habits yet.</p>
        ) : (
          <div className="stack">
            {archivedHabits.map((habit) => (
              <article key={habit.id} className="card archived-habit-card">
                <div>
                  <p className="eyebrow">{habit.section || "General"}</p>
                  <h3>{habit.title}</h3>
                  <p>{habit.description || "No description added."}</p>
                </div>
                <div className="habit-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleRestoreHabit(habit)}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="secondary-button danger-button"
                    onClick={() => handleDeleteHabit(habit)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isFormOpen ? (
        <div ref={habitFormRef}>
          <HabitForm
            initialValues={selectedHabit || undefined}
            onSubmit={handleSaveHabit}
            onCancel={closeForm}
            isSubmitting={isSavingHabit}
          />
        </div>
      ) : null}

      <section className="stack">
        <SectionHeader
          eyebrow="Habits"
          title="Your habits"
          description="Everything you are actively working on lives here."
        />

        {pageError ? <p className="form-error status-banner">{pageError}</p> : null}

        {loadingHabits ? (
          <StatusCard title="Loading habits" message="Your habit list is being loaded." />
        ) : habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            description="You have not added any habits yet. Use the Create Habit button to get started later."
            action={
              <button type="button" onClick={openCreateForm}>
                Create your first habit
              </button>
            }
          />
        ) : (
          <div className="stack">
            {groupedHabits.map((habitGroup) => (
              <section key={habitGroup.sectionName} className="stack grouped-habits-section">
                <div className="grouped-habits-header">
                  <p className="eyebrow">Section</p>
                  <h3>{habitGroup.sectionName}</h3>
                </div>

                <div className="stack">
                  {habitGroup.habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onEdit={openEditForm}
                      onArchive={handleArchiveHabit}
                      onDelete={handleDeleteHabit}
                      onCheckIn={handleCheckIn}
                      isCheckingIn={checkingInHabitId === habit.id}
                      checkInFeedback={checkInFeedbackByHabit[habit.id] || ""}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
