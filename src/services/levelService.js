import { awardBadge } from "./badgeService";

export const XP_PER_LEVEL = 100;

export const RANKS = [
  {
    id: "amateur",
    title: "Amateur",
    minLevel: 1,
    badgeId: "amateur-title",
  },
  {
    id: "pro",
    title: "Pro",
    minLevel: 3,
    badgeId: "pro-title",
  },
  {
    id: "master",
    title: "Master",
    minLevel: 5,
    badgeId: "master-title",
  },
];

export function getLevelFromXp(xpTotal = 0) {
  // every 100 xp is a level, so this stays nice and predictable.
  return Math.floor(Math.max(0, Number(xpTotal || 0)) / XP_PER_LEVEL);
}

export function getCurrentRank(xpTotal = 0) {
  const level = getLevelFromXp(xpTotal);
  const unlockedRanks = RANKS.filter((rank) => level >= rank.minLevel);

  return (
    unlockedRanks[unlockedRanks.length - 1] || {
      id: "unranked",
      title: "No title yet",
      minLevel: 0,
      badgeId: "",
    }
  );
}

export function getXpProgressInLevel(xpTotal = 0) {
  return Math.max(0, Number(xpTotal || 0)) % XP_PER_LEVEL;
}

export function getXpForNextLevel(xpTotal = 0) {
  return (getLevelFromXp(xpTotal) + 1) * XP_PER_LEVEL;
}

export async function syncRankBadges(userId, xpTotal = 0, earnedBadgeIds = []) {
  const currentLevel = getLevelFromXp(xpTotal);
  const earnedBadgeSet = new Set(earnedBadgeIds);
  let addedBadge = false;

  for (const rank of RANKS) {
    if (currentLevel >= rank.minLevel && !earnedBadgeSet.has(rank.badgeId)) {
      await awardBadge(userId, rank.badgeId);
      addedBadge = true;
    }
  }

  return addedBadge;
}
