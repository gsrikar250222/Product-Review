export default function PriceComparison({ prices }) {
  if (!prices || prices.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-title">
        <span className="icon">💰</span> Current Observed Prices
        <span className="data-label">📡 Real data</span>
      </div>
      <div className="price-grid">
        {prices.map((price, i) => (
          <div key={i} className="price-card">
            <div className="price-source">{price.source || 'Unknown'}</div>
            <div className="price-value">
              {price.price_display || (price.price ? `₹${price.price.toLocaleString()}` : '—')}
            </div>
            {price.in_stock !== null && price.in_stock !== undefined && (
              <div className={`price-stock ${price.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                {price.in_stock ? '● In Stock' : '○ Out of Stock'}
              </div>
            )}
            {price.retrieved_at && (
              <div className="price-time">
                Retrieved: {new Date(price.retrieved_at).toLocaleString()}
              </div>
            )}
            {price.source_url && (
              <a
                href={price.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, marginTop: 8, display: 'inline-block' }}
              >
                View →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
