export function getHabitTargetCount(habit) {
  return Math.max(1, Number(habit?.frequencyTarget || 1));
}

export function normalizeHabitSection(sectionName) {
  const trimmedSection = sectionName?.trim();
  return trimmedSection || "General";
}

export function formatHabitFrequency(habit) {
  if (!habit) {
    return "";
  }

  const frequencyUnit = habit.frequencyType === "weekly" ? "time(s) each week" : "time(s) each day";
  return `${getHabitTargetCount(habit)} ${frequencyUnit}`;
}

export function getHabitProgressSummary(habit) {
  if (!habit) {
    return {
      completedCount: 0,
      targetCount: 1,
      isTargetComplete: false,
      label: "",
    };
  }

  const completedCount = Number(habit?.todayCompletionCount || 0);
  const targetCount = getHabitTargetCount(habit);

  return {
    completedCount,
    targetCount,
    isTargetComplete: completedCount >= targetCount,
    label: `${completedCount} / ${targetCount} completed today`,
  };
}

export function groupHabitsBySection(habits = []) {
  const groupedHabits = new Map();

  habits.forEach((habit) => {
    const sectionName = normalizeHabitSection(habit.section);

    if (!groupedHabits.has(sectionName)) {
      groupedHabits.set(sectionName, []);
    }

    groupedHabits.get(sectionName).push(habit);
  });

  return Array.from(groupedHabits.entries()).map(([sectionName, sectionHabits]) => ({
    sectionName,
    habits: sectionHabits,
  }));
}
