import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getTodayDateString } from "../utils/dates";
import { getHabitTargetCount } from "../utils/habits";
import { awardBadge, BADGES } from "./badgeService";
import { mapHabitDocument } from "./habitsService";
import { getNextStreakState } from "./streakService";
import { firestore, requireFirebaseSetup } from "./firebase/config";

const XP_PER_CHECK_IN = 10;

function getHabitReference(userId, habitId) {
  return doc(firestore, "users", userId, "habits", habitId);
}

function getCheckInReference(userId, habitId, dateString) {
  return doc(firestore, "users", userId, "habits", habitId, "checkIns", dateString);
}

function getCheckInsCollection(userId, habitId) {
  return collection(firestore, "users", userId, "habits", habitId, "checkIns");
}

function getUserReference(userId) {
  return doc(firestore, "users", userId);
}

export async function hasTodayCheckIn(userId, habitId, dateString = getTodayDateString()) {
  requireFirebaseSetup();

  const checkInReference = getCheckInReference(userId, habitId, dateString);
  const checkInSnapshot = await getDoc(checkInReference);

  return checkInSnapshot.exists() && Number(checkInSnapshot.data().completionCount || 1) > 0;
}

export async function createTodayCheckIn(userId, habitId, dateString = getTodayDateString()) {
  requireFirebaseSetup();

  const checkInReference = getCheckInReference(userId, habitId, dateString);

  await runTransaction(firestore, async (transaction) => {
    const existingCheckIn = await transaction.get(checkInReference);

    if (existingCheckIn.exists()) {
      throw new Error("Today's check-in already exists.");
    }

    transaction.set(checkInReference, {
      completedAt: serverTimestamp(),
      xpAwarded: XP_PER_CHECK_IN,
      completionCount: 1,
    });
  });
}

export async function completeHabitCheckIn(userId, habitId, dateString = getTodayDateString()) {
  requireFirebaseSetup();

  const userReference = getUserReference(userId);
  const habitReference = getHabitReference(userId, habitId);
  const checkInReference = getCheckInReference(userId, habitId, dateString);

  const result = await runTransaction(firestore, async (transaction) => {
    const [userSnapshot, habitSnapshot, checkInSnapshot] = await Promise.all([
      transaction.get(userReference),
      transaction.get(habitReference),
      transaction.get(checkInReference),
    ]);

    if (!userSnapshot.exists()) {
      throw new Error("User profile not found.");
    }

    if (!habitSnapshot.exists()) {
      throw new Error("Habit not found.");
    }

    const habitData = habitSnapshot.data();
    const targetCount = getHabitTargetCount(habitData);
    const currentCompletionCount = checkInSnapshot.exists()
      ? Number(checkInSnapshot.data().completionCount || 1)
      : 0;

    // A habit can be completed more than once in the same day until the target count is reached.
    if (currentCompletionCount >= targetCount) {
      if (habitData.lastCheckInDate !== dateString) {
        transaction.update(habitReference, {
          lastCheckInDate: dateString,
        });
      }

      return {
        status: "already-completed",
        xpAwarded: 0,
        updatedHabit: {
          ...mapHabitDocument(habitSnapshot),
          lastCheckInDate: dateString,
          todayCompletionCount: currentCompletionCount,
          isCompletedToday: true,
        },
        userXpTotal: Number(userSnapshot.data().xpTotal || 0),
      };
    }

    const isFirstCompletionToday = currentCompletionCount === 0;
    const nextStreakState = isFirstCompletionToday
      ? getNextStreakState(habitData, dateString)
      : {
          streakCurrent: Number(habitData.streakCurrent || 0),
          streakBest: Number(habitData.streakBest || 0),
          lastCheckInDate: dateString,
        };
    const currentXpTotal = Number(userSnapshot.data().xpTotal || 0);
    const nextXpTotal = currentXpTotal + XP_PER_CHECK_IN;
    const nextCompletionCount = currentCompletionCount + 1;

    transaction.set(checkInReference, {
      completedAt: serverTimestamp(),
      xpAwarded: nextCompletionCount * XP_PER_CHECK_IN,
      completionCount: nextCompletionCount,
    });

    transaction.update(habitReference, {
      streakCurrent: nextStreakState.streakCurrent,
      streakBest: nextStreakState.streakBest,
      lastCheckInDate: nextStreakState.lastCheckInDate,
    });

    transaction.update(userReference, {
      xpTotal: nextXpTotal,
    });

    return {
      status: "success",
      xpAwarded: XP_PER_CHECK_IN,
      userXpTotal: nextXpTotal,
      updatedHabit: {
        ...mapHabitDocument(habitSnapshot),
        ...nextStreakState,
        todayCompletionCount: nextCompletionCount,
        isCompletedToday: nextCompletionCount >= targetCount,
      },
    };
  });

  if (result.status === "success") {
    await awardBadge(userId, BADGES.firstCheckIn.id);

    if (result.userXpTotal >= 100) {
      await awardBadge(userId, BADGES.oneHundredXp.id);
    }

    const totalCheckInCount = await getTotalCheckInCountForUser(userId);

    if (totalCheckInCount >= 5) {
      await awardBadge(userId, BADGES.fiveCheckIns.id);
    }

    if (result.updatedHabit.streakCurrent >= 3) {
      await awardBadge(userId, BADGES.threeDayStreak.id);
    }
  }

  return result;
}

export async function getRecentCheckInsForHabit(userId, habitId, maxItems = 7) {
  requireFirebaseSetup();

  const checkInsQuery = query(
    getCheckInsCollection(userId, habitId),
    orderBy("__name__", "desc"),
    limit(maxItems)
  );
  const querySnapshot = await getDocs(checkInsQuery);

  return querySnapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
    completedAt: documentSnapshot.data().completedAt?.toDate
      ? documentSnapshot.data().completedAt.toDate()
      : documentSnapshot.data().completedAt,
    completionCount: Number(documentSnapshot.data().completionCount || 1),
  }));
}

export async function getTotalCheckInCountForUser(userId) {
  requireFirebaseSetup();

  const habitsSnapshot = await getDocs(collection(firestore, "users", userId, "habits"));
  const checkInCounts = await Promise.all(
    habitsSnapshot.docs.map(async (habitSnapshot) => {
      const checkInsSnapshot = await getDocs(collection(habitSnapshot.ref, "checkIns"));

      return checkInsSnapshot.docs.reduce((totalCount, checkInSnapshot) => {
        return totalCount + Number(checkInSnapshot.data().completionCount || 1);
      }, 0);
    })
  );

  return checkInCounts.reduce((totalCount, habitCount) => totalCount + habitCount, 0);
}

export async function getRecentCheckInsForUser(userId, maxItems = 5) {
  requireFirebaseSetup();

  const habitsSnapshot = await getDocs(collection(firestore, "users", userId, "habits"));
  const recentCheckInsByHabit = await Promise.all(
    habitsSnapshot.docs.map(async (habitSnapshot) => {
      const checkInsSnapshot = await getDocs(
        query(collection(habitSnapshot.ref, "checkIns"), orderBy("__name__", "desc"), limit(maxItems))
      );

      return checkInsSnapshot.docs.map((checkInSnapshot) => ({
        id: checkInSnapshot.id,
        habitId: habitSnapshot.id,
        habitTitle: habitSnapshot.data().title || "Habit",
        completionCount: Number(checkInSnapshot.data().completionCount || 1),
      }));
    })
  );

  return recentCheckInsByHabit
    .flat()
    .sort((firstCheckIn, secondCheckIn) => secondCheckIn.id.localeCompare(firstCheckIn.id))
    .slice(0, maxItems);
}
