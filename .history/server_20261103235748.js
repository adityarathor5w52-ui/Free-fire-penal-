const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database Setup
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_string TEXT UNIQUE,
      expires_at TEXT,
      created_at TEXT
    )`);
  }
});

// 1. Home / Client Panel Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Admin Route (Key Generator Page)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 3. API: Generate Key with Hours/Days
app.post('/api/generate-key', (req, res) => {
  const { duration } = req.body;
  const hours = duration || 24;

  const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const newKey = `DRKE-${randomPart()}-${randomPart()}-${randomPart()}`;
  
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

// 4. API: Verify Key for User Login (With Expiry Check)
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) {
      return res.json({ success: false, message: "Invalid key!" });
    }

    const now = new Date();
    const expiryTime = new Date(row.expires_at);

    if (now > expiryTime) {
      return res.json({ success: false, message: "Key has expired!" });
    }

    res.json({ success: true, data: row });
  });
});// Server.js ke andar yeh route add karein
app.post('/api/session-info', (req, res) => {
  const { key } = req.body;
  
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) {
      return res.json({ success: false, message: "Invalid session key!" });
    }

    // Check expiry
    const now = new Date();
    const expiryTime = new Date(row.expires_at);
    if (now > expiryTime) {
      return res.json({ success: false, message: "Key has expired!" });
    }

    // Agar key sahi hai toh data bhej do
    res.json({ 
      success: true, 
      key: row.key_string,
      activated_at: row.created_at,
      expires_at: row.expires_at 
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});