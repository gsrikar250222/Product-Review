export default function RatingDisplay({ rating, reviewCount }) {
  if (!rating && !reviewCount) return null;

  const fullStars = Math.floor(rating || 0);
  const hasHalf = (rating || 0) - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return n.toLocaleString();
  };

  return (
    <div className="glass-card">
      <div className="section-title">
        <span className="icon">⭐</span> Customer Rating
        <span className="data-label">📡 Real data</span>
      </div>
      <div className="rating-big">
        <span className="rating-number">{rating?.toFixed(1) || '—'}</span>
        <div>
          <div className="rating-stars">
            {Array(fullStars).fill(0).map((_, i) => (
              <span key={`f${i}`} className="star">★</span>
            ))}
            {hasHalf && <span className="star half">★</span>}
            {Array(Math.max(0, emptyStars)).fill(0).map((_, i) => (
              <span key={`e${i}`} className="star empty">★</span>
            ))}
          </div>
          <span className="rating-count">
            {formatCount(reviewCount)} reviews
          </span>
        </div>
      </div>
    </div>
  );
}
