const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database Setup
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database opening error: ", err.message);
  else console.log("Connected to SQLite database.");
});

db.run(`CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_string TEXT UNIQUE,
  expires_at TEXT,
  created_at TEXT
)`);

// Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));
app.get('/features', (req, res) => res.sendFile(path.join(__dirname, 'features.html')));
app.get('/manage', (req, res) => res.sendFile(path.join(__dirname, 'manage.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API: Bulk Generate Keys
app.post('/api/generate-key', (req, res) => {
  const { duration, count } = req.body;
  const hours = duration || 24;
  const totalKeys = count || 1;
  const keysArray = [];
  const createdAt = new Date().toISOString();
  
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (hours * 60 * 60 * 1000));
  const expiresAt = expiryDate.toISOString();

  let completed = 0;
  for (let i = 0; i < totalKeys; i++) {
    const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `DRKE-${randomPart()}-${randomPart()}-${randomPart()}`;
    keysArray.push(newKey);

    db.run(`INSERT INTO keys (key_string, expires_at, created_at) VALUES (?, ?, ?)`, 
      [newKey, expiresAt, createdAt], function(err) {
        completed++;
        if (completed === totalKeys) {
          if (err && keysArray.length === 1) {
            return res.status(500).json({ success: false, message: "Error generating key" });
          }
          res.json({ success: true, keys: keysArray, expires_at: expiresAt });
        }
    });
  }
});

// API: Verify Key
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) return res.json({ success: false, message: "Invalid key!" });
    if (new Date() > new Date(row.expires_at)) return res.json({ success: false, message: "Key has expired!" });
    res.json({ success: true, data: row });
  });
});

// API: Session Info
app.post('/api/session-info', (req, res) => {
  const { key } = req.body;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) return res.json({ success: false, message: "Invalid session key!" });
    if (new Date() > new Date(row.expires_at)) return res.json({ success: false, message: "Key has expired!" });
    res.json({ success: true, key: row.key_string, activated_at: row.created_at, expires_at: row.expires_at });
  });
});
//API: Subscription Link for Happ App
app.get('/api/sub/:key', (req, res) => {
  const key = req.params.key;
  db.get(`SELECT * FROM keys WHERE key_string = ?`, [key], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Invalid or expired key!");
    }
    if (new Date() > new Date(row.expires_at)) {
      return res.status(403).send("Key has expired!");
    }
    // Seedha raw link bhejni hai bina base64 ke
    const configData = `hysteria://127.0.0.1:443?peer=drake-panel&insecure=1#PHANTOM BY DRAKE [${key}]`;
    res.send(configData);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));