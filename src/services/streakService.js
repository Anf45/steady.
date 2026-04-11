import { getTodayDateString, isSameDay, isYesterday } from "../utils/dates";

export function getNextStreakState(habit, checkInDate = getTodayDateString()) {
  const currentStreak = Number(habit?.streakCurrent || 0);
  const bestStreak = Number(habit?.streakBest || 0);
  const lastCheckInDate = habit?.lastCheckInDate || "";

  // Rule 1:
  // If the user has never checked in before, the first check-in starts the streak at 1.
  if (!lastCheckInDate) {
    return {
      streakCurrent: 1,
      streakBest: Math.max(bestStreak, 1),
      lastCheckInDate: checkInDate,
    };
  }

  // Rule 2:
  // If the user already checked in today, we do not change the streak.
  if (isSameDay(lastCheckInDate, checkInDate)) {
    return {
      streakCurrent: currentStreak,
      streakBest: bestStreak,
      lastCheckInDate,
    };
  }

  // Rule 3:
  // If the previous check-in was yesterday, the streak continues and increases by 1.
  if (isYesterday(lastCheckInDate, checkInDate)) {
    const nextCurrentStreak = currentStreak + 1;

    return {
      streakCurrent: nextCurrentStreak,
      streakBest: Math.max(bestStreak, nextCurrentStreak),
      lastCheckInDate: checkInDate,
    };
  }

  // Rule 4:
  // If at least one day was missed, the streak starts over from 1.
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
