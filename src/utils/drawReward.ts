import type { DrawResult, Reward } from "../types/reward";

const LOSE_PROBABILITY = 40;

export const drawReward = (rewards: Reward[]): DrawResult => {
  const availableRewards = rewards.filter(
    (reward) => reward.remainingCount > 0,
  );

  const drawPool = [
    ...availableRewards.flatMap((reward) =>
      Array.from({ length: reward.probability }, () => reward),
    ),
    ...Array.from({ length: LOSE_PROBABILITY }, () => null),
  ];

  const randomIndex = Math.floor(Math.random() * drawPool.length);
  const selected = drawPool[randomIndex];

  if (!selected) {
    return {
      type: "lose",
    };
  }

  return {
    type: "win",
    reward: selected,
  };
};
