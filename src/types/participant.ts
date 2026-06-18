export interface Participant {
  id: string;
  name: string;
  phone: string;
  resultType: "win" | "lose";
  rewardId?: number;
  rewardRank?: number;
  rewardName?: string;
  createdAt: string;
}
