import { getBadgeDefinitions } from "./badgeService";
import { RANKS, XP_PER_LEVEL, getCurrentRank, getLevelFromXp, getXpForNextLevel } from "./levelService";

export function getNextUnlockSummary(xpTotal = 0, earnedBadgeIds = []) {
  const safeXpTotal = Math.max(0, Number(xpTotal || 0));
  const currentLevel = getLevelFromXp(safeXpTotal);
  const currentRank = getCurrentRank(safeXpTotal);
  const earnedBadgeSet = new Set(earnedBadgeIds);
  const nextLevelXp = getXpForNextLevel(safeXpTotal);
  const xpToNextLevel = Math.max(0, nextLevelXp - safeXpTotal);
  const nextRank = RANKS.find((rank) => currentLevel < rank.minLevel) || null;
  const nextBadge = getBadgeDefinitions().find((badge) => !earnedBadgeSet.has(badge.id)) || null;

  return {
    currentLevel,
    currentRank,
    nextLevel: {
      title: `Level ${currentLevel + 1}`,
      xpToUnlock: xpToNextLevel,
      description:
        xpToNextLevel === 1
          ? "1 XP to go before the next level."
          : `${xpToNextLevel} XP to go before the next level.`,
    },
    nextRank: nextRank
      ? {
          title: nextRank.title,
          xpToUnlock: Math.max(0, nextRank.minLevel * XP_PER_LEVEL - safeXpTotal),
          description: `Unlocks at Level ${nextRank.minLevel}.`,
        }
      : null,
    nextBadge: nextBadge
      ? {
          title: nextBadge.title,
          description: nextBadge.unlockHint,
        }
      : null,
  };
}
