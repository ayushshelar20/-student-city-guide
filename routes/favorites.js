/**
 * Favorites Routes — Toggle and list saved/favorite listings
 */
const express = require('express');
const { getDb } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/favorites
 * Toggle favorite status for a listing
 */
router.post('/', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'listing_id is required' });
    }

    // Check if already favorited
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?').get(req.user.id, listing_id);

    if (existing) {
      // Remove favorite
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      db.save();
      res.json({ is_favorite: false, message: 'Removed from favorites' });
    } else {
      // Add favorite
      db.prepare('INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)').run(req.user.id, listing_id);
      db.save();
      res.json({ is_favorite: true, message: 'Added to favorites' });
    }
  } catch (err) {
    console.error('Favorites error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/favorites
 * Get all favorites for the logged-in user
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const favorites = db.prepare(`
      SELECT l.* FROM listings l
      JOIN favorites f ON l.id = f.listing_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);

    res.json({ favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
