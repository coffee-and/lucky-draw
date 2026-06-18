import { useMemo, useState } from "react";
import type { DrawResult, Reward } from "../../types/reward";
import "./RouletteDraw.css";

interface RouletteDrawProps {
  onDrawStart: () => {
    result: DrawResult;
    onComplete: () => void;
  } | null;
  disabled: boolean;
  rewards: Reward[];
  maxParticipants: number;
}

interface RouletteItem {
  key: string;
  rank?: number;
  label: string;
  color: string;
  weight: number;
}

const getRankColor = (rank: number) => {
  return `var(--rank-${rank})`;
};

const getTargetKey = (result: DrawResult) => {
  if (result.type === "lose") return "lose";
  return `rank-${result.reward?.rank}`;
};

const RouletteDraw = ({
  onDrawStart,
  disabled,
  rewards,
  maxParticipants,
}: RouletteDrawProps) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const { gradient, segments } = useMemo(() => {
    const prizeTotalCount = rewards.reduce(
      (sum, reward) => sum + reward.totalCount,
      0,
    );

    const rawLoseCount = Math.max(maxParticipants - prizeTotalCount, 0);
    const minSliceWeight = Math.max(maxParticipants * 0.04, 1);
    const maxLoseWeight = Math.max(maxParticipants * 0.25, minSliceWeight);

    const items: RouletteItem[] = [
      ...rewards.map((reward) => ({
        key: `rank-${reward.rank}`,
        rank: reward.rank,
        label: `${reward.rank}등`,
        color: getRankColor(reward.rank),
        weight: Math.max(reward.totalCount, minSliceWeight),
      })),
      {
        key: "lose",
        label: "꽝",
        color: "var(--rank-lose)",
        weight: Math.min(Math.max(rawLoseCount, minSliceWeight), maxLoseWeight),
      },
    ];

    let currentDegree = 0;

    const nextSegments = items.map((item) => {
      const angle =
        items.reduce((sum, current) => sum + current.weight, 0) === 0
          ? 360 / items.length
          : (item.weight /
              items.reduce((sum, current) => sum + current.weight, 0)) *
            360;

      const start = currentDegree;
      const end = currentDegree + angle;

      currentDegree = end;

      return {
        ...item,
        start,
        end,
        middle: start + angle / 2,
      };
    });

    const nextGradient = nextSegments
      .map((item) => `${item.color} ${item.start}deg ${item.end}deg`)
      .join(", ");

    return {
      gradient: nextGradient,
      segments: nextSegments,
    };
  }, [rewards, maxParticipants]);

  const handleSpin = () => {
    if (disabled || isSpinning) return;

    const draw = onDrawStart();
    if (!draw) return;

    const targetKey = getTargetKey(draw.result);
    const targetSegment = segments.find((segment) => segment.key === targetKey);

    if (!targetSegment) return;

    const normalizeDegree = (degree: number) => {
      return ((degree % 360) + 360) % 360;
    };

    const targetDegree = targetSegment.middle;
    const extraRounds = 5 * 360;

    const currentRotation = normalizeDegree(rotation);
    const targetFinalRotation = normalizeDegree(-targetDegree);
    const spinAmount = normalizeDegree(targetFinalRotation - currentRotation);

    const nextRotation = rotation + extraRounds + spinAmount;

    setIsSpinning(true);
    setRotation(nextRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      draw.onComplete();
    }, 3200);
  };

  return (
    <div className="roulette-draw">
      <div className="roulette-draw__pointer" />

      <button
        className="roulette-draw__wheel"
        type="button"
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        style={{
          background: `conic-gradient(${gradient})`,
          transform: `rotate(${rotation}deg)`,
        }}
        aria-label="룰렛 추첨 시작"
      ></button>

      <p>
        {isSpinning
          ? "룰렛이 돌아가는 중이에요"
          : "룰렛을 터치해 추첨을 시작하세요"}
      </p>
    </div>
  );
};

export default RouletteDraw;
