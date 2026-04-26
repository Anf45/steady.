import { getTodayDateString, isSameDay, isYesterday } from "../utils/dates";

export function getNextStreakState(habit, checkInDate = getTodayDateString()) {
  const currentStreak = Number(habit?.streakCurrent || 0);
  const bestStreak = Number(habit?.streakBest || 0);
  const lastCheckInDate = habit?.lastCheckInDate || "";

  // no last date means this is the streak starting point.
  if (!lastCheckInDate) {
    return {
      streakCurrent: 1,
      streakBest: Math.max(bestStreak, 1),
      lastCheckInDate: checkInDate,
    };
  }

  // same day check-ins should not inflate the streak.
  if (isSameDay(lastCheckInDate, checkInDate)) {
    return {
      streakCurrent: currentStreak,
      streakBest: bestStreak,
      lastCheckInDate,
    };
  }

  // yesterday means the streak is still alive, so we keep it rolling.
  if (isYesterday(lastCheckInDate, checkInDate)) {
    const nextCurrentStreak = currentStreak + 1;

    return {
      streakCurrent: nextCurrentStreak,
      streakBest: Math.max(bestStreak, nextCurrentStreak),
      lastCheckInDate: checkInDate,
    };
  }

  // anything older than yesterday counts as a reset.
  return {
    streakCurrent: 1,
    streakBest: Math.max(bestStreak, 1),
    lastCheckInDate: checkInDate,
  };
}

export function hasCheckedInToday(habit, todayDate = getTodayDateString()) {
  return isSameDay(habit?.lastCheckInDate, todayDate);
}

export function canExtendStreak(habit, todayDate = getTodayDateString()) {
  return isYesterday(habit?.lastCheckInDate, todayDate);
}
