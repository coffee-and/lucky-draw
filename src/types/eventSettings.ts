export type DrawMode = "roulette" | "cards";

export interface EventSettings {
  maxParticipants: number;
  drawMode: DrawMode;
}
