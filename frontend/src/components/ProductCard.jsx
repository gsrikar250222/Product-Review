export default function ProductCard({ product, matchConfidence }) {
  const confidenceLevel = matchConfidence >= 0.75 ? 'high' : 'medium';
  const confidencePercent = Math.round(matchConfidence * 100);

  return (
    <div className="report-header">
      <div className="product-image-container">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.3 }}>📦</span>
        )}
      </div>
      <div className="product-info">
        <h1>{product.name || 'Unknown Product'}</h1>
        <div className="product-meta">
          {product.brand && (
            <span className="meta-tag">🏷️ {product.brand}</span>
          )}
          {product.model_name && (
            <span className="meta-tag">📱 {product.model_name}</span>
          )}
          {product.category && (
            <span className="meta-tag">📁 {product.category}</span>
          )}
          <span className={`confidence-badge ${confidenceLevel}`}>
            {confidenceLevel === 'high' ? '✓' : '~'} {confidencePercent}% match
          </span>
        </div>
        <span className="data-label">📡 Real product data</span>
      </div>
    </div>
  );
}
