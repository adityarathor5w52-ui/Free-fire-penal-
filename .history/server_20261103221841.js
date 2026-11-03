const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// SQLite Database Setup
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create keys table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_string TEXT UNIQUE,
      expires_at TEXT,
      created_at TEXT
    )`);
  }
});

// Route to serve the main panel page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: Generate a new key (Admin endpoint)
app.post('/api/generate-key', (req, res) => {
  // Random key format: DRKE-XXXX-XXXX-XXXX
  const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const newKey = `DRKE-${randomPart()}-${randomPart()}-${randomPart()}`;
  
  // Expiry date (e.g., 1 day from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  const expiresAt = expiryDate.toISOString().split('T')[0];
  const createdAt = new Date().toISOString().split('T')[0];

  db.run(`INSERT INTO keys (key_string, expires_at, created_at) VALUES (?, ?, ?)`, 
    [newKey, expiresAt, createdAt], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Error generating key" });
    }
    res.json({ success: true, key: newKey, expires_at: expiresAt });
  });
});

// API: Verify key for login
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (row) {
      res.json({ success: true, data: row });
    } else {
      res.json({ success: false, message: "Invalid or expired key!" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});