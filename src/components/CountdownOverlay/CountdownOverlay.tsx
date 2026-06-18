import "./CountdownOverlay.css";

interface CountdownOverlayProps {
  count: number | "DRAWING";
}

const CountdownOverlay = ({ count }: CountdownOverlayProps) => {
  return (
    <div className="countdown-overlay">
      <div className="countdown-overlay__content">
        <span>{count === "DRAWING" ? "🎉" : count}</span>
        <p>
          {count === "DRAWING" ? "추첨 중입니다..." : "잠시만 기다려주세요"}
        </p>
      </div>
    </div>
  );
};

export default CountdownOverlay;
