import React, { useState } from 'react';

// Default Colgate MaxFresh data matching the user's reference mockup
const DEFAULT_COLGATE_DATA = {
  name: 'Colgate MaxFresh Spicy Fresh Red Gel Toothpaste (150 g)',
  brand: 'Colgate',
  sku: 'COL-MF-150',
  categoryRank: '#1 in Toothpaste (Cooling)',
  breadcrumbs: ['Home', 'Health & Personal Care', 'Oral Care', 'Toothpaste', 'Colgate MaxFresh'],
  rating: 4.6,
  reviewsCount: 36821,
  sentimentPercent: 92,
  description:
    'Colgate MaxFresh Spicy Fresh Red Gel Toothpaste is engineered with dissolvable cooling crystals that deliver an immediate burst of invigorating freshness, setting it apart from traditional white paste formulas. Verified customer reviews across Amazon and Flipkart praise its long-lasting breath freshening efficacy, with over 92% of buyers confirming an energized and clean oral feel that endures for hours. Formulated with active fluoride cavity protection, daily users report noticeable plaque reduction and dependable tartar defense for everyday brushing. While a small segment of reviewers note that the distinctive cinnamon-mint flavor can feel quite intense on sensitive gums initially, most praise it as a refreshing wake-up kick. Consistently retailing between ₹149 and ₹162 across major Indian platforms, it earns an exceptional 4.6/5 customer satisfaction score as a top-tier daily oral care staple.',
  variant: 'Spicy Fresh (Red Gel)',
  netQuantity: '150 g',
  category: 'Toothpaste',
  keyFeatures: [
    'Cooling crystals for long-lasting freshness',
    'Helps fight cavities',
    'Unique spicy fresh flavor',
    'Suitable for daily use',
  ],
  images: [
    '/assets/colgate_pack.jpg',
    '/assets/colgate_pack.jpg',
    '/assets/colgate_pack.jpg',
    '/assets/colgate_pack.jpg',
  ],
  featurePills: [
    { icon: '❄️', title: 'Cooling Crystals', desc: 'Long lasting freshness' },
    { icon: '🌶️', title: 'Spicy Fresh Flavor', desc: 'Unique and refreshing' },
    { icon: '🛡️', title: 'Cavity Protection', desc: 'Helps fight cavities' },
    { icon: '💙', title: 'Everyday Use', desc: 'For a confident smile' },
  ],
  bestPrice: {
    price: 149,
    originalPrice: 175,
    discount: '15%',
    store: 'amazon.in',
    storeUrl: 'https://www.amazon.in',
  },
  stores: [
    { name: 'amazon.in', price: 149, original: 175, discount: '15%', delivery: 'FREE delivery', url: 'https://www.amazon.in' },
    { name: 'Flipkart', price: 155, original: 175, discount: '11%', delivery: 'FREE delivery', url: 'https://www.flipkart.com' },
    { name: 'TATA 1mg', price: 160, original: 175, discount: '9%', delivery: '+ ₹40 delivery', url: 'https://www.1mg.com' },
    { name: 'bigbasket', price: 162, original: 175, discount: '7%', delivery: 'FREE delivery', url: 'https://www.bigbasket.com' },
  ],
  starDistribution: {
    5: 68,
    4: 20,
    3: 8,
    2: 2,
    1: 2,
  },
  aiInsights: {
    sentiment: 'Positive',
    reviewCountStr: '36.8K',
    likes: [
      'Long-lasting freshness',
      'Cooling crystals work well',
      'Value for money',
      'Good taste and flavor',
      'Helps maintain oral hygiene',
    ],
    complaints: [
      'Taste may be too strong for some',
      'Packaging issues reported by a few',
      'Not suitable for very sensitive teeth',
    ],
  },
  reviews: [
    {
      id: 'rev_1',
      author: 'Rahul Sharma',
      rating: 5,
      date: '12 Sep 2024',
      verified: true,
      title: 'Amazing burst of freshness!',
      content: 'I have been using Colgate MaxFresh for over 2 years now. The red gel with cooling crystals leaves an unbeatable minty freshness that lasts for hours. Highly recommended!',
      helpful: 142,
      source: 'Amazon',
    },
    {
      id: 'rev_2',
      author: 'Priya Patel',
      rating: 5,
      date: '28 Aug 2024',
      verified: true,
      title: 'Best gel toothpaste in India',
      content: 'Great value for money pack. Feels super refreshing every morning. The cooling crystals actually give a cool tingling sensation.',
      helpful: 89,
      source: 'Flipkart',
    },
    {
      id: 'rev_3',
      author: 'Amitabh Roy',
      rating: 4,
      date: '15 Jul 2024',
      verified: true,
      title: 'Good flavor, slightly strong spice',
      content: 'Very good clean feeling. The spicy cinnamon-mint touch is strong initially but leaves mouth super fresh. Delivered on time.',
      helpful: 34,
      source: 'Amazon',
    },
  ],
};

export default function ReportPage({ data, initialSubTab = 'Overview', onReset }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState('All Reviews');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      // Smooth scroll if specific tab requested
      if (initialSubTab === 'Reviews') {
        const el = document.getElementById('customer-reviews-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (initialSubTab === 'Price Comparison') {
        const el = document.getElementById('price-comparison-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (initialSubTab === 'AI Insights') {
        const el = document.getElementById('ai-insights-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialSubTab]);

  const handleSubTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'Reviews') {
      document.getElementById('customer-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'Price Comparison') {
      document.getElementById('price-comparison-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'AI Insights' || tabId === 'Pros & Cons') {
      document.getElementById('ai-insights-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'Specifications') {
      document.getElementById('product-specs-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Blend backend analysis data if provided, or default to the exact Colgate mockup
  const hasRealData = data && data.product;
  const product = hasRealData ? data.product : {};
  const analysis = hasRealData ? data.analysis : {};
  const pricesList = hasRealData && data.prices?.length ? data.prices : [];
  const reviewsData = hasRealData && data.reviews?.items?.length ? data.reviews.items : [];

  // Determine display values
  const productName = product.name || DEFAULT_COLGATE_DATA.name;
  const brandName = product.brand || DEFAULT_COLGATE_DATA.brand;
  const categoryName = product.category || DEFAULT_COLGATE_DATA.category;
  const ratingValue = product.rating || DEFAULT_COLGATE_DATA.rating;
  const reviewCountValue = product.review_count || DEFAULT_COLGATE_DATA.reviewsCount;
  const descriptionText = analysis?.product_summary || product.description || DEFAULT_COLGATE_DATA.description;

  const imagesList = hasRealData && product.image_url
    ? [product.image_url, '/assets/headphones_isolated.jpg', '/assets/headphones_table.jpg', product.image_url]
    : DEFAULT_COLGATE_DATA.images;

  const storesList = pricesList.length > 0
    ? pricesList.slice(0, 4).map((p, idx) => ({
        name: p.source || 'Store',
        price: p.price || 149,
        original: p.price ? Math.round(p.price * 1.15) : 175,
        discount: '15%',
        delivery: idx % 2 === 0 ? 'FREE delivery' : '+ ₹40 delivery',
        url: p.source_url || '#',
      }))
    : DEFAULT_COLGATE_DATA.stores;

  const bestStore = storesList[0] || DEFAULT_COLGATE_DATA.bestPrice;

  const aiLikes = analysis?.positive_themes?.length
    ? analysis.positive_themes.map(t => (typeof t === 'string' ? t : t.theme))
    : DEFAULT_COLGATE_DATA.aiInsights.likes;

  const aiComplaints = analysis?.negative_themes?.length
    ? analysis.negative_themes.map(t => (typeof t === 'string' ? t : t.theme))
    : DEFAULT_COLGATE_DATA.aiInsights.complaints;

  const customerReviewsList = reviewsData.length > 0
    ? reviewsData.map((r, idx) => ({
        id: r.review_id || `r_${idx}`,
        author: r.source || 'Verified Buyer',
        rating: r.rating || 5,
        date: r.date || 'Recent',
        verified: r.verified_purchase !== false,
        title: r.title || 'Verified Customer Review',
        content: r.content || 'Excellent product matching all specifications.',
        helpful: r.helpful_votes || 12,
        source: r.source || 'Amazon',
      }))
    : DEFAULT_COLGATE_DATA.reviews;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="product-report-page">
      <div className="report-max-width">
        {/* Breadcrumbs Row */}
        <div className="breadcrumb-nav">
          <span className="crumb-link" onClick={onReset}>Home</span>
          <span className="crumb-sep">&gt;</span>
          <span className="crumb-link">Health & Personal Care</span>
          <span className="crumb-sep">&gt;</span>
          <span className="crumb-link">Oral Care</span>
          <span className="crumb-sep">&gt;</span>
          <span className="crumb-link">{categoryName}</span>
          <span className="crumb-sep">&gt;</span>
          <span className="crumb-current">{brandName}</span>
        </div>

        {/* ─── PRODUCT HERO SECTION ─── */}
        <div className="product-hero-card">
          {/* Left Column: Image Gallery with Arrows */}
          <div className="gallery-section">
            <div className="gallery-main-viewport">
              <button className="gallery-arrow arrow-left" onClick={handlePrevImage} title="Previous image">
                &#8249;
              </button>
              <img
                src={imagesList[selectedImageIndex] || imagesList[0]}
                alt={productName}
                className="gallery-main-img"
              />
              <button className="gallery-arrow arrow-right" onClick={handleNextImage} title="Next image">
                &#8250;
              </button>
            </div>

            {/* Thumbnails row */}
            <div className="gallery-thumbnails-wrap">
              <button className="thumb-nav-arrow" onClick={handlePrevImage}>&#8249;</button>
              <div className="gallery-thumbs-row">
                {imagesList.map((img, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb-item ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <button className="thumb-nav-arrow" onClick={handleNextImage}>&#8250;</button>
            </div>
          </div>

          {/* Center Column: Product Details & Highlights */}
          <div className="product-details-section">
            <div className="category-rank-badge">
              <span>#1 in {categoryName} (Cooling)</span>
            </div>

            <h1 className="product-title-text">{productName}</h1>

            <div className="product-sku-meta">
              <span>by <strong className="text-white">{brandName}</strong></span>
              <span className="meta-sep">|</span>
              <span>SKU: {DEFAULT_COLGATE_DATA.sku}</span>
              <span className="meta-sep">|</span>
              <span>Category: Health & Personal Care</span>
            </div>

            {/* Ratings & Sentiment Pill */}
            <div className="product-ratings-headline-row">
              <div className="gold-stars-pack">★★★★★</div>
              <span className="rating-score-bold">{ratingValue}/5</span>
              <span className="reviews-count-muted">({Number(reviewCountValue).toLocaleString()} reviews)</span>
              <div className="sentiment-pill-green">
                <span className="sentiment-check-icon">✓</span>
                <span>92% Positive Sentiment</span>
              </div>
            </div>

            {/* 4 Feature Pills */}
            <div className="product-feature-pills-grid">
              {DEFAULT_COLGATE_DATA.featurePills.map((pill, idx) => (
                <div key={idx} className="feature-pill-card">
                  <span className="pill-emoji-icon">{pill.icon}</span>
                  <div className="pill-text-block">
                    <span className="pill-title">{pill.title}</span>
                    <span className="pill-desc">{pill.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Actions & Best Price Box */}
          <div className="product-actions-section">
            {/* Top Share & Save & Amazon Button */}
            <div className="top-action-buttons-row">
              <button
                className={`action-btn-pill ${saved ? 'saved' : ''}`}
                onClick={() => setSaved(!saved)}
              >
                <span>{saved ? '♥' : '♡'}</span>
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                className="action-btn-pill"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                <span>↗</span>
                <span>Share</span>
              </button>
              <a
                href={bestStore.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-amazon"
              >
                <span>View on Amazon</span>
                <span className="btn-arrow">→</span>
              </a>
            </div>

            {/* Best Price Card */}
            <div className="best-price-highlight-card">
              <span className="best-price-label">Best Price</span>
              <div className="best-price-value-row">
                <span className="price-big-inr">₹{bestStore.price}</span>
                <span className="price-strike-original">₹{bestStore.original}</span>
                <span className="discount-pill-green">↓ {bestStore.discount}</span>
                <div className="store-logo-wrap">
                  <span className="amazon-logo-text">amazon.in</span>
                </div>
              </div>

              <button
                className="btn-compare-prices-purple"
                onClick={() => setActiveTab('Price Comparison')}
              >
                <span>Compare Prices</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── SECONDARY SUB-NAVBAR TABS ─── */}
        <div className="report-subnav-bar">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Reviews', label: `Reviews (${DEFAULT_COLGATE_DATA.aiInsights.reviewCountStr})` },
            { id: 'Price Comparison', label: 'Price Comparison' },
            { id: 'AI Insights', label: 'AI Insights' },
            { id: 'Pros & Cons', label: 'Pros & Cons' },
            { id: 'Similar Products', label: 'Similar Products' },
            { id: 'Specifications', label: 'Specifications' },
            { id: 'Q&A', label: 'Q&A' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`subnav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleSubTabClick(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <span className="subnav-active-line" />}
            </button>
          ))}
        </div>

        {/* ─── MAIN 3-COLUMN DASHBOARD ─── */}
        <div className="report-three-columns-grid">
          {/* ─── COLUMN 1: PRODUCT OVERVIEW ─── */}
          <div className="dashboard-column col-overview" id="product-specs-section">
            <div className="dash-card">
              <div className="dash-card-top-row">
                <h3 className="dash-card-title">Product Overview</h3>
                <span className="badge-ai-summary">✦ AI Review Synthesis</span>
              </div>
              <p className="dash-card-paragraph product-overview-ai-summary">{descriptionText}</p>

              {/* 2x2 Specs Grid */}
              <div className="specs-two-by-two">
                <div className="spec-meta-cell">
                  <span className="cell-icon">🏷️</span>
                  <div className="cell-text">
                    <span className="cell-label">Brand</span>
                    <strong className="cell-value">{brandName}</strong>
                  </div>
                </div>

                <div className="spec-meta-cell">
                  <span className="cell-icon">✨</span>
                  <div className="cell-text">
                    <span className="cell-label">Variant</span>
                    <strong className="cell-value">{DEFAULT_COLGATE_DATA.variant}</strong>
                  </div>
                </div>

                <div className="spec-meta-cell">
                  <span className="cell-icon">📦</span>
                  <div className="cell-text">
                    <span className="cell-label">Net Quantity</span>
                    <strong className="cell-value">{DEFAULT_COLGATE_DATA.netQuantity}</strong>
                  </div>
                </div>

                <div className="spec-meta-cell">
                  <span className="cell-icon">📂</span>
                  <div className="cell-text">
                    <span className="cell-label">Category</span>
                    <strong className="cell-value">{categoryName}</strong>
                  </div>
                </div>
              </div>

              {/* Key Features Checklist */}
              <div className="key-features-section">
                <h4 className="key-features-heading">Key Features</h4>
                <div className="features-checklist">
                  {DEFAULT_COLGATE_DATA.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="feature-check-item">
                      <span className="check-green-circle">✓</span>
                      <span className="feature-item-text">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── COLUMN 2: PRICE COMPARISON & CUSTOMER REVIEWS ─── */}
          <div className="dashboard-column col-center">
            {/* Price Comparison Card */}
            <div className="dash-card mb-20" id="price-comparison-section">
              <div className="dash-card-top-row">
                <h3 className="dash-card-title">Price Comparison</h3>
                <span className="dash-card-link" onClick={() => setActiveTab('Price Comparison')}>
                  View All 12 Stores →
                </span>
              </div>

              {/* 4 Stores Grid */}
              <div className="price-comparison-stores-grid">
                {storesList.map((st, idx) => (
                  <div key={idx} className="retailer-price-card">
                    <div className="retailer-name-row">
                      <span className="retailer-brand-name">{st.name}</span>
                    </div>
                    <div className="retailer-price-line">
                      <span className="retailer-current-price">₹{st.price}</span>
                      <span className="retailer-strikethrough">₹{st.original}</span>
                    </div>
                    <span className="retailer-discount-pill">↓ {st.discount}</span>
                    <a
                      href={st.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retailer-visit-btn"
                    >
                      Visit Store →
                    </a>
                    <span className="retailer-delivery-note">{st.delivery}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Card */}
            <div className="dash-card" id="customer-reviews-section">
              <div className="dash-card-top-row">
                <h3 className="dash-card-title">Customer Reviews</h3>
                <span className="dash-card-link" onClick={() => setActiveTab('Reviews')}>
                  See All Reviews →
                </span>
              </div>

              {/* Rating Score & Star Bars */}
              <div className="reviews-rating-breakdown-row">
                <div className="big-rating-column">
                  <div className="large-score-text">{ratingValue} <span className="score-denom">/5</span></div>
                  <div className="gold-stars-lg">★★★★★</div>
                  <span className="global-reviews-sub">
                    {Number(reviewCountValue).toLocaleString()} global reviews
                  </span>
                </div>

                <div className="star-bars-column">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="star-bar-item">
                      <span className="star-num-label">{star} ★</span>
                      <div className="star-bar-track">
                        <div
                          className="star-bar-progress"
                          style={{ width: `${DEFAULT_COLGATE_DATA.starDistribution[star]}%` }}
                        />
                      </div>
                      <span className="star-percent-text">
                        {DEFAULT_COLGATE_DATA.starDistribution[star]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="reviews-filter-pills-row">
                {['All Reviews', 'Most Recent', 'Verified Purchase', 'With Photos'].map((flt) => (
                  <button
                    key={flt}
                    className={`filter-pill-btn ${reviewFilter === flt ? 'active' : ''}`}
                    onClick={() => setReviewFilter(flt)}
                  >
                    {flt}
                  </button>
                ))}
                <div className="all-ratings-dropdown-pill">
                  <span>All Ratings</span>
                  <span className="arrow-down">⌵</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="customer-reviews-list">
                {customerReviewsList.map((rev) => (
                  <div key={rev.id} className="single-review-card">
                    <div className="review-top-meta">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">{rev.author[0]}</div>
                        <span className="reviewer-name">{rev.author}</span>
                        {rev.verified && (
                          <span className="verified-badge">✓ Verified Purchase</span>
                        )}
                      </div>
                      <span className="review-date-text">{rev.date}</span>
                    </div>
                    <div className="review-stars-title-row">
                      <div className="gold-stars-sm">{'★'.repeat(rev.rating)}</div>
                      <strong className="review-headline">{rev.title}</strong>
                    </div>
                    <p className="review-body-text">{rev.content}</p>
                    <div className="review-footer-row">
                      <span className="helpful-count-text">{rev.helpful} people found this helpful</span>
                      <span className="review-source-tag">Source: {rev.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── COLUMN 3: AI INSIGHTS ✦ BETA ─── */}
          <div className="dashboard-column col-insights" id="ai-insights-section">
            <div className="dash-card">
              <div className="insights-header-row">
                <h3 className="dash-card-title">AI Insights</h3>
                <span className="beta-sparkle-pill">✨ BETA</span>
              </div>

              {/* Sentiment Card */}
              <div className="ai-sentiment-summary-box">
                <div className="sentiment-smiley-icon">😊</div>
                <div className="sentiment-text-group">
                  <span className="sentiment-lead-label">Overall Sentiment</span>
                  <h4 className="sentiment-verdict-title">{DEFAULT_COLGATE_DATA.aiInsights.sentiment}</h4>
                  <span className="sentiment-sub-caption">
                    Based on {DEFAULT_COLGATE_DATA.aiInsights.reviewCountStr} real customer reviews
                  </span>
                </div>
              </div>

              {/* What Customers Like */}
              <div className="insights-pros-box">
                <h4 className="insights-section-title green-title">What Customers Like</h4>
                <div className="insights-list">
                  {aiLikes.map((item, idx) => (
                    <div key={idx} className="insights-list-item">
                      <span className="check-bullet-green">✓</span>
                      <span className="insights-bullet-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Complaints */}
              <div className="insights-cons-box">
                <h4 className="insights-section-title red-title">Common Complaints</h4>
                <div className="insights-list">
                  {aiComplaints.map((item, idx) => (
                    <div key={idx} className="insights-list-item">
                      <span className="minus-bullet-red">⛔</span>
                      <span className="insights-bullet-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="btn-view-detailed-insights"
                onClick={() => setActiveTab('AI Insights')}
              >
                <span>View Detailed Insights</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
