import type { DrawResult, Reward } from "../types/reward";

export const drawReward = (
  rewards: Reward[],
  maxParticipants: number,
  currentParticipantCount: number,
): DrawResult => {
  const remainingParticipantCount = Math.max(
    maxParticipants - currentParticipantCount,
    0,
  );

  const availableRewards = rewards.filter(
    (reward) => reward.remainingCount > 0,
  );

  const remainingRewardCount = availableRewards.reduce(
    (sum, reward) => sum + reward.remainingCount,
    0,
  );

  const loseCount = Math.max(
    remainingParticipantCount - remainingRewardCount,
    0,
  );

  const drawPool = [
    ...availableRewards.flatMap((reward) =>
      Array.from({ length: reward.remainingCount }, () => reward),
    ),
    ...Array.from({ length: loseCount }, () => null),
  ];

  if (drawPool.length === 0) {
    return { type: "lose" };
  }

  const randomIndex = Math.floor(Math.random() * drawPool.length);
  const selected = drawPool[randomIndex];

  if (!selected) {
    return { type: "lose" };
  }

  return {
    type: "win",
    reward: selected,
  };
};
