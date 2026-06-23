import { useEffect, useState } from "react";
import { initialRewards } from "../../data/rewards";
import type { EventSettings } from "../../types/eventSettings";
import type { Participant } from "../../types/participant";
import type { Reward } from "../../types/reward";
import {
  loadEventSettings,
  loadParticipants,
  loadRewards,
  saveEventSettings,
  saveParticipants,
  saveRewards,
} from "../../utils/storage";
import "./AdminPage.css";

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3");
};

const resetRewardsToTotalCount = (rewards: Reward[]) => {
  return rewards.map((reward) => ({
    ...reward,
    remainingCount: reward.totalCount,
  }));
};

const preserveRewardRemainingCounts = (
  draftRewards: Reward[],
  currentRewards: Reward[],
) => {
  return draftRewards.map((draftReward) => {
    const currentReward = currentRewards.find(
      (reward) => reward.id === draftReward.id,
    );

    if (!currentReward) {
      return {
        ...draftReward,
        remainingCount: draftReward.totalCount,
      };
    }

    const usedCount = Math.max(
      currentReward.totalCount - currentReward.remainingCount,
      0,
    );

    return {
      ...draftReward,
      remainingCount: Math.max(draftReward.totalCount - usedCount, 0),
    };
  });
};

const AdminPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    maxParticipants: 100,
    drawMode: "roulette",
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [draftSettings, setDraftSettings] = useState<EventSettings>({
    maxParticipants: 100,
    drawMode: "roulette",
  });
  const [draftRewards, setDraftRewards] = useState<Reward[]>([]);
  useEffect(() => {
    const loadedParticipants = loadParticipants();
    const loadedRewards = loadRewards(initialRewards);
    const loadedEventSettings = loadEventSettings();

    setParticipants(loadedParticipants);
    setRewards(loadedRewards);
    setEventSettings(loadedEventSettings);
  }, []);

  const winners = participants.filter(
    (participant) => participant.resultType === "win",
  );

  const losers = participants.filter(
    (participant) => participant.resultType === "lose",
  );

  const sortedParticipants = [...participants].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const winRate =
    participants.length === 0
      ? 0
      : ((winners.length / participants.length) * 100).toFixed(1);

  const remainingParticipantCount = Math.max(
    eventSettings.maxParticipants - participants.length,
    0,
  );

  const handleOpenSettings = () => {
    setDraftSettings(eventSettings);
    setDraftRewards(rewards);
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleDraftRewardChange = (
    rewardId: number,
    field: "name" | "totalCount",
    value: string,
  ) => {
    setDraftRewards((prevRewards) =>
      prevRewards.map((reward) => {
        if (reward.id !== rewardId) return reward;

        if (field === "name") {
          return {
            ...reward,
            name: value,
          };
        }

        return {
          ...reward,
          totalCount: Math.max(Number(value), 0),
        };
      }),
    );
  };

  const handleSaveSettings = () => {
    const normalizedRewards = preserveRewardRemainingCounts(
      draftRewards,
      rewards,
    );

    setEventSettings(draftSettings);
    setRewards(normalizedRewards);

    saveEventSettings(draftSettings);
    saveRewards(normalizedRewards);

    setIsSettingsOpen(false);
  };

  const handleResetParticipants = () => {
    const confirmed = window.confirm(
      "참여 내역만 초기화하시겠습니까? 이벤트 설정과 경품 설정은 유지됩니다.",
    );

    if (!confirmed) return;

    const resetRewards = resetRewardsToTotalCount(rewards);

    setParticipants([]);
    setRewards(resetRewards);

    saveParticipants([]);
    saveRewards(resetRewards);
  };

  const handleExportCsv = () => {
    const header = ["이름", "휴대폰번호", "결과", "경품", "참여시간"];

    const rows = sortedParticipants.map((participant) => [
      participant.name,
      participant.phone,
      participant.resultType === "win" ? "당첨" : "꽝",
      participant.rewardName ?? "-",
      new Date(participant.createdAt).toLocaleString("ko-KR"),
    ]);

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "lucky-draw-participants.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p>Admin Dashboard</p>
          <h1>럭키드로우 운영 현황</h1>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            className="admin-settings-button"
            onClick={handleOpenSettings}
          >
            설정 변경
          </button>

          <button
            type="button"
            className="admin-export-button"
            onClick={handleExportCsv}
          >
            CSV 다운로드
          </button>

          <button
            type="button"
            className="admin-reset-button"
            onClick={handleResetParticipants}
          >
            참여내역 초기화
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article>
          <span>총 참여자</span>
          <strong>{participants.length}</strong>
        </article>

        <article>
          <span>총 당첨자</span>
          <strong>{winners.length}</strong>
        </article>

        <article>
          <span>꽝 참여자</span>
          <strong>{losers.length}</strong>
        </article>

        <article>
          <span>당첨률</span>
          <strong>{winRate}%</strong>
        </article>
      </section>

      <section className="event-summary-card">
        <h2>이벤트 설정</h2>

        <div className="event-summary-list">
          <span>최대 참여 인원 {eventSettings.maxParticipants}명</span>
          <span>현재 참여자 {participants.length}명</span>
          <span>남은 참여 가능 인원 {remainingParticipantCount}명</span>
        </div>
      </section>

      <section className="admin-grid">
        <section className="winner-card">
          <div className="winner-card__header">
            <h2>최근 당첨자</h2>
          </div>

          <div className="winner-list">
            {winners
              .slice()
              .reverse()
              .slice(0, 5)
              .map((winner) => (
                <article key={winner.id} className="winner-item">
                  <div>
                    <strong>{winner.name}</strong>
                    <p>{winner.rewardRank}등</p>
                  </div>

                  <span>{winner.rewardName}</span>
                </article>
              ))}

            {winners.length === 0 && <p>아직 당첨자가 없습니다.</p>}
          </div>
        </section>

        <section className="prize-card">
          <h2>경품 현황</h2>

          <div className="prize-list">
            {rewards.map((reward) => (
              <div key={reward.id} className="prize-item">
                <div>
                  <strong>{reward.rank}등</strong>
                  <p>{reward.name}</p>
                </div>

                <span>
                  {reward.remainingCount} / {reward.totalCount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-card__header">
          <h2>참여 내역</h2>
          <p>휴대폰 번호는 개인정보 보호를 위해 일부 마스킹 처리됩니다.</p>
        </div>

        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>휴대폰 번호</th>
                <th>결과</th>
                <th>경품</th>
                <th>참여 시간</th>
              </tr>
            </thead>

            <tbody>
              {sortedParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td>{participant.name}</td>
                  <td>{maskPhone(participant.phone)}</td>
                  <td>{participant.resultType === "win" ? "당첨" : "꽝"}</td>
                  <td>
                    {participant.rewardRank
                      ? `${participant.rewardRank}등 ${participant.rewardName}`
                      : "-"}
                  </td>
                  <td>
                    {new Date(participant.createdAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}

              {participants.length === 0 && (
                <tr>
                  <td colSpan={5}>아직 참여 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isSettingsOpen && (
        <div className="settings-modal">
          <section className="settings-modal__card">
            <div className="settings-modal__header">
              <div>
                <p>Event Settings</p>
                <h2>설정 변경</h2>
              </div>

              <button type="button" onClick={handleCloseSettings}>
                닫기
              </button>
            </div>

            <label className="settings-field">
              최대 참여 인원
              <input
                type="number"
                min="1"
                value={draftSettings.maxParticipants}
                onChange={(event) =>
                  setDraftSettings({
                    ...draftSettings,
                    maxParticipants: Math.max(Number(event.target.value), 1),
                  })
                }
              />
            </label>

            <div className="settings-field">
              추첨 방식
              <div className="draw-mode-options">
                <label>
                  <input
                    type="radio"
                    name="drawMode"
                    checked={draftSettings.drawMode === "roulette"}
                    onChange={() =>
                      setDraftSettings({
                        ...draftSettings,
                        drawMode: "roulette",
                      })
                    }
                  />
                  룰렛
                </label>

                <label>
                  <input
                    type="radio"
                    name="drawMode"
                    checked={draftSettings.drawMode === "cards"}
                    onChange={() =>
                      setDraftSettings({
                        ...draftSettings,
                        drawMode: "cards",
                      })
                    }
                  />
                  카드
                </label>
              </div>
            </div>

            <div className="settings-reward-table-wrap">
              <table className="settings-reward-table">
                <thead>
                  <tr>
                    <th>등수</th>
                    <th>경품명</th>
                    <th>총 수량</th>
                  </tr>
                </thead>

                <tbody>
                  {draftRewards.map((reward) => (
                    <tr key={reward.id}>
                      <td>{reward.rank}등</td>

                      <td>
                        <input
                          type="text"
                          value={reward.name}
                          onChange={(event) =>
                            handleDraftRewardChange(
                              reward.id,
                              "name",
                              event.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          value={reward.totalCount}
                          onChange={(event) =>
                            handleDraftRewardChange(
                              reward.id,
                              "totalCount",
                              event.target.value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="settings-modal__actions">
              <button type="button" onClick={handleCloseSettings}>
                취소
              </button>

              <button type="button" onClick={handleSaveSettings}>
                저장
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminPage;
