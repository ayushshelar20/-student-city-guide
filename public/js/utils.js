/**
 * Utility Functions — Shared helpers used across the application
 */

// ─── API Base URL ────────────────────────────────────────
const API_BASE = '/api';

/**
 * Haversine distance calculation (km) between two coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format distance for display
 */
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format price for display
 */
function formatPrice(price) {
  if (!price || price === 0) return 'Free / Variable';
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Render star rating HTML
 */
function renderStars(rating, size = 'sm') {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += `<span class="star star-${size} filled">★</span>`;
  if (half) html += `<span class="star star-${size} half">★</span>`;
  for (let i = 0; i < empty; i++) html += `<span class="star star-${size} empty">★</span>`;
  return html;
}

/**
 * Debounce function — delays execution until after wait ms of inactivity
 */
function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Get auth token from localStorage
 */
function getToken() {
  return localStorage.getItem('scg_token');
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
  const user = localStorage.getItem('scg_user');
  return user ? JSON.parse(user) : null;
}

/**
 * Authenticated fetch wrapper
 */
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('scg_token');
    localStorage.removeItem('scg_user');
  }
  return res.json();
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Category metadata — icons, colors, labels
 */
const CATEGORIES = {
  accommodation: { icon: '🏠', color: '#a855f7', label: 'Accommodation', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
  food: { icon: '🍽️', color: '#f97316', label: 'Food & Mess', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  services: { icon: '🛠️', color: '#22c55e', label: 'Services', gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  explore: { icon: '🎉', color: '#06b6d4', label: 'Explore', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
};

const SUBCATEGORIES = {
  pg: 'PG', hostel: 'Hostel', shared_flat: 'Shared Flat',
  mess: 'Mess', tiffin: 'Tiffin Service',
  laundry: 'Laundry', medical: 'Medical', stationery: 'Stationery', internet: 'Internet',
  cafe: 'Café', park: 'Park', mall: 'Mall', tourist: 'Tourist Spot'
};

/**
 * Parse JSON string safely (for facilities, image_urls)
 */
function safeParseJSON(str) {
  try { return JSON.parse(str); } catch { return []; }
}
