export default function SentimentChart({ sentimentDistribution }) {
  if (!sentimentDistribution) return null;

  const { positive = 0, neutral = 0, negative = 0 } = sentimentDistribution;
  const total = positive + neutral + negative || 1;

  // SVG donut chart
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const posPercent = positive / total;
  const neuPercent = neutral / total;
  const negPercent = negative / total;

  const posLength = circumference * posPercent;
  const neuLength = circumference * neuPercent;
  const negLength = circumference * negPercent;

  const posOffset = 0;
  const neuOffset = -posLength;
  const negOffset = -(posLength + neuLength);

  return (
    <div className="glass-card">
      <div className="section-title">
        <span className="icon">🎯</span> Sentiment Analysis
        <span className="ai-label">🤖 AI Analysis</span>
      </div>
      <div className="sentiment-container">
        <div className="sentiment-donut">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Positive */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeDasharray={`${posLength} ${circumference - posLength}`}
              strokeDashoffset={posOffset}
              strokeLinecap="round"
            />
            {/* Neutral */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="16"
              strokeDasharray={`${neuLength} ${circumference - neuLength}`}
              strokeDashoffset={neuOffset}
              strokeLinecap="round"
            />
            {/* Negative */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="16"
              strokeDasharray={`${negLength} ${circumference - negLength}`}
              strokeDashoffset={negOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="sentiment-center">
            <span className="value">{positive}%</span>
            <span className="label">Positive</span>
          </div>
        </div>
        <div className="sentiment-legend">
          <div className="legend-item">
            <span className="legend-dot positive"></span>
            <span>Positive — {positive}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot neutral"></span>
            <span>Neutral — {neutral}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot negative"></span>
            <span>Negative — {negative}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
