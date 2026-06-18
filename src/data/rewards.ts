import type { Reward } from "../types/reward";

export const initialRewards: Reward[] = [
  {
    id: 1,
    rank: 1,
    name: "백화점 상품권 50,000원",
    totalCount: 1,
    remainingCount: 1,
    probability: 1,
  },
  {
    id: 2,
    rank: 2,
    name: "브랜드 굿즈 세트",
    totalCount: 2,
    remainingCount: 2,
    probability: 3,
  },
  {
    id: 3,
    rank: 3,
    name: "아메리카노 쿠폰",
    totalCount: 3,
    remainingCount: 3,
    probability: 6,
  },
  {
    id: 4,
    rank: 4,
    name: "10% 할인 쿠폰",
    totalCount: 10,
    remainingCount: 10,
    probability: 20,
  },
  {
    id: 5,
    rank: 5,
    name: "포인트 1,000점",
    totalCount: 20,
    remainingCount: 20,
    probability: 30,
  },
];
