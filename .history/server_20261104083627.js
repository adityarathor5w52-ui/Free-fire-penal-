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

// Admin Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});