const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');

const app = express();
const db = new Database('drake.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_code TEXT UNIQUE,
    duration_value REAL,
    duration_type TEXT,
    activated_date TEXT,
    expiry_date TEXT,
    device_info TEXT,
    status TEXT DEFAULT 'unused'
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

const adminCheck = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!adminCheck) {
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', 'admin123');
}

const verifyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Bahut zyada requests. Thodi der baad try karein.' }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'drake-secure-super-secret-key-99',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: 'strict' }
}));const htmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Panel</title>
    <style>
        :root { --bg-color: #0c0c0c; --card-bg: #141414; --border-color: #262626; --text-main: #ffffff; --text-muted: #888888; --accent-red: #ff5252; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: monospace, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-main); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .phone-frame { width: 100%; max-width: 420px; height: 100vh; max-height: 850px; background: var(--bg-color); border: 2px solid var(--border-color); display: flex; flex-direction: column; position: relative; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.8); }
        .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--border-color); }
        .top-bar h1 { font-size: 16px; letter-spacing: 2px; }
        .content { flex: 1; padding: 15px; overflow-y: scroll; padding-bottom: 80px; }
        .screen { display: none; }
        .screen.active { display: block; }
        .login-container { text-align: center; margin-top: 20px; }
        .input-group { text-align: left; background: var(--card-bg); border: 1px solid var(--border-color); padding: 12px; margin-bottom: 15px; }
        .input-group label { display: block; font-size: 9px; color: var(--text-muted); margin-bottom: 5px; }
        .input-row { display: flex; justify-content: space-between; align-items: center; }
        .input-row input { background: transparent; border: none; color: var(--text-main); font-size: 13px; outline: none; width: 70%; }
        .icon-btn { background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-main); padding: 5px 10px; font-size: 11px; cursor: pointer; }
        .action-btn { width: 100%; background: var(--text-main); color: var(--bg-color); border: none; padding: 14px; font-weight: bold; font-size: 13px; cursor: pointer; margin-top: 10px; }
        .error-msg { color: #ff5252; font-size: 10px; margin-top: 8px; text-align: center; }
        .status-row { display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); margin-bottom: 10px; }
        .timer-section { text-align: center; margin: 10px 0 20px 0; }
        .time-left-val { font-size: 26px; font-weight: bold; margin-bottom: 2px; }
        .time-left-label { font-size: 9px; color: var(--text-muted); }
        .key-box { background: var(--card-bg); border: 1px solid var(--border-color); padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 11px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .info-card { background: var(--card-bg); border: 1px solid var(--border-color); padding: 10px 6px; text-align: center; }
        .info-card span { display: block; font-size: 8px; color: var(--text-muted); margin-bottom: 4px; }
        .info-card strong { font-size: 9px; }
        .feature-card { background: var(--card-bg); border: 1px solid var(--border-color); padding: 12px; margin-bottom: 12px; }
        .feature-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .feature-title { font-size: 11px; font-weight: bold; color: #fff; }
        .feature-desc { font-size: 8px; color: var(--text-muted); margin-bottom: 10px; }
        .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider-switch { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; border: 1px solid #444; transition: .3s; }
        .slider-switch:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .3s; }
        input:checked + .slider-switch { background-color: #fff; }
        input:checked + .slider-switch:before { transform: translateX(16px); background-color: #000; }
        .nav-bar { position: absolute; bottom: 0; left: 0; width: 100%; background: #0f0f0f; border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; padding: 10px 0; z-index: 10; }
        .nav-item { background: none; border: none; color: var(--text-muted); font-size: 9px; cursor: pointer; text-align: center; }
        .nav-item.active { color: var(--text-main); }
    </style>
</head>
<body>
    <div class="phone-frame">
        <div class="top-bar">
            <h1 id="page-title">DRAKE</h1>
        </div>
        <div class="content">
            <div id="login-screen" class="screen active">
                <div class="login-container">
                    <h2>DRAKE PANEL</h2>
                    <p style="font-size:9px; color:#888; margin-bottom:20px;">ENTER YOUR LICENSE KEY</p>
                    <form onsubmit="handleLogin(event)">
                        <div class="input-group">
                            <label>■ ACCESS KEY</label>
                            <div class="input-row">
                                <input type="text" id="key-input" placeholder="DRKE-XXXX-XXXX-XXXX" required>
                                <button type="button" class="icon-btn" onclick="pasteKey()">PASTE</button>
                            </div>
                        </div>
                        <button type="submit" class="action-btn">UNLOCK</button>
                        <div id="login-error" class="error-msg"></div>
                    </form>
                </div>
            </div>
            <div id="home-screen" class="screen">
                <div class="status-row">
                    <span style="color:#4caf50;">■ ONLINE</span>
                    <span>CONNECTED</span>
                </div>
                <div class="timer-section">
                    <div class="time-left-val" id="time-left-display">ACTIVE</div>
                    <div class="time-left-label">STATUS</div>
                </div>
                <div class="key-box">
                    <span id="display-key">-</span>
                </div>
                <div class="info-grid">
                    <div class="info-card"><span>ACTIVATED</span><strong id="info-activated">-</strong></div>
                    <div class="info-card"><span>EXPIRES</span><strong id="info-expires">-</strong></div>
                    <div class="info-card"><span>DEVICE</span><strong id="info-device">-</strong></div>
                </div>
            </div>
            <div id="features-screen" class="screen">
                <div class="feature-card">
                    <div class="feature-header">
                        <span class="feature-title">01 MARKER (ESP)</span>
                        <label class="switch"><input type="checkbox" checked><span class="slider-switch"></span></label>
                    </div>
                    <div class="feature-desc">Marks every enemy on your screen.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-header">
                        <span class="feature-title">02 AIMPOINT (HEADLOCK)</span>
                        <label class="switch"><input type="checkbox" checked><span class="slider-switch"></span></label>
                    </div>
                    <div class="feature-desc">Adjust aim height towards head.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-header">
                        <span class="feature-title">03 FAST REVIVE</span>
                        <label class="switch"><input type="checkbox" checked><span class="slider-switch"></span></label>
                    </div>
                    <div class="feature-desc">Revive teammate instantly.</div>
                </div>
            </div>
            <div id="manage-screen" class="screen">
                <div class="feature-card">
                    <div style="font-size:8px; color:#888;">THIS DEVICE</div>
                    <div id="manage-device-name" style="font-size:12px; font-weight:bold; margin:4px 0;">-</div>
                    <button class="action-btn" onclick="resetDevice()" style="background:#1a1a1a; color:#fff; border:1px solid #333; font-size:11px;">RESET DEVICE HWID</button>
                </div>
                <button class="action-btn" onclick="logout()" style="background:#3a1515; color:#ff6b6b; font-size:12px;">LOG OUT</button>
            </div>