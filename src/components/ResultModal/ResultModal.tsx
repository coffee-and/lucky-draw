import type { DrawResult } from "../../types/reward";
import "./ResultModal.css";

interface ResultModalProps {
  result: DrawResult;
  onClose: () => void;
}

const ResultModal = ({ result, onClose }: ResultModalProps) => {
  const isWin = result.type === "win";
  const reward = result.reward;

  return (
    <div className="result-modal">
      <div className={`result-modal__card ${isWin ? "is-win" : "is-lose"}`}>
        <span className="result-modal__icon">{isWin ? "🎁" : "😭"}</span>

        <p className="result-modal__eyebrow">
          {isWin ? "Lucky Winner" : "Try Again"}
        </p>

        <h2>{isWin && reward ? `${reward.rank}등 당첨!` : "다음 기회에!"}</h2>

        <p className="result-modal__prize">
          {isWin && reward ? reward.name : "다음 기회에 다시 도전해주세요."}
        </p>

        {isWin && <p className="result-modal__message">축하합니다 🎉</p>}

        <button type="button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default ResultModal;
