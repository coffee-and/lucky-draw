import { useEffect, useState } from "react";
import CountdownOverlay from "../../components/CountdownOverlay/CountdownOverlay";
import ResultModal from "../../components/ResultModal/ResultModal";
import { initialRewards } from "../../data/rewards";
import type { Participant } from "../../types/participant";
import type { DrawResult, Reward } from "../../types/reward";
import { drawReward } from "../../utils/drawReward";
import { loadParticipants, saveParticipants } from "../../utils/storage";
import "./CustomerPage.css";

const normalizePhone = (phone: string) => {
  return phone.replaceAll("-", "").trim();
};

const isValidKoreanPhone = (phone: string) => {
  return /^010\d{8}$/.test(phone);
};

const CustomerPage = () => {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number | "DRAWING" | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);

  useEffect(() => {
    setParticipants(loadParticipants());
  }, []);

  useEffect(() => {
    saveParticipants(participants);
  }, [participants]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setIsAgreed(false);
  };

  const handleDraw = () => {
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhone(phone);

    if (!trimmedName || !normalizedPhone) {
      setMessage("이름과 휴대폰 번호를 입력해주세요.");
      return;
    }

    if (!isValidKoreanPhone(normalizedPhone)) {
      setMessage("휴대폰 번호는 01012345678 형식으로 입력해주세요.");
      return;
    }

    if (!isAgreed) {
      setMessage("개인정보 수집 및 이벤트 참여에 동의해주세요.");
      return;
    }

    const alreadyJoined = participants.some(
      (participant) => participant.phone === normalizedPhone,
    );

    if (alreadyJoined) {
      setMessage("이미 추첨에 참여한 휴대폰 번호입니다.");
      return;
    }

    setMessage("");
    setCountdown(3);

    window.setTimeout(() => setCountdown(2), 700);
    window.setTimeout(() => setCountdown(1), 1400);
    window.setTimeout(() => setCountdown("DRAWING"), 2100);

    window.setTimeout(() => {
      const result = drawReward(rewards);

      const nextParticipant: Participant = {
        id: crypto.randomUUID(),
        name: trimmedName,
        phone: normalizedPhone,
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

      setCountdown(null);
      setDrawResult(result);
      resetForm();
    }, 3000);
  };

  const handleCloseModal = () => {
    setDrawResult(null);
  };

  return (
    <main className="customer-page">
      <section className="draw-card">
        <span className="draw-card__badge">Lucky Event</span>

        <h1 className="draw-card__title">Lucky Draw</h1>

        <p className="draw-card__description">
          이름과 휴대폰 번호를 입력한 뒤,
          <br />
          화면을 터치해 오늘의 행운을 확인하세요.
        </p>

        <div className="draw-form">
          <label>
            이름
            <input
              type="text"
              placeholder="예: 홍길동"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            휴대폰 번호
            <input
              type="tel"
              placeholder="예: 01012345678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        </div>

        <label className="draw-agreement">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(event) => setIsAgreed(event.target.checked)}
          />
          <span>개인정보 수집 및 이벤트 참여에 동의합니다.</span>
        </label>

        <button
          className="draw-card__button"
          type="button"
          onClick={handleDraw}
          disabled={countdown !== null}
        >
          추첨하기
        </button>

        {message && <p className="draw-card__result">{message}</p>}
      </section>

      <section className="reward-board">
        <div className="reward-board__header">
          <p className="reward-board__eyebrow">Prize Status</p>
          <h2>남은 경품 현황</h2>
        </div>

        <div className="reward-list">
          {rewards.map((reward) => (
            <article className="reward-item" key={reward.id}>
              <div>
                <strong>{reward.rank}등</strong>
                <p>{reward.name}</p>
              </div>

              <span>
                {reward.remainingCount} / {reward.totalCount}
              </span>
            </article>
          ))}
        </div>
      </section>

      {countdown !== null && <CountdownOverlay count={countdown} />}

      {drawResult && (
        <ResultModal result={drawResult} onClose={handleCloseModal} />
      )}
    </main>
  );
};

export default CustomerPage;
