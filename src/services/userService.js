import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
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
