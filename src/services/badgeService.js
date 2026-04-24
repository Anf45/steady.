import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { firestore, requireFirebaseSetup } from "./firebase/config";

export const BADGES = {
  firstHabit: {
    id: "first-habit",
    title: "First Habit",
    description: "Created the first habit.",
    unlockHint: "Create your first habit.",
    shape: "circle",
    color: "gold",
  },
  threeHabits: {
    id: "three-habits",
    title: "3 Habits",
    description: "Created 3 habits.",
    unlockHint: "Create 3 habits.",
    shape: "square",
    color: "blue",
  },
  firstCheckIn: {
    id: "first-check-in",
    title: "First Check-In",
    description: "Completed the first daily check-in.",
    unlockHint: "Complete your first check-in.",
    shape: "diamond",
    color: "green",
  },
  fiveCheckIns: {
    id: "five-check-ins",
    title: "5 Check-Ins",
    description: "Completed 5 total check-ins.",
    unlockHint: "Reach 5 total check-ins.",
    shape: "triangle",
    color: "orange",
  },
  threeDayStreak: {
    id: "three-day-streak",
    title: "3-Day Streak",
    description: "Reached a streak of 3 days.",
    unlockHint: "Reach a streak of 3 days.",
    shape: "hex",
    color: "red",
  },
  oneHundredXp: {
    id: "one-hundred-xp",
    title: "100 XP",
    description: "Reached 100 total XP.",
    unlockHint: "Reach 100 total XP.",
    shape: "pill",
    color: "purple",
  },
  amateurTitle: {
    id: "amateur-title",
    title: "Amateur",
    description: "Unlocked the Amateur title.",
    unlockHint: "Reach Level 1.",
    shape: "square",
    color: "green",
  },
  proTitle: {
    id: "pro-title",
    title: "Pro",
    description: "Unlocked the Pro title.",
    unlockHint: "Reach Level 3.",
    shape: "hex",
    color: "blue",
  },
  masterTitle: {
    id: "master-title",
    title: "Master",
    description: "Unlocked the Master title.",
    unlockHint: "Reach Level 5.",
    shape: "circle",
    color: "gold",
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

export function getBadgeProgressDetails(earnedBadgeIds = []) {
  const earnedBadgeSet = new Set(earnedBadgeIds);

  return getBadgeDefinitions().map((badge) => ({
    ...badge,
    isEarned: earnedBadgeSet.has(badge.id),
  }));
}

export async function awardBadge(userId, badgeId) {
  requireFirebaseSetup();

  await setDoc(doc(firestore, "users", userId), {
    earnedBadges: arrayUnion(badgeId),
  }, { merge: true });
}
