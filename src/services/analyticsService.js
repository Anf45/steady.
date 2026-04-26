import { collection, getDocs } from "firebase/firestore";
import { formatDateLabel, getRecentDateStrings } from "../utils/dates";
import { normalizeHabitSection } from "../utils/habits";
import { firestore, requireFirebaseSetup } from "./firebase/config";

function createEmptyDailyTotals() {
  const dateStrings = getRecentDateStrings(7);
  const totalsByDate = new Map(
    dateStrings.map((dateString) => [
      dateString,
      {
        date: dateString,
        label: formatDateLabel(dateString),
        checkIns: 0,
        xp: 0,
        activeHabits: 0,
      },
    ])
  );

  return {
    dateStrings,
    totalsByDate,
  };
}

export async function getDashboardAnalytics(userId) {
  requireFirebaseSetup();

  const habitsSnapshot = await getDocs(collection(firestore, "users", userId, "habits"));
  const { dateStrings, totalsByDate } = createEmptyDailyTotals();
  const sectionTotals = new Map();

  await Promise.all(
    habitsSnapshot.docs.map(async (habitSnapshot) => {
      const habitData = habitSnapshot.data();
      const sectionName = normalizeHabitSection(habitData.section);
      const checkInsSnapshot = await getDocs(collection(habitSnapshot.ref, "checkIns"));

      let sectionCheckIns = 0;
      let sectionXp = 0;

      checkInsSnapshot.docs.forEach((checkInSnapshot) => {
        const checkInData = checkInSnapshot.data();
        const completionCount = Number(checkInData.completionCount || 1);
        const xpAwarded = Number(checkInData.xpAwarded || 0);

        sectionCheckIns += completionCount;
        sectionXp += xpAwarded;

        if (totalsByDate.has(checkInSnapshot.id)) {
          const currentDayTotals = totalsByDate.get(checkInSnapshot.id);
          currentDayTotals.checkIns += completionCount;
          currentDayTotals.xp += xpAwarded;

          // this one is for the "how many different habits got touched today" view.
          currentDayTotals.activeHabits += 1;
        }
      });

      // section totals mostly exist for the "where are you most active" card.
      const currentSectionTotals = sectionTotals.get(sectionName) || {
        label: sectionName,
        checkIns: 0,
        xp: 0,
        habits: 0,
      };

      currentSectionTotals.checkIns += sectionCheckIns;
      currentSectionTotals.xp += sectionXp;
      currentSectionTotals.habits += 1;
      sectionTotals.set(sectionName, currentSectionTotals);
    })
  );

  return {
    weeklyCheckIns: dateStrings.map((dateString) => ({
      label: totalsByDate.get(dateString).label,
      value: totalsByDate.get(dateString).checkIns,
    })),
    weeklyXp: dateStrings.map((dateString) => ({
      label: totalsByDate.get(dateString).label,
      value: totalsByDate.get(dateString).xp,
    })),
    completionTrend: dateStrings.map((dateString) => ({
      label: totalsByDate.get(dateString).label,
      value: totalsByDate.get(dateString).activeHabits,
    })),
    sectionProgress: Array.from(sectionTotals.values())
      .sort((firstSection, secondSection) => secondSection.checkIns - firstSection.checkIns)
      .slice(0, 6),
  };
}
