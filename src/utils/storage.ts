import type { EventSettings } from "../types/eventSettings";
import type { Participant } from "../types/participant";
import type { Reward } from "../types/reward";

const PARTICIPANTS_KEY = "lucky-draw-participants";
const REWARDS_KEY = "lucky-draw-rewards";
const EVENT_SETTINGS_KEY = "lucky-draw-event-settings";

const DEFAULT_EVENT_SETTINGS: EventSettings = {
  maxParticipants: 100,
  drawMode: "roulette",
};

export const loadParticipants = (): Participant[] => {
  const data = localStorage.getItem(PARTICIPANTS_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data) as Participant[];
  } catch {
    return [];
  }
};

export const saveParticipants = (participants: Participant[]) => {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
};

export const loadRewards = (initialRewards: Reward[]): Reward[] => {
  const data = localStorage.getItem(REWARDS_KEY);

  if (!data) return initialRewards;

  try {
    return JSON.parse(data) as Reward[];
  } catch {
    return initialRewards;
  }
};

export const saveRewards = (rewards: Reward[]) => {
  localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
};

export const loadEventSettings = (): EventSettings => {
  const data = localStorage.getItem(EVENT_SETTINGS_KEY);

  if (!data) return DEFAULT_EVENT_SETTINGS;

  try {
    const parsedSettings = JSON.parse(data) as Partial<EventSettings>;

    return {
      maxParticipants:
        parsedSettings.maxParticipants ??
        DEFAULT_EVENT_SETTINGS.maxParticipants,
      drawMode: parsedSettings.drawMode ?? DEFAULT_EVENT_SETTINGS.drawMode,
    };
  } catch {
    return DEFAULT_EVENT_SETTINGS;
  }
};

export const saveEventSettings = (settings: EventSettings) => {
  localStorage.setItem(EVENT_SETTINGS_KEY, JSON.stringify(settings));
};
