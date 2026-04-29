/**
 * Database Seed Script
 * Populates the database with 40+ realistic Pune listings.
 * Run: node db/seed.js
 */
const { getDb, initializeDatabase } = require('./database');

async function seed() {
  await initializeDatabase();
  const db = getDb();

  // Clear existing data
  db.exec('DELETE FROM favorites');
  db.exec('DELETE FROM reviews');
  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');

  const listings = [
    // ===== ACCOMMODATION — PGs =====
    ["Comfort PG for Boys", "accommodation", "pg", "Spacious rooms with attached bathrooms, daily housekeeping, and home-cooked meals. Ideal for students of Pune University.", 8000, "₹8,000/month", 18.5195, 73.8353, "Lane 5, Kothrud, Pune 411038", "9876543210", "comfortpg@email.com", '["https://picsum.photos/seed/pg1/600/400","https://picsum.photos/seed/pg1b/600/400"]', '["WiFi","Food","Laundry","AC","Parking"]', null, 4.3, 28, 1],
    ["Shree Girls PG", "accommodation", "pg", "Safe and secure PG for girls with CCTV surveillance, home food, and proximity to Symbiosis College.", 7500, "₹7,500/month", 18.5314, 73.8446, "SB Road, Near Garware College, Pune 411004", "9876543211", "shreepg@email.com", '["https://picsum.photos/seed/pg2/600/400","https://picsum.photos/seed/pg2b/600/400"]', '["WiFi","Food","CCTV","Laundry","Geyser"]', null, 4.5, 42, 1],
    ["Urban Nest Co-Living", "accommodation", "pg", "Modern co-living space with coworking zone, gym, and community events. Perfect for students and young professionals.", 12000, "₹12,000/month", 18.5912, 73.7390, "Hinjewadi Phase 1, Pune 411057", "9876543212", "urbannest@email.com", '["https://picsum.photos/seed/pg3/600/400"]', '["WiFi","Gym","Coworking","Food","AC","Laundry"]', null, 4.7, 56, 1],
    ["Green View PG", "accommodation", "pg", "Budget-friendly PG with garden view, vegetarian meals, and quiet study environment.", 5500, "₹5,500/month", 18.5074, 73.8077, "Warje, Near MIT College, Pune 411058", "9876543213", "greenpg@email.com", '["https://picsum.photos/seed/pg4/600/400"]', '["WiFi","Food","Garden","Study Room"]', "veg", 4.0, 15, 0],
    ["Blueberry PG Baner", "accommodation", "pg", "Premium PG in Baner with furnished rooms, power backup, and premium amenities.", 10000, "₹10,000/month", 18.5590, 73.7868, "Baner Road, Near Nucleus Mall, Pune 411045", "9876543214", "blueberrypg@email.com", '["https://picsum.photos/seed/pg5/600/400"]', '["WiFi","AC","Food","TV","Power Backup","Parking"]', null, 4.4, 33, 0],
    ["Sunshine PG Viman Nagar", "accommodation", "pg", "Well-maintained PG close to Viman Nagar metro station. Ideal for IT professionals and students.", 9000, "₹9,000/month", 18.5679, 73.9143, "Viman Nagar, Near Phoenix Mall, Pune 411014", "9876543215", "sunshinepg@email.com", '["https://picsum.photos/seed/pg6/600/400"]', '["WiFi","Food","Laundry","Metro Nearby"]', null, 4.2, 21, 0],

    // ===== ACCOMMODATION — Hostels =====
    ["FC Road Student Hostel", "accommodation", "hostel", "Affordable hostel right on FC Road with common kitchen, library, and gaming zone.", 4500, "₹4,500/month", 18.5268, 73.8416, "Fergusson College Road, Pune 411004", "9876543220", "fchostel@email.com", '["https://picsum.photos/seed/h1/600/400"]', '["WiFi","Kitchen","Library","Gaming Zone"]', null, 4.1, 38, 1],
    ["SB Road Boys Hostel", "accommodation", "hostel", "Centrally located hostel with hot water, mess facility, and 24/7 security.", 5000, "₹5,000/month", 18.5350, 73.8300, "Senapati Bapat Road, Pune 411016", "9876543221", "sbhostel@email.com", '["https://picsum.photos/seed/h2/600/400"]', '["WiFi","Food","Hot Water","Security","CCTV"]', null, 3.9, 22, 0],
    ["Deccan Gymkhana Hostel", "accommodation", "hostel", "Heritage hostel near Deccan area with spacious rooms and mess.", 4000, "₹4,000/month", 18.5167, 73.8414, "Deccan Gymkhana, Pune 411004", "9876543222", "deccanhostel@email.com", '["https://picsum.photos/seed/h3/600/400"]', '["WiFi","Food","Common Room","Laundry"]', null, 3.7, 18, 0],

    // ===== ACCOMMODATION — Shared Flats =====
    ["Kothrud Shared Flat", "accommodation", "shared_flat", "2BHK shared flat for 3 students. Fully furnished with kitchen and balcony. Near Kothrud bus depot.", 6000, "₹6,000/person", 18.5082, 73.8071, "Paud Road, Kothrud, Pune 411038", "9876543230", "kothrudflat@email.com", '["https://picsum.photos/seed/sf1/600/400"]', '["WiFi","Kitchen","Furnished","Balcony","Washing Machine"]', null, 4.3, 12, 0],
    ["Wakad Student Flat", "accommodation", "shared_flat", "Modern 3BHK sharing flat near Hinjewadi IT Park. Great for working students.", 7000, "₹7,000/person", 18.5989, 73.7603, "Wakad, Near Datta Mandir Chowk, Pune 411057", "9876543231", "wakadflat@email.com", '["https://picsum.photos/seed/sf2/600/400"]', '["WiFi","Kitchen","Furnished","Gym","Parking"]', null, 4.1, 9, 0],
    ["Hadapsar Budget Flat", "accommodation", "shared_flat", "Affordable sharing flat near Magarpatta City. Public transport easily accessible.", 4500, "₹4,500/person", 18.5089, 73.9260, "Hadapsar, Near Magarpatta, Pune 411028", "9876543232", "hadapsarflat@email.com", '["https://picsum.photos/seed/sf3/600/400"]', '["WiFi","Kitchen","Bus Stop Nearby"]', null, 3.8, 7, 0],

    // ===== FOOD & MESS =====
    ["Annapurna Mess", "food", "mess", "Authentic Maharashtrian thali with unlimited food. Serving students for 15 years.", 3500, "₹3,500/month", 18.5250, 73.8400, "FC Road, Near Goodluck Chowk, Pune 411004", "9876543240", "annapurna@email.com", '["https://picsum.photos/seed/f1/600/400"]', '["Unlimited Food","Home Style","Thali"]', "veg", 4.6, 85, 1],
    ["Mumbai Tiffin Service", "food", "tiffin", "Daily tiffin delivery with rotating menu. Both veg and non-veg options available.", 4000, "₹4,000/month", 18.5350, 73.8450, "SB Road, Pune 411016", "9876543241", "mumbaitiffin@email.com", '["https://picsum.photos/seed/f2/600/400"]', '["Home Delivery","Rotating Menu","Hygienic"]', "both", 4.3, 52, 1],
    ["Ruchi Veg Mess", "food", "mess", "Pure vegetarian mess with Gujarati and Rajasthani cuisine. Clean and hygienic.", 3000, "₹3,000/month", 18.5190, 73.8350, "Kothrud, Near Nal Stop, Pune 411038", "9876543242", "ruchimess@email.com", '["https://picsum.photos/seed/f3/600/400"]', '["Pure Veg","Gujarati","Rajasthani","Clean"]', "veg", 4.4, 67, 0],
    ["Spice Kitchen Non-Veg Mess", "food", "mess", "Popular non-veg mess known for chicken thali and biryani Fridays.", 4500, "₹4,500/month", 18.5280, 73.8420, "JM Road, Near Sambhaji Park, Pune 411005", "9876543243", "spicekitchen@email.com", '["https://picsum.photos/seed/f4/600/400"]', '["Non-Veg Specials","Biryani","Chicken Thali"]', "nonveg", 4.5, 71, 0],
    ["FreshBox Tiffin", "food", "tiffin", "Healthy meal prep tiffin service with calorie-counted meals. Great for fitness-conscious students.", 5000, "₹5,000/month", 18.5600, 73.7900, "Baner, Pune 411045", "9876543244", "freshbox@email.com", '["https://picsum.photos/seed/f5/600/400"]', '["Calorie Counted","Healthy","Home Delivery"]', "both", 4.2, 31, 0],
    ["Aai Tiffin Centre", "food", "tiffin", "Home-cooked Maharashtrian meals delivered fresh. Weekly menu shared in advance.", 3200, "₹3,200/month", 18.5100, 73.8100, "Warje, Pune 411058", "9876543245", "aaitiffin@email.com", '["https://picsum.photos/seed/f6/600/400"]', '["Home Cooked","Maharashtrian","Delivery"]', "veg", 4.1, 25, 0],
    ["Punjabi Zaika Mess", "food", "mess", "North Indian mess with rich curries and fresh rotis. Student discounts available.", 3800, "₹3,800/month", 18.5670, 73.9150, "Viman Nagar, Pune 411014", "9876543246", "punjabizaika@email.com", '["https://picsum.photos/seed/f7/600/400"]', '["North Indian","Student Discount","Fresh Rotis"]', "both", 4.0, 19, 0],

    // ===== ESSENTIAL SERVICES =====
    ["QuickWash Laundry", "services", "laundry", "Same-day laundry and dry cleaning service. Pickup and delivery available for students.", 0, "₹50–150/kg", 18.5260, 73.8410, "FC Road, Pune 411004", "9876543250", "quickwash@email.com", '["https://picsum.photos/seed/s1/600/400"]', '["Same Day","Pickup","Delivery","Dry Clean"]', null, 4.3, 44, 0],
    ["UClean Laundry Kothrud", "services", "laundry", "Professional laundry chain with app-based tracking. Student packages available.", 0, "₹80–200/kg", 18.5080, 73.8080, "Kothrud, Near Bus Depot, Pune 411038", "9876543251", "uclean@email.com", '["https://picsum.photos/seed/s2/600/400"]', '["App Tracking","Student Package","Professional"]', null, 4.1, 28, 0],
    ["MedPlus Pharmacy", "services", "medical", "24/7 pharmacy with home delivery. All prescription and OTC medicines available.", 0, "Open 24/7", 18.5200, 73.8370, "Deccan, Pune 411004", "9876543252", "medplus@email.com", '["https://picsum.photos/seed/s3/600/400"]', '["24/7","Home Delivery","Prescription","OTC"]', null, 4.5, 62, 1],
    ["Apollo Pharmacy SB Road", "services", "medical", "Trusted pharmacy chain with health checkup facility. Student health card accepted.", 0, "Varies", 18.5340, 73.8310, "SB Road, Pune 411016", "9876543253", "apollo@email.com", '["https://picsum.photos/seed/s4/600/400"]', '["Health Checkup","Student Card","Trusted"]', null, 4.4, 35, 0],
    ["Student Corner Stationery", "services", "stationery", "Complete stationery shop with printing, photocopying, and binding services. Bulk discounts for students.", 0, "Affordable", 18.5270, 73.8430, "FC Road, Near COEP, Pune 411005", "9876543254", "studentcorner@email.com", '["https://picsum.photos/seed/s5/600/400"]', '["Printing","Photocopy","Binding","Stationery"]', null, 4.2, 55, 0],
    ["Reliable Stationery", "services", "stationery", "Trusted stationery shop near Pune University. Art supplies and engineering drawing tools.", 0, "Affordable", 18.5150, 73.8400, "Near Pune University, Pune 411007", "9876543255", "reliable@email.com", '["https://picsum.photos/seed/s6/600/400"]', '["Art Supplies","Engineering Tools","Books"]', null, 4.0, 20, 0],
    ["Jio Fiber Center", "services", "internet", "High-speed fiber internet plans starting at ₹399/month. Free installation for students.", 399, "₹399/month onwards", 18.5300, 73.8380, "JM Road, Pune 411005", "9876543256", "jiofiber@email.com", '["https://picsum.photos/seed/s7/600/400"]', '["High Speed","Free Install","Student Plan"]', null, 4.3, 41, 0],
    ["Airtel Broadband", "services", "internet", "Reliable broadband with 200Mbps plans. 24/7 customer support and quick resolution.", 499, "₹499/month onwards", 18.5600, 73.7850, "Baner, Pune 411045", "9876543257", "airtel@email.com", '["https://picsum.photos/seed/s8/600/400"]', '["200Mbps","24/7 Support","Reliable"]', null, 4.1, 33, 0],

    // ===== WEEKEND / EXPLORE =====
    ["Café Durga", "explore", "cafe", "Cozy café with great coffee, free WiFi, and a peaceful reading corner. Student favorite since 2015.", 0, "₹150–400/visit", 18.5220, 73.8430, "FC Road, Pune 411004", "9876543260", "cafedurga@email.com", '["https://picsum.photos/seed/e1/600/400"]', '["WiFi","Coffee","Reading Corner","Snacks"]', null, 4.6, 92, 1],
    ["Pagdandi Books Chai Café", "explore", "cafe", "Iconic book café in Baner with a massive library, chai, and weekend acoustic sessions.", 0, "₹200–500/visit", 18.5570, 73.7810, "Baner, Near Westend Mall, Pune 411045", "9876543261", "pagdandi@email.com", '["https://picsum.photos/seed/e2/600/400"]', '["Books","Chai","Live Music","Cozy"]', null, 4.8, 120, 1],
    ["Shaniwar Wada", "explore", "tourist", "Historic 18th-century fortification in the heart of Pune. Must-visit for history enthusiasts.", 0, "₹25 entry", 18.5195, 73.8553, "Shaniwar Peth, Pune 411030", "9876543262", null, '["https://picsum.photos/seed/e3/600/400"]', '["Historical","Photography","Light Show"]', null, 4.5, 150, 1],
    ["Aga Khan Palace", "explore", "tourist", "Beautiful palace and museum with lush gardens. Important historical landmark of India's freedom movement.", 0, "₹25 entry", 18.5520, 73.9017, "Nagar Road, Pune 411006", "9876543263", null, '["https://picsum.photos/seed/e4/600/400"]', '["Museum","Gardens","Historical","Photography"]', null, 4.4, 88, 0],
    ["Sinhagad Fort", "explore", "tourist", "Popular trekking destination with stunning views. Weekend warrior's paradise with local food stalls.", 0, "Free", 18.3664, 73.7558, "Sinhagad, Pune 411025", "9876543264", null, '["https://picsum.photos/seed/e5/600/400"]', '["Trekking","Views","Food Stalls","Adventure"]', null, 4.7, 200, 1],
    ["Okayama Friendship Garden", "explore", "park", "Japanese-inspired garden with beautiful landscapes, koi ponds, and walking trails. Perfect for relaxation.", 0, "₹10 entry", 18.5093, 73.8290, "Sinhagad Road, Pune 411030", "9876543265", null, '["https://picsum.photos/seed/e6/600/400"]', '["Japanese Garden","Koi Ponds","Walking Trails"]', null, 4.3, 65, 0],
    ["Empress Garden", "explore", "park", "Sprawling botanical garden with flower shows, jogging tracks, and picnic spots.", 0, "₹20 entry", 18.5053, 73.8783, "Empress Garden, Camp, Pune 411001", "9876543266", null, '["https://picsum.photos/seed/e7/600/400"]', '["Botanical","Flower Shows","Jogging","Picnic"]', null, 4.2, 73, 0],
    ["Phoenix Marketcity", "explore", "mall", "Pune's largest mall with 300+ stores, multiplex, food court, and gaming zone. Weekend entertainment hub.", 0, "Free entry", 18.5604, 73.9166, "Viman Nagar, Pune 411014", "9876543267", null, '["https://picsum.photos/seed/e8/600/400"]', '["Shopping","Multiplex","Food Court","Gaming"]', null, 4.5, 180, 1],
    ["Amanora Mall", "explore", "mall", "Premium shopping destination with international brands, IMAX theater, and kids' zone.", 0, "Free entry", 18.5183, 73.9352, "Hadapsar, Pune 411028", "9876543268", null, '["https://picsum.photos/seed/e9/600/400"]', '["Premium","IMAX","International Brands"]', null, 4.3, 95, 0],
    ["Vetal Tekdi (Hill)", "explore", "park", "Urban hill with nature trails, sunrise viewpoints, and bird watching. Popular morning jogging spot.", 0, "Free", 18.5150, 73.8200, "Paud Road, Pune 411038", "9876543269", null, '["https://picsum.photos/seed/e10/600/400"]', '["Nature Trails","Sunrise","Bird Watching","Jogging"]', null, 4.6, 110, 0],
    ["The Filter Coffee", "explore", "cafe", "South Indian filter coffee and snacks in a trendy setting. Great for study sessions.", 0, "₹100–300/visit", 18.5340, 73.8280, "SB Road, Pune 411016", "9876543270", "filtercoffee@email.com", '["https://picsum.photos/seed/e11/600/400"]', '["South Indian Coffee","Study Friendly","Snacks"]', null, 4.4, 48, 0],
  ];

  // Insert all listings one by one
  const insertSql = `INSERT INTO listings (name, category, subcategory, description, price, price_label, latitude, longitude, address, contact_phone, contact_email, image_urls, facilities, veg_nonveg, rating, review_count, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const item of listings) {
    db.prepare(insertSql).run(...item);
  }

  // Save to disk
  db.save();

  console.log(`✅ Seeded ${listings.length} listings successfully`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
