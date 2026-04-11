import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { firestore, requireFirebaseSetup } from "./firebase/config";

export const BADGES = {
  firstHabit: {
    id: "first-habit",
    title: "First Habit",
    description: "Created the first habit.",
  },
  firstCheckIn: {
    id: "first-check-in",
    title: "First Check-In",
    description: "Completed the first daily check-in.",
  },
  threeDayStreak: {
    id: "three-day-streak",
    title: "3-Day Streak",
    description: "Reached a streak of 3 days.",
  },
};

export function getBadgeDefinitions() {
  return Object.values(BADGES);
}

export function getEarnedBadgeDetails(earnedBadgeIds = []) {
  return earnedBadgeIds
    .map((badgeId) => getBadgeDefinitions().find((badge) => badge.id === badgeId))
    .filter(Boolean);
}

export async function awardBadge(userId, badgeId) {
  requireFirebaseSetup();

  await setDoc(doc(firestore, "users", userId), {
    earnedBadges: arrayUnion(badgeId),
  }, { merge: true });
}
