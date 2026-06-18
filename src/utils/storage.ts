import type { Participant } from "../types/participant";

const PARTICIPANTS_KEY = "lucky-draw-participants";

export const loadParticipants = (): Participant[] => {
  const data = localStorage.getItem(PARTICIPANTS_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Participant[];
  } catch {
    return [];
  }
};

export const saveParticipants = (participants: Participant[]) => {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
};
