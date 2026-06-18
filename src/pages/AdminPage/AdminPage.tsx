import { useEffect, useState } from "react";
import { initialRewards } from "../../data/rewards";
import type { Participant } from "../../types/participant";
import type { Reward } from "../../types/reward";
import { loadParticipants, loadRewards } from "../../utils/storage";
import "./AdminPage.css";

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3");
};

const AdminPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    setParticipants(loadParticipants());
    setRewards(loadRewards(initialRewards));
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

  return (
    <main className="admin-page">
      <header className="admin-header">
        <p>Admin Dashboard</p>
        <h1>럭키드로우 운영 현황</h1>
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
                <strong>{reward.rank}등</strong>
                <p>{reward.name}</p>
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
    </main>
  );
};

export default AdminPage;
