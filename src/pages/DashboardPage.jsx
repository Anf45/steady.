import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionHeader } from "../components/common/SectionHeader";
import { StatusCard } from "../components/common/StatusCard";
import { XPBar } from "../components/dashboard/XPBar";
import { HabitCard } from "../components/habits/HabitCard";
import { HabitForm } from "../components/habits/HabitForm";
import { useAuth } from "../hooks/useAuth";
import {
  archiveHabit,
  completeHabitCheckIn,
  createHabit,
  deleteHabit,
  getHabitsForUser,
  updateHabit,
} from "../services";

export function DashboardPage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isSavingHabit, setIsSavingHabit] = useState(false);
  const [checkingInHabitId, setCheckingInHabitId] = useState("");
  const [checkInFeedbackByHabit, setCheckInFeedbackByHabit] = useState({});
  const displayName = user?.displayName || "friend";
  const totalXp = userProfile?.xpTotal || 0;

  useEffect(() => {
    async function loadHabits() {
      if (!user?.uid) {
        setHabits([]);
        setLoadingHabits(false);
        return;
      }

      try {
        setPageError("");
        setLoadingHabits(true);
        const savedHabits = await getHabitsForUser(user.uid);
        setHabits(savedHabits);
      } catch (error) {
        setPageError(error.message || "Could not load habits.");
      } finally {
        setLoadingHabits(false);
      }
    }

    loadHabits();
  }, [user?.uid]);

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
        const updatedHabit = await updateHabit(user.uid, selectedHabit.id, formValues);
        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
        );
      } else {
        const createdHabit = await createHabit(user.uid, formValues);
        setHabits((currentHabits) => [createdHabit, ...currentHabits]);
      }

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
      setHabits((currentHabits) => currentHabits.filter((item) => item.id !== habit.id));
    } catch (error) {
      setPageError(error.message || "Could not archive the habit.");
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
      setHabits((currentHabits) => currentHabits.filter((item) => item.id !== habit.id));
      setCheckInFeedbackByHabit((currentValues) => {
        const nextValues = { ...currentValues };
        delete nextValues[habit.id];
        return nextValues;
      });
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

      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit.id === habit.id ? result.updatedHabit : currentHabit
        )
      );

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
        description="This is your main dashboard. You will be able to see your habits and progress here."
        action={
          <button type="button" onClick={openCreateForm}>
            Create Habit
          </button>
        }
      />

      <div className="dashboard-grid">
        <XPBar value={totalXp} label="Total XP" />

        <section className="card dashboard-note">
          <p className="eyebrow">Quick note</p>
          <h3>Start small</h3>
          <p>Create your first habit when you are ready. New habits will appear in the list below.</p>
        </section>
      </div>

      {isFormOpen ? (
        <HabitForm
          initialValues={selectedHabit || undefined}
          onSubmit={handleSaveHabit}
          onCancel={closeForm}
          isSubmitting={isSavingHabit}
        />
      ) : null}

      <section className="stack">
        <SectionHeader
          eyebrow="Habits"
          title="Your habits"
          description="This section will list all of the habits connected to your account."
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
            {habits.map((habit) => (
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
        )}
      </section>
    </section>
  );
}
