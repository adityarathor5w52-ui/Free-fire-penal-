const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Setup (SQLite)
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database opening error: ", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create Keys Table if not exists
db.run(`CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_string TEXT UNIQUE,
  expires_at TEXT,
  created_at TEXT
)`);

// ----------------- ROUTES (Multi-Page Navigation) -----------------

// Index / Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Home Page
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Features Page
app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'features.html'));
});

// Manage Page
app.get('/manage', (req, res) => {
  res.sendFile(path.join(__dirname, 'manage.html'));
});

// Admin Page (Password Protected via Frontend)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});


// ----------------- API ENDPOINTS -----------------

// 1. Generate Key API (Supports Hours / Days selection)
app.post('/api/generate-key', (req, res) => {
  const { duration } = req.body; // duration hours mein aayega (jaise 1, 24, 720)
  const hours = duration || 24;

  const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const newKey = `DRKE-${randomPart()}-${randomPart()}-${randomPart()}`;
  
  // Exact expiry calculation based on hours/days
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (hours * 60 * 60 * 1000));
  const expiresAt = expiryDate.toISOString();
  const createdAt = new Date().toISOString();

  db.run(`INSERT INTO keys (key_string, expires_at, created_at) VALUES (?, ?, ?)`, 
    [newKey, expiresAt, createdAt], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Error generating key" });
    }
    res.json({ success: true, key: newKey, expires_at: expiresAt });
  });
});

// 2. Verify Key API (For Login with Expiry Validation)
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) {
      return res.json({ success: false, message: "Invalid key!" });
    }

    // Check if key has expired
    const now = new Date();
    const expiryTime = new Date(row.expires_at);

    if (now > expiryTime) {
      return res.json({ success: false, message: "Key has expired!" });
    }

    res.json({ success: true, data: row });
  });
});

// 3. Session Info API (For Home Page details)
app.post('/api/session-info', (req, res) => {
  const { key } = req.body;
  
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) {
      return res.json({ success: false, message: "Invalid session key!" });
    }

    const now = new Date();
    const expiryTime = new Date(row.expires_at);
    if (now > expiryTime) {
      return res.json({ success: false, message: "Key has expired!" });
    }

    res.json({ 
      success: true, 
      key: row.key_string,
      activated_at: row.created_at,
      expires_at: row.expires_at 
    });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});