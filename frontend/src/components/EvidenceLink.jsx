export default function EvidenceLink({ evidence, onClickReview }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginBottom: 32 }}>
      <div className="section-title">
        <span className="icon">🔗</span> Evidence Trail
        <span className="ai-label">🤖 AI Analysis</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Every AI conclusion is backed by real customer reviews. Click to inspect the supporting evidence.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {evidence.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              {item.claim}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {item.supporting_review_ids?.map((rid, j) => (
                <span
                  key={j}
                  className="evidence-link"
                  onClick={() => onClickReview?.(rid)}
                  title={`View review: ${rid}`}
                >
                  📎 {rid}
                </span>
              ))}
              {item.supporting_excerpts?.map((excerpt, j) => (
                <span
                  key={`ex-${j}`}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  "{excerpt.substring(0, 80)}..."
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
