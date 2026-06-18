export interface Reward {
  id: number;
  rank: number;
  name: string;
  totalCount: number;
  remainingCount: number;
  probability: number;
}

export interface DrawResult {
  type: "win" | "lose";
  reward?: Reward;
}
