export default function SourceBadge({ source }) {
  const sourceClass = getSourceClass(source);
  return (
    <span className={`source-badge ${sourceClass}`}>
      {getSourceIcon(source)} {source}
    </span>
  );
}

function getSourceClass(source) {
  if (!source) return 'default';
  const s = source.toLowerCase();
  if (s.includes('amazon')) return 'amazon';
  if (s.includes('flipkart')) return 'flipkart';
  if (s.includes('google')) return 'google';
  return 'default';
}

function getSourceIcon(source) {
  if (!source) return '🔗';
  const s = source.toLowerCase();
  if (s.includes('amazon')) return '📦';
  if (s.includes('flipkart')) return '🛍️';
  if (s.includes('google')) return '🔍';
  return '🔗';
}
