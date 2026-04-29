/**
 * App Module — Main controller, initializes everything on page load
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  // Initialize auth on all pages
  initAuth();

  if (page === 'home') {
    initHomePage();
  } else if (page === 'listing') {
    initListingPage();
  }
});

/**
 * Initialize the homepage — map, filters, listings
 */
async function initHomePage() {
  // Initialize map
  initMap();

  // Initialize filters
  initFilters();

  // Load initial listings
  await applyFilters();

  // When user location is ready, reload with distance
  window.addEventListener('userLocationReady', () => {
    applyFilters();
  });

  // Load recommendations sidebar
  loadRecommendations();

  // Mobile map toggle
  const mapToggle = document.getElementById('map-toggle');
  if (mapToggle) {
    mapToggle.addEventListener('click', () => {
      document.querySelector('.main-content')?.classList.toggle('map-visible');
      setTimeout(() => map?.invalidateSize(), 300);
    });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      document.querySelector('.filter-panel')?.classList.toggle('open');
    });
  }
}

/**
 * Load recommendations in the sidebar
 */
async function loadRecommendations() {
  const container = document.getElementById('recommendations');
  if (!container) return;

  const params = new URLSearchParams();
  if (userLocation) {
    params.set('lat', userLocation.lat);
    params.set('lng', userLocation.lng);
  }
  params.set('category', 'accommodation');

  const data = await apiFetch(`/listings/recommendations?${params.toString()}`);
  if (data.recommendations && data.recommendations.length > 0) {
    container.innerHTML = `
      <h3 class="rec-title">🎯 Recommended for You</h3>
      <div class="rec-list">
        ${data.recommendations.slice(0, 4).map(r => `
          <a href="/listing.html?id=${r.id}" class="rec-card">
            <div class="rec-icon" style="background:${CATEGORIES[r.category]?.gradient}">${CATEGORIES[r.category]?.icon}</div>
            <div class="rec-info">
              <strong>${r.name}</strong>
              <span>${r.price_label || formatPrice(r.price)} · ${renderStars(r.rating, 'xs')}</span>
            </div>
          </a>
        `).join('')}
      </div>`;
  }
}

/**
 * Initialize the listing detail page
 */
async function initListingPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = '/';
    return;
  }

  const data = await apiFetch(`/listings/${id}`);
  if (!data.listing) {
    document.getElementById('listing-detail').innerHTML = '<div class="empty-state"><h3>Listing not found</h3><a href="/" class="btn btn-primary">Go Home</a></div>';
    return;
  }

  renderListingDetail(data.listing, data.reviews);
}

/**
 * Render the full listing detail page
 */
function renderListingDetail(listing, reviews) {
  const images = safeParseJSON(listing.image_urls);
  const facilities = safeParseJSON(listing.facilities);
  const catMeta = CATEGORIES[listing.category] || {};
  const container = document.getElementById('listing-detail');

  let dist = '';
  if (userLocation) {
    const km = haversineDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude);
    dist = formatDistance(km);
  }

  container.innerHTML = `
    <div class="detail-header">
      <a href="/" class="back-link">← Back to listings</a>
      <div class="detail-badges">
        <span class="category-badge" style="background:${catMeta.color}">${SUBCATEGORIES[listing.subcategory] || listing.subcategory}</span>
        ${listing.is_featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
        ${listing.veg_nonveg ? `<span class="diet-badge ${listing.veg_nonveg}">${listing.veg_nonveg === 'veg' ? '🟢 Veg' : listing.veg_nonveg === 'nonveg' ? '🔴 Non-Veg' : '🟡 Both'}</span>` : ''}
      </div>
    </div>

    <div class="detail-gallery">
      ${images.map((img, i) => `<img src="${img}" alt="${listing.name} photo ${i + 1}" class="gallery-img ${i === 0 ? 'main' : ''}" onerror="this.src='https://picsum.photos/seed/d${listing.id}${i}/600/400'">`).join('')}
      ${images.length === 0 ? `<img src="https://picsum.photos/seed/det${listing.id}/800/400" alt="${listing.name}" class="gallery-img main">` : ''}
    </div>

    <div class="detail-content">
      <div class="detail-main">
        <h1 class="detail-title">${listing.name}</h1>
        <div class="detail-meta">
          <span class="detail-rating">${renderStars(listing.rating, 'md')} <strong>${listing.rating}</strong> (${listing.review_count} reviews)</span>
          ${dist ? `<span class="detail-distance">📍 ${dist} from you</span>` : ''}
        </div>
        <p class="detail-description">${listing.description}</p>

        ${facilities.length > 0 ? `
        <div class="detail-section">
          <h2>Facilities & Amenities</h2>
          <div class="facilities-grid">
            ${facilities.map(f => `<div class="facility-item"><span class="facility-icon">✓</span> ${f}</div>`).join('')}
          </div>
        </div>` : ''}

        <div class="detail-section" id="reviews-section"></div>
      </div>

      <div class="detail-sidebar">
        <div class="price-card glass-card">
          <div class="price-amount">${listing.price_label || formatPrice(listing.price)}</div>
          <button class="btn btn-primary btn-block fav-detail-btn" onclick="toggleFavoriteDetail(${listing.id}, this)">
            ${listing.is_favorite ? '❤️ Saved' : '🤍 Save to Favorites'}
          </button>
        </div>

        <div class="contact-card glass-card">
          <h3>Contact</h3>
          <p>📌 ${listing.address}</p>
          ${listing.contact_phone ? `<p>📞 <a href="tel:${listing.contact_phone}">${listing.contact_phone}</a></p>` : ''}
          ${listing.contact_email ? `<p>✉️ <a href="mailto:${listing.contact_email}">${listing.contact_email}</a></p>` : ''}
        </div>

        <div class="detail-map glass-card">
          <h3>Location</h3>
          <div id="detail-map-container"></div>
        </div>
      </div>
    </div>
  `;

  // Initialize detail map
  const detailMap = L.map('detail-map-container', { center: [listing.latitude, listing.longitude], zoom: 15, zoomControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(detailMap);
  L.marker([listing.latitude, listing.longitude]).addTo(detailMap).bindPopup(listing.name).openPopup();

  // Render reviews
  renderReviewSection(reviews, listing.id);
}

/**
 * Toggle favorite from detail page
 */
async function toggleFavoriteDetail(listingId, btn) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to save favorites', 'warning');
    return;
  }
  const data = await apiFetch('/favorites', { method: 'POST', body: JSON.stringify({ listing_id: listingId }) });
  if (data.is_favorite !== undefined) {
    btn.innerHTML = data.is_favorite ? '❤️ Saved' : '🤍 Save to Favorites';
    showToast(data.message, 'success');
  }
}
