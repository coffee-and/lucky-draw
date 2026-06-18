import { useEffect, useState } from "react";
import GiftDraw from "../../components/GiftDraw/GiftDraw";
import CountdownOverlay from "../../components/CountdownOverlay/CountdownOverlay";
import ResultModal from "../../components/ResultModal/ResultModal";
import RouletteDraw from "../../components/RouletteDraw/RouletteDraw";
import { initialRewards } from "../../data/rewards";
import type { EventSettings } from "../../types/eventSettings";
import type { Participant } from "../../types/participant";
import type { DrawResult, Reward } from "../../types/reward";
import { drawReward } from "../../utils/drawReward";
import {
  loadEventSettings,
  loadParticipants,
  loadRewards,
  saveParticipants,
  saveRewards,
} from "../../utils/storage";
import "./CustomerPage.css";

const normalizePhone = (phone: string) => {
  return phone.replaceAll("-", "").trim();
};

const isValidKoreanPhone = (phone: string) => {
  return /^010\d{8}$/.test(phone);
};

const CustomerPage = () => {
  const [rewards, setRewards] = useState<Reward[]>(() =>
    loadRewards(initialRewards),
  );
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    maxParticipants: 100,
    drawMode: "roulette",
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number | "DRAWING" | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [pendingResult, setPendingResult] = useState<DrawResult | null>(null);
  const isEventClosed = participants.length >= eventSettings.maxParticipants;
  const isReadyToDraw =
    name.trim() !== "" && isValidKoreanPhone(normalizePhone(phone)) && isAgreed;
    
  useEffect(() => {
    setParticipants(loadParticipants());
    setEventSettings(loadEventSettings());
  }, []);

  useEffect(() => {
    saveParticipants(participants);
  }, [participants]);

  useEffect(() => {
    saveRewards(rewards);
  }, [rewards]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setIsAgreed(false);
  };

  const validateDraw = () => {
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);

    if (participants.length >= eventSettings.maxParticipants) {
      setMessage("이벤트 참여 가능 인원이 마감되었습니다.");
      return null;
    }

    if (!trimmedName || !normalizedPhone) {
      setMessage("이름과 휴대폰 번호를 입력해주세요.");
      return null;
    }

    if (!isValidKoreanPhone(normalizedPhone)) {
      setMessage("휴대폰 번호는 01012345678 형식으로 입력해주세요.");
      return null;
    }

    if (!isAgreed) {
      setMessage("개인정보 수집 및 이벤트 참여에 동의해주세요.");
      return null;
    }

    const alreadyJoined = participants.some(
      (participant) => participant.phone === normalizedPhone,
    );

    if (alreadyJoined) {
      setMessage("이미 추첨에 참여한 휴대폰 번호입니다.");
      return null;
    }

    return {
      name: trimmedName,
      phone: normalizedPhone,
    };
  };

  const completeDraw = (
    result: DrawResult,
    participantInfo: {
      name: string;
      phone: string;
    },
  ) => {
    const nextParticipant: Participant = {
      id: crypto.randomUUID(),
      name: participantInfo.name,
      phone: participantInfo.phone,
      resultType: result.type,
      rewardId: result.reward?.id,
      rewardRank: result.reward?.rank,
      rewardName: result.reward?.name,
      createdAt: new Date().toISOString(),
    };

    setParticipants((prev) => [...prev, nextParticipant]);

    if (result.type === "win" && result.reward) {
      setRewards((prevRewards) =>
        prevRewards.map((item) =>
          item.id === result.reward?.id
            ? {
                ...item,
                remainingCount: item.remainingCount - 1,
              }
            : item,
        ),
      );
    }

    setPendingResult(null);
    setDrawResult(result);
    resetForm();
  };

  const handleCardDraw = () => {
    const participantInfo = validateDraw();

    if (!participantInfo) return;

    setMessage("");
    setCountdown(3);

    window.setTimeout(() => setCountdown(2), 700);
    window.setTimeout(() => setCountdown(1), 1400);
    window.setTimeout(() => setCountdown("DRAWING"), 2100);

    window.setTimeout(() => {
      const result = drawReward(
        rewards,
        eventSettings.maxParticipants,
        participants.length,
      );

      setCountdown(null);
      completeDraw(result, participantInfo);
    }, 3000);
  };

  const handleRouletteStart = () => {
    const participantInfo = validateDraw();

    if (!participantInfo) return null;

    const result = drawReward(
      rewards,
      eventSettings.maxParticipants,
      participants.length,
    );

    setMessage("");
    setPendingResult(result);

    return {
      result,
      onComplete: () => completeDraw(result, participantInfo),
    };
  };

  const handleCloseModal = () => {
    setDrawResult(null);
  };

  return (
    <main className="customer-page">
      <header className="customer-page__hero">
        <div>
          <p>Lucky Event</p>
          <h1>Lucky Draw</h1>
          <span>오늘의 행운을 확인하세요</span>
        </div>
      </header>

      <div className="reward-chip-list">
        {rewards.map((reward) => (
          <span
            className={`reward-chip reward-chip--${reward.rank}`}
            key={reward.id}
          >
            <strong>{reward.rank}등</strong>
            <em>{reward.name}</em>
          </span>
        ))}
      </div>

      <section className="kiosk-card">
        <div className="kiosk-card__draw">
          {eventSettings.drawMode === "roulette" ? (
            <RouletteDraw
              onDrawStart={handleRouletteStart}
              disabled={isEventClosed || pendingResult !== null}
              rewards={rewards}
              maxParticipants={eventSettings.maxParticipants}
            />
          ) : (
            <GiftDraw
              onDraw={handleCardDraw}
              disabled={isEventClosed || countdown !== null}
              isReady={isReadyToDraw}
            />
          )}
        </div>

        <aside className="kiosk-card__form">
          <p className="kiosk-card__eyebrow">Participant Info</p>
          <h2>참여 정보를 입력해주세요</h2>

          <div className="draw-form">
            <label>
              이름
              <input
                type="text"
                placeholder="예: 홍길동"
                value={name}
                disabled={isEventClosed}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              휴대폰 번호
              <input
                type="tel"
                placeholder="예: 01012345678"
                value={phone}
                disabled={isEventClosed}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>

          <label className="draw-agreement">
            <input
              type="checkbox"
              checked={isAgreed}
              disabled={isEventClosed}
              onChange={(event) => setIsAgreed(event.target.checked)}
            />
            <span>개인정보 수집 및 이벤트 참여에 동의합니다.</span>
          </label>

          {isEventClosed && (
            <p className="draw-card__result">
              이벤트 참여 가능 인원이 마감되었습니다.
            </p>
          )}

          {!isEventClosed && message && (
            <p className="draw-card__result">{message}</p>
          )}
        </aside>
      </section>

      {eventSettings.drawMode === "cards" && countdown !== null && (
        <CountdownOverlay count={countdown} />
      )}

      {drawResult && (
        <ResultModal result={drawResult} onClose={handleCloseModal} />
      )}
    </main>
  );
};

export default CustomerPage;
