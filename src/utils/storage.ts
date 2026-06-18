import type { EventSettings } from "../types/eventSettings";
import type { Participant } from "../types/participant";
import type { Reward } from "../types/reward";

const PARTICIPANTS_KEY = "lucky-draw-participants";
const REWARDS_KEY = "lucky-draw-rewards";
const EVENT_SETTINGS_KEY = "lucky-draw-event-settings";

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

  if (!data) {
    return {
      maxParticipants: 100,
    };
  }

  try {
    return JSON.parse(data) as EventSettings;
  } catch {
    return {
      maxParticipants: 100,
    };
  }
};

export const saveEventSettings = (settings: EventSettings) => {
  localStorage.setItem(EVENT_SETTINGS_KEY, JSON.stringify(settings));
};
