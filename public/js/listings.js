/**
 * Listings Module — Renders listing cards in the sidebar panel
 */

/**
 * Render listing cards into the listings container
 */
function renderListings(listings) {
  const container = document.getElementById('listings-container');
  if (!container) return;

  if (listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No places found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
      </div>`;
    return;
  }

  container.innerHTML = listings.map(listing => createListingCard(listing)).join('');

  // Add click events to cards
  container.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't fly to map if clicking favorite button or link
      if (e.target.closest('.fav-btn') || e.target.closest('.card-link')) return;
      const id = Number(card.dataset.id);
      const listing = listings.find(l => l.id === id);
      if (listing) flyToListing(listing);
    });
  });

  // Add favorite button events
  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(Number(btn.dataset.id), btn);
    });
  });
}

/**
 * Create HTML for a single listing card
 */
function createListingCard(listing) {
  const images = safeParseJSON(listing.image_urls);
  const imgSrc = images[0] || 'https://picsum.photos/seed/default/400/250';
  const facilities = safeParseJSON(listing.facilities).slice(0, 4);
  const catMeta = CATEGORIES[listing.category] || {};
  const dist = listing.distance ? formatDistance(listing.distance) : '';
  const isFav = listing.is_favorite;

  return `
    <div class="listing-card" data-id="${listing.id}">
      <div class="card-image">
        <img src="${imgSrc}" alt="${listing.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/fb${listing.id}/400/250'">
        <span class="card-badge" style="background:${catMeta.color}">${SUBCATEGORIES[listing.subcategory] || listing.subcategory}</span>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${listing.id}" title="Save to favorites">
          ${isFav ? '❤️' : '🤍'}
        </button>
        ${listing.is_featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${listing.name}</h3>
        <div class="card-meta">
          <span class="card-rating">${renderStars(listing.rating)} <span class="rating-num">${listing.rating}</span> <span class="review-count">(${listing.review_count})</span></span>
          ${dist ? `<span class="card-distance">📍 ${dist}</span>` : ''}
        </div>
        <p class="card-address">📌 ${listing.address}</p>
        <div class="card-price">${listing.price_label || formatPrice(listing.price)}</div>
        ${facilities.length > 0 ? `
          <div class="card-facilities">
            ${facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
          </div>` : ''}
        <a href="/listing.html?id=${listing.id}" class="card-link">View Details →</a>
      </div>
    </div>`;
}

/**
 * Toggle favorite for a listing
 */
async function toggleFavorite(listingId, btn) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to save favorites', 'warning');
    return;
  }

  const data = await apiFetch('/favorites', {
    method: 'POST',
    body: JSON.stringify({ listing_id: listingId })
  });

  if (data.is_favorite !== undefined) {
    btn.classList.toggle('active', data.is_favorite);
    btn.innerHTML = data.is_favorite ? '❤️' : '🤍';
    showToast(data.message, 'success');
  }
}
