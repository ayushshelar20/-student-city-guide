/**
 * Database Module — SQLite connection & schema initialization
 * Uses sql.js (SQLite compiled to WASM) — no native build tools required.
 * Provides a compatibility wrapper that matches better-sqlite3's API surface.
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Store the database file in the db/ directory
const DB_PATH = path.join(__dirname, 'student_city_guide.db');

// ─── Compatibility Wrapper ──────────────────────────────
// Wraps sql.js to provide the same API as better-sqlite3:
//   db.prepare(sql).all(...params)
//   db.prepare(sql).get(...params)
//   db.prepare(sql).run(...params)
//   db.exec(sql)
//   db.transaction(fn)

class DatabaseWrapper {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  prepare(sql) {
    const db = this._db;
    return {
      all(...params) {
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params) {
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let result = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run(...params) {
        db.run(sql, params);
        return {
          lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0],
          changes: db.getRowsModified()
        };
      }
    };
  }

  exec(sql) {
    this._db.run(sql);
  }

  transaction(fn) {
    const db = this._db;
    return (...args) => {
      db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        db.run('COMMIT');
        return result;
      } catch (err) {
        db.run('ROLLBACK');
        throw err;
      }
    };
  }

  /** Save the current database state to disk */
  save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// ─── Module State ───────────────────────────────────────
let db = null;

/**
 * Initialize database — loads from file or creates new.
 * MUST be called (and awaited) before using `db`.
 */
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new DatabaseWrapper(new SQL.Database(fileBuffer));
  } else {
    db = new DatabaseWrapper(new SQL.Database());
  }

  // Create tables if they don't exist
  db.exec(`
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Main listings table — stores all places (PGs, hostels, mess, services, cafes, etc.)
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      description TEXT,
      price INTEGER,
      price_label TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL,
      contact_phone TEXT,
      contact_email TEXT,
      image_urls TEXT,
      facilities TEXT,
      veg_nonveg TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    -- Favorites / saved listings
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      UNIQUE(user_id, listing_id)
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
    CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory);
    CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
    CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
  `);

  // Save to disk after schema init
  db.save();

  console.log('✅ Database initialized successfully');
  return db;
}

/**
 * Get the database instance.
 * Call initializeDatabase() first.
 */
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

module.exports = { getDb, initializeDatabase, DB_PATH };
