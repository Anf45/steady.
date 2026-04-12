import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore, requireFirebaseSetup } from "./firebase/config";

function buildUserProfileFields({ displayName, email }) {
  return {
    displayName,
    email,
    xpTotal: 0,
    earnedBadges: [],
    createdAt: serverTimestamp(),
  };
}

export async function createUserProfile(userId, { displayName, email }) {
  requireFirebaseSetup();

  await setDoc(doc(firestore, "users", userId), buildUserProfileFields({ displayName, email }));
}

export async function ensureUserProfile(userId, { displayName, email }) {
  requireFirebaseSetup();

  const userReference = doc(firestore, "users", userId);
  const documentSnapshot = await getDoc(userReference);

  if (!documentSnapshot.exists()) {
    await setDoc(userReference, buildUserProfileFields({ displayName, email }));
  }
}

export async function getUserProfile(userId) {
  requireFirebaseSetup();

  const documentSnapshot = await getDoc(doc(firestore, "users", userId));

  if (!documentSnapshot.exists()) {
    throw new Error("User profile not found.");
  }

  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

export async function resetUserProgress(userId) {
  requireFirebaseSetup();

  const habitsCollection = collection(firestore, "users", userId, "habits");
  const habitsSnapshot = await getDocs(habitsCollection);

  await Promise.all(
    habitsSnapshot.docs.map(async (habitSnapshot) => {
      const checkInsSnapshot = await getDocs(collection(habitSnapshot.ref, "checkIns"));

      await Promise.all(checkInsSnapshot.docs.map((checkInSnapshot) => deleteDoc(checkInSnapshot.ref)));
    })
  );

  await Promise.all(habitsSnapshot.docs.map((habitSnapshot) => deleteDoc(habitSnapshot.ref)));

  await updateDoc(doc(firestore, "users", userId), {
    xpTotal: 0,
    earnedBadges: [],
  });
}
