export default function ConsensusGauge({ consensus }) {
  if (!consensus) return null;

  const labels = {
    strong_consensus: { text: 'Strong Consensus', class: 'strong', icon: '🟢', desc: 'Reviewers overwhelmingly agree on this product\'s qualities.' },
    moderate_consensus: { text: 'Moderate Consensus', class: 'moderate', icon: '🔵', desc: 'Most reviewers share similar opinions with some variation.' },
    mixed_opinions: { text: 'Mixed Opinions', class: 'mixed', icon: '🟡', desc: 'Reviewers have significantly different experiences with this product.' },
    insufficient_evidence: { text: 'Insufficient Evidence', class: 'insufficient', icon: '⚪', desc: 'Not enough review data to determine a reliable consensus.' },
  };

  const info = labels[consensus] || labels.insufficient_evidence;

  return (
    <div className="glass-card consensus-section">
      <div className="section-title">
        <span className="icon">📋</span> Customer Consensus
        <span className="ai-label">🤖 AI Analysis</span>
      </div>
      <div className={`consensus-badge ${info.class}`}>
        {info.icon} {info.text}
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {info.desc}
      </p>
    </div>
  );
}
