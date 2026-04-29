/**
 * Reviews Routes — Add and fetch reviews for listings
 */
const express = require('express');
const { getDb } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/reviews
 * Add a review for a listing (requires authentication)
 */
router.post('/', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const { listing_id, rating, comment } = req.body;

    if (!listing_id || !rating) {
      return res.status(400).json({ error: 'listing_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check listing exists
    const listing = db.prepare('SELECT id FROM listings WHERE id = ?').get(listing_id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user already reviewed this listing
    const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND listing_id = ?').get(req.user.id, listing_id);
    if (existing) {
      // Update existing review
      db.prepare('UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?').run(rating, comment || '', existing.id);
    } else {
      // Insert new review
      db.prepare('INSERT INTO reviews (user_id, listing_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.user.id, listing_id, rating, comment || '');
    }

    // Recalculate average rating for the listing
    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE listing_id = ?').get(listing_id);
    db.prepare('UPDATE listings SET rating = ?, review_count = ? WHERE id = ?').run(
      Math.round(stats.avg_rating * 10) / 10,
      stats.count,
      listing_id
    );

    // Save to disk after write
    db.save();

    res.json({ success: true, message: existing ? 'Review updated' : 'Review added' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/reviews/:listingId
 * Get all reviews for a specific listing
 */
router.get('/:listingId', (req, res) => {
  try {
    const db = getDb();
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r JOIN users u ON r.user_id = u.id 
      WHERE r.listing_id = ? 
      ORDER BY r.created_at DESC
    `).all(req.params.listingId);

    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
