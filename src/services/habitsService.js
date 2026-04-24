import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getTodayDateString } from "../utils/dates";
import { getHabitDifficulty, getHabitTargetCount, normalizeHabitSection } from "../utils/habits";
import { awardBadge, BADGES } from "./badgeService";
import { firestore, requireFirebaseSetup } from "./firebase/config";

const defaultHabitValues = {
  streakCurrent: 0,
  streakBest: 0,
  lastCheckInDate: "",
  archived: false,
};

function getHabitsCollection(userId) {
  requireFirebaseSetup();
  return collection(firestore, "users", userId, "habits");
}

function getCheckInReference(userId, habitId, dateString = getTodayDateString()) {
  return doc(firestore, "users", userId, "habits", habitId, "checkIns", dateString);
}

function getCompletionCountFromCheckInSnapshot(documentSnapshot) {
  if (!documentSnapshot.exists()) {
    return 0;
  }

  return Math.max(0, Number(documentSnapshot.data().completionCount || 1));
}

export function mapHabitDocument(documentSnapshot) {
  const habitData = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    ...habitData,
    createdAt: habitData.createdAt?.toDate ? habitData.createdAt.toDate() : habitData.createdAt,
  };
}

async function attachTodayProgress(userId, habit) {
  const checkInSnapshot = await getDoc(getCheckInReference(userId, habit.id));
  const todayCompletionCount = getCompletionCountFromCheckInSnapshot(checkInSnapshot);

  return {
    ...habit,
    todayCompletionCount,
    isCompletedToday: todayCompletionCount >= getHabitTargetCount(habit),
  };
}

function getValidatedHabitTitle(habitData) {
  const title = habitData.title?.trim();

  if (!title) {
    throw new Error("Habit title is required.");
  }

  return title;
}

function buildHabitFields(habitData) {
  return {
    title: getValidatedHabitTitle(habitData),
    description: habitData.description?.trim() || "",
    section: normalizeHabitSection(habitData.section),
    frequencyType: habitData.frequencyType,
    frequencyTarget: Number(habitData.frequencyTarget),
    difficulty: getHabitDifficulty(habitData),
  };
}

export async function createHabit(userId, habitData) {
  requireFirebaseSetup();

  const habitsCollection = getHabitsCollection(userId);
  const existingHabitsSnapshot = await getDocs(habitsCollection);
  const newHabit = {
    ...buildHabitFields(habitData),
    createdAt: serverTimestamp(),
    ...defaultHabitValues,
  };

  const documentReference = await addDoc(habitsCollection, newHabit);
  const createdHabit = await getHabitById(userId, documentReference.id);
  await awardBadge(userId, BADGES.firstHabit.id);

  if (existingHabitsSnapshot.size + 1 >= 3) {
    await awardBadge(userId, BADGES.threeHabits.id);
  }

  return createdHabit;
}

export async function updateHabit(userId, habitId, habitData) {
  requireFirebaseSetup();

  const habitReference = doc(firestore, "users", userId, "habits", habitId);

  await updateDoc(habitReference, buildHabitFields(habitData));

  return getHabitById(userId, habitId);
}

export async function archiveHabit(userId, habitId) {
  requireFirebaseSetup();

  const habitReference = doc(firestore, "users", userId, "habits", habitId);

  await updateDoc(habitReference, {
    archived: true,
  });
}

export async function restoreHabit(userId, habitId) {
  requireFirebaseSetup();

  const habitReference = doc(firestore, "users", userId, "habits", habitId);

  await updateDoc(habitReference, {
    archived: false,
  });

  return getHabitById(userId, habitId);
}

export async function deleteHabit(userId, habitId) {
  requireFirebaseSetup();

  const habitReference = doc(firestore, "users", userId, "habits", habitId);
  const checkInsSnapshot = await getDocs(collection(habitReference, "checkIns"));

  await Promise.all(checkInsSnapshot.docs.map((documentSnapshot) => deleteDoc(documentSnapshot.ref)));
  await deleteDoc(habitReference);
}

export async function getHabitsForUser(userId, options = {}) {
  requireFirebaseSetup();

  const { includeArchived = false } = options;
  const habitsCollection = getHabitsCollection(userId);
  const habitsQuery = query(habitsCollection, orderBy("createdAt", "desc"));

  const querySnapshot = await getDocs(habitsQuery);
  const habits = querySnapshot.docs.map(mapHabitDocument);
  const visibleHabits = includeArchived ? habits : habits.filter((habit) => !habit.archived);

  return Promise.all(visibleHabits.map((habit) => attachTodayProgress(userId, habit)));
}

export async function getHabitById(userId, habitId) {
  requireFirebaseSetup();

  const habitReference = doc(firestore, "users", userId, "habits", habitId);
  const documentSnapshot = await getDoc(habitReference);

  if (!documentSnapshot.exists()) {
    throw new Error("Habit not found.");
  }

  return attachTodayProgress(userId, mapHabitDocument(documentSnapshot));
}
