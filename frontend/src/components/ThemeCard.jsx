export default function ThemeCard({ themes, type }) {
  if (!themes || themes.length === 0) return null;

  const isPositive = type === 'positive';
  const icon = isPositive ? '✓' : '⚠';
  const title = isPositive ? 'What Customers Like' : 'Common Complaints';
  const emoji = isPositive ? '👍' : '👎';

  return (
    <div className="theme-section">
      <div className="section-title">
        <span className="icon">{emoji}</span> {title}
        <span className="ai-label">🤖 AI Analysis</span>
      </div>
      {themes.map((theme, i) => (
        <div
          key={i}
          className={`theme-card ${isPositive ? 'positive' : 'negative'}`}
        >
          <div className="theme-header">
            <span className="theme-title">
              {icon} {theme.theme || theme}
            </span>
            {theme.mention_count > 0 && (
              <span className="theme-count">
                {theme.mention_count} mentions
              </span>
            )}
          </div>
          {theme.evidence && theme.evidence.length > 0 && (
            <div className="theme-evidence">
              {theme.evidence[0]?.claim}
              {theme.evidence[0]?.supporting_review_ids?.length > 0 && (
                <span className="evidence-link" style={{ marginLeft: 8 }}>
                  📎 {theme.evidence[0].supporting_review_ids.length} reviews
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
