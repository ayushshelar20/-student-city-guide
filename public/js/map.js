/**
 * Map Module — Leaflet.js integration for interactive map
 * Handles marker placement, popups, user geolocation, and distance display.
 */

// Map instance and state
let map = null;
let markers = [];
let markerLayer = null;
let userMarker = null;
let userLocation = null;
let activePopupId = null;

// Custom marker icons per category
const markerIcons = {};

/**
 * Initialize the Leaflet map centered on Pune
 */
function initMap() {
  map = L.map('map', {
    center: [18.5204, 73.8567], // Pune center
    zoom: 13,
    zoomControl: false
  });

  // Add zoom control to bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // OpenStreetMap tile layer with dark-friendly style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  // Create marker layer group
  markerLayer = L.layerGroup().addTo(map);

  // Create custom marker icons
  createMarkerIcons();

  // Try to get user's location
  getUserLocation();

  return map;
}

/**
 * Create colored circle marker icons for each category
 */
function createMarkerIcons() {
  const categories = {
    accommodation: '#a855f7',
    food: '#f97316',
    services: '#22c55e',
    explore: '#06b6d4'
  };

  for (const [cat, color] of Object.entries(categories)) {
    markerIcons[cat] = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pin" style="background:${color};box-shadow:0 0 12px ${color}80">
               <span class="marker-icon">${CATEGORIES[cat].icon}</span>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }
}

/**
 * Get user's current geolocation
 */
function getUserLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      // Add user marker with pulsing effect
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-marker',
          html: `<div class="user-pin"><div class="user-pulse"></div><div class="user-dot"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map).bindPopup('<strong>📍 You are here</strong>');

      // Dispatch event so other modules can use location
      window.dispatchEvent(new CustomEvent('userLocationReady', { detail: userLocation }));
    },
    (err) => {
      console.log('Geolocation not available:', err.message);
      // Default to Pune University area
      userLocation = { lat: 18.5204, lng: 73.8567 };
      window.dispatchEvent(new CustomEvent('userLocationReady', { detail: userLocation }));
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/**
 * Add markers to map for a set of listings
 */
function updateMarkers(listings) {
  // Clear existing markers
  markerLayer.clearLayers();
  markers = [];

  listings.forEach(listing => {
    const icon = markerIcons[listing.category] || markerIcons.explore;
    const dist = userLocation
      ? formatDistance(haversineDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude))
      : '';

    const marker = L.marker([listing.latitude, listing.longitude], { icon })
      .bindPopup(createPopupContent(listing, dist), {
        maxWidth: 280,
        className: 'custom-popup'
      });

    marker.listingId = listing.id;

    marker.on('click', () => {
      activePopupId = listing.id;
      highlightCard(listing.id);
    });

    markerLayer.addLayer(marker);
    markers.push(marker);
  });
}

/**
 * Create HTML content for marker popup
 */
function createPopupContent(listing, distance) {
  const images = safeParseJSON(listing.image_urls);
  const imgSrc = images[0] || 'https://picsum.photos/seed/default/300/200';

  return `
    <div class="popup-content">
      <img src="${imgSrc}" alt="${listing.name}" class="popup-img" onerror="this.src='https://picsum.photos/seed/fallback/300/200'">
      <div class="popup-body">
        <div class="popup-category">
          <span class="category-badge" style="background:${CATEGORIES[listing.category]?.color}">${SUBCATEGORIES[listing.subcategory] || listing.subcategory}</span>
          ${distance ? `<span class="popup-distance">📍 ${distance}</span>` : ''}
        </div>
        <h3 class="popup-title">${listing.name}</h3>
        <div class="popup-rating">${renderStars(listing.rating)} <span>(${listing.rating})</span></div>
        <div class="popup-price">${listing.price_label || formatPrice(listing.price)}</div>
        <a href="/listing.html?id=${listing.id}" class="popup-btn">View Details →</a>
      </div>
    </div>
  `;
}

/**
 * Fly to a specific listing on the map
 */
function flyToListing(listing) {
  if (!map) return;
  map.flyTo([listing.latitude, listing.longitude], 16, { duration: 0.8 });

  // Open popup for this marker
  markers.forEach(m => {
    if (m.listingId === listing.id) {
      m.openPopup();
    }
  });
}

/**
 * Highlight a listing card when its marker is clicked
 */
function highlightCard(listingId) {
  document.querySelectorAll('.listing-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.listing-card[data-id="${listingId}"]`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Fit map bounds to show all current markers
 */
function fitMapToMarkers() {
  if (markers.length === 0) return;
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.1));
}
