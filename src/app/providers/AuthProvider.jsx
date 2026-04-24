import { createContext, useEffect, useMemo, useState } from "react";
import {
  getReadableAuthError,
  loginWithEmail,
  logoutUser,
  registerWithEmail,
  subscribeToAuthChanges,
} from "../../services/firebase/auth";
import { getFirebaseConfigError, isFirebaseConfigured } from "../../services/firebase/config";
import { syncRankBadges } from "../../services/levelService";
import { ensureUserProfile, getUserProfile } from "../../services/userService";
import { getDefaultTeam } from "../../services/teamService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function loadUserProfile(nextUser) {
    await ensureUserProfile(nextUser.uid, {
      displayName: nextUser.displayName || "User",
      email: nextUser.email || "",
      team: getDefaultTeam(),
    });

    const profile = await getUserProfile(nextUser.uid);
    const didSyncRankBadges = await syncRankBadges(
      nextUser.uid,
      Number(profile.xpTotal || 0),
      profile.earnedBadges || []
    );
    const nextProfile = didSyncRankBadges ? await getUserProfile(nextUser.uid) : profile;

    setUserProfile(nextProfile);
    setAuthError(null);
    return nextProfile;
  }

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthError(getFirebaseConfigError());
      setLoading(false);
      return undefined;
    }

    let isCancelled = false;

    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      if (isCancelled) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        setUserProfile(null);
        setAuthError(null);
        setLoading(false);
        return;
      }

      try {
        await loadUserProfile(nextUser);
      } catch (error) {
        if (!isCancelled) {
          setAuthError(error.message || "Could not load the user profile.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  async function refreshUserProfile() {
    if (!user) {
      setUserProfile(null);
      return null;
    }

    return loadUserProfile(user);
  }

  async function signUp(formValues) {
    setAuthError(null);

    try {
      await registerWithEmail(formValues);
    } catch (error) {
      setAuthError(getReadableAuthError(error));
      throw error;
    }
  }

  async function logIn(formValues) {
    setAuthError(null);

    try {
      await loginWithEmail(formValues);
    } catch (error) {
      setAuthError(getReadableAuthError(error));
      throw error;
    }
  }

  async function logOut() {
    setAuthError(null);

    try {
      await logoutUser();
    } catch (error) {
      setAuthError(getReadableAuthError(error));
      throw error;
    }
  }

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      authError,
      isAuthenticated: Boolean(user),
      refreshUserProfile,
      signUp,
      logIn,
      logOut,
    }),
    [user, userProfile, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
