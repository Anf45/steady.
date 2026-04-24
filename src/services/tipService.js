import { getTodayDateString } from "../utils/dates";

const DAILY_TIPS = [
  {
    title: "Start small",
    description: "Choose one habit you can finish easily today. Small wins are easier to repeat.",
  },
  {
    title: "Stack habits together",
    description: "Link a new habit to something you already do, like making tea or brushing your teeth.",
  },
  {
    title: "Keep it visible",
    description: "Place your habit where you can see it. Visual reminders make it easier to follow through.",
  },
  {
    title: "Miss once, not twice",
    description: "If you skip a habit today, aim to get back to it tomorrow so the break stays small.",
  },
  {
    title: "Make the first step easy",
    description: "Lower the barrier to begin. Starting is usually the hardest part of keeping a habit going.",
  },
  {
    title: "Use sections well",
    description: "Group habits into parts of your day so your dashboard feels more organized and easier to follow.",
  },
  {
    title: "Review your progress",
    description: "Take a quick look at your streaks and check-ins to spot what is going well this week.",
  },
];

export function getTipOfTheDay(dateString = getTodayDateString()) {
  const dayNumber = Number(dateString.replaceAll("-", ""));
  const tipIndex = dayNumber % DAILY_TIPS.length;

  return DAILY_TIPS[tipIndex];
}
