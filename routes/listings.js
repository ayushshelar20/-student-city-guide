/**
 * Listings Routes — CRUD, filtering, search, and recommendations
 */
const express = require('express');
const { getDb } = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/listings
 * Fetch listings with optional filters:
 *   ?category=accommodation&subcategory=pg&budget_min=3000&budget_max=10000
 *   &search=kothrud&sort=price_asc&lat=18.52&lng=73.85
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const { category, subcategory, budget_min, budget_max, search, sort, lat, lng, veg_nonveg } = req.query;

    let query = 'SELECT * FROM listings WHERE 1=1';
    const params = [];

    // Category filter
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Subcategory filter
    if (subcategory) {
      query += ' AND subcategory = ?';
      params.push(subcategory);
    }

    // Budget range filter (only for listings with price > 0)
    if (budget_min) {
      query += ' AND price >= ?';
      params.push(Number(budget_min));
    }
    if (budget_max) {
      query += ' AND (price <= ? OR price = 0)';
      params.push(Number(budget_max));
    }

    // Veg/Non-veg filter
    if (veg_nonveg) {
      query += ' AND (veg_nonveg = ? OR veg_nonveg = "both")';
      params.push(veg_nonveg);
    }

    // Search filter — matches name, description, or address
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR address LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    switch (sort) {
      case 'price_asc': query += ' ORDER BY price ASC'; break;
      case 'price_desc': query += ' ORDER BY price DESC'; break;
      case 'rating': query += ' ORDER BY rating DESC'; break;
      case 'reviews': query += ' ORDER BY review_count DESC'; break;
      default: query += ' ORDER BY is_featured DESC, rating DESC';
    }

    let listings = db.prepare(query).all(...params);

    // If user coordinates provided, calculate distance for each listing
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      listings = listings.map(l => ({
        ...l,
        distance: haversineDistance(userLat, userLng, l.latitude, l.longitude)
      }));

      // Sort by distance if requested
      if (sort === 'distance') {
        listings.sort((a, b) => a.distance - b.distance);
      }
    }

    // If user is logged in, mark favorites
    if (req.user) {
      const favIds = db.prepare('SELECT listing_id FROM favorites WHERE user_id = ?')
        .all(req.user.id).map(f => f.listing_id);
      listings = listings.map(l => ({ ...l, is_favorite: favIds.includes(l.id) }));
    }

    res.json({ listings, count: listings.length });
  } catch (err) {
    console.error('Listings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/listings/recommendations
 * Smart recommendations based on budget and location
 */
router.get('/recommendations', (req, res) => {
  try {
    const db = getDb();
    const { budget, lat, lng, category } = req.query;
    let listings = db.prepare('SELECT * FROM listings' + (category ? ' WHERE category = ?' : '')).all(...(category ? [category] : []));

    if (!lat || !lng) {
      // No location — just return top rated
      listings.sort((a, b) => b.rating - a.rating);
      return res.json({ recommendations: listings.slice(0, 6) });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const userBudget = budget ? Number(budget) : null;

    // Score each listing: budget match (40%) + proximity (30%) + rating (30%)
    const scored = listings.map(l => {
      const dist = haversineDistance(userLat, userLng, l.latitude, l.longitude);

      // Budget score: 1.0 if within budget, decreases as price exceeds budget
      let budgetScore = 1.0;
      if (userBudget && l.price > 0) {
        budgetScore = l.price <= userBudget ? 1.0 : Math.max(0, 1 - (l.price - userBudget) / userBudget);
      }

      // Distance score: closer = higher (max 20km range)
      const distScore = Math.max(0, 1 - dist / 20);

      // Rating score: normalized to 0-1
      const ratingScore = l.rating / 5;

      const totalScore = (budgetScore * 0.4) + (distScore * 0.3) + (ratingScore * 0.3);

      return { ...l, distance: dist, score: totalScore };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json({ recommendations: scored.slice(0, 6) });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/listings/:id
 * Fetch a single listing with its reviews
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get reviews with user names
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r JOIN users u ON r.user_id = u.id 
      WHERE r.listing_id = ? ORDER BY r.created_at DESC
    `).all(req.params.id);

    // Check if favorited by current user
    let is_favorite = false;
    if (req.user) {
      const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?').get(req.user.id, req.params.id);
      is_favorite = !!fav;
    }

    res.json({ listing: { ...listing, is_favorite }, reviews });
  } catch (err) {
    console.error('Listing detail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Haversine formula — calculate distance between two lat/lng points in km
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;
