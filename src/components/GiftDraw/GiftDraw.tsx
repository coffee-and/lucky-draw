import { useState } from "react";
import "./GiftDraw.css";

interface GiftDrawProps {
  onDraw: () => void;
  disabled: boolean;
  isReady: boolean;
}

const GiftDraw = ({ onDraw, disabled, isReady }: GiftDrawProps) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (!isReady || disabled || isShaking) return;

    setIsShaking(true);

    window.setTimeout(() => {
      setIsShaking(false);
      onDraw();
    }, 1400);
  };

  return (
    <div className="gift-draw">
      <button
        className={`gift-draw__button ${isShaking ? "is-shaking" : ""}`}
        type="button"
        onClick={handleClick}
        disabled={!isReady || disabled || isShaking}
        aria-label="선물상자 추첨 시작"
      >
        <span className="gift-draw__icon">🎁</span>
      </button>

      <p>
        {isShaking
          ? "선물상자를 여는 중이에요"
          : isReady
            ? "선물상자를 터치해 추첨을 시작하세요"
            : "참여 정보를 먼저 입력해주세요"}
      </p>
    </div>
  );
};

export default GiftDraw;
