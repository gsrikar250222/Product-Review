export default function ConflictingOpinions({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: 32 }}>
      <div className="section-title">
        <span className="icon">⚖️</span> Conflicting Opinions
        <span className="ai-label">🤖 AI Analysis</span>
      </div>
      {conflicts.map((conflict, i) => (
        <div key={i} className="conflict-card">
          <div className="conflict-side positive-side">
            <strong style={{ color: 'var(--accent-green)', display: 'block', marginBottom: 4, fontSize: 12 }}>
              👍 Positive View
            </strong>
            {conflict.positive_view}
          </div>
          <div className="conflict-vs">VS</div>
          <div className="conflict-side negative-side">
            <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: 4, fontSize: 12 }}>
              👎 Negative View
            </strong>
            {conflict.negative_view}
          </div>
        </div>
      ))}
    </div>
  );
}
