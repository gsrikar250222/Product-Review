import React, { useRef } from 'react';

export default function MobileBottomNav({ activeTab, onNavigate, onUploadImage }) {
  const fileInputRef = useRef(null);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
  };

  const navItems = [
    {
      id: 'Home',
      label: 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'Reviews',
      label: 'Reviews',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: 'Scan',
      label: 'Scan Product',
      isAction: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      id: 'Compare',
      label: 'Compare',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'Insights',
      label: 'Insights',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
      />
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                className="mobile-nav-action-btn"
                onClick={handleScanClick}
                aria-label="Scan Product"
              >
                <div className="mobile-action-icon-circle">
                  {item.icon}
                </div>
                <span className="mobile-action-label">{item.label}</span>
              </button>
            );
          }

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <div className="mobile-nav-icon">{item.icon}</div>
              <span className="mobile-nav-label">{item.label}</span>
              {isActive && <div className="mobile-nav-indicator" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
