/**
 * API utility — all communication with the FastAPI backend.
 * API keys are NEVER stored or sent from the frontend.
 */

const API_BASE = 'http://localhost:8000/api/v1';

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/products/analyze-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getProduct(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
}

export async function getProductReviews(productId, source = null) {
  let url = `${API_BASE}/products/${productId}/reviews`;
  if (source) url += `?source=${encodeURIComponent(source)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
}

export async function analyzeReviews(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/analyze-reviews`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to analyze reviews');
  return response.json();
}

export async function getProductPrices(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/prices`);
  if (!response.ok) throw new Error('Failed to fetch prices');
  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
