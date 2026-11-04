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
)`);// ----------------- ROUTES: Index (Login) & Home -----------------

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Panel - Login</title>
    <style>
      :root { --bg-color: #0b0c10; --card-bg: #14161d; --text-muted: #8e94a0; --border-color: #242834; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background-color: var(--bg-color); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      .login-container { width: 100%; max-width: 380px; background: var(--card-bg); border: 1px solid var(--border-color); padding: 30px; border-radius: 12px; text-align: center; }
      h2 { font-size: 18px; font-weight: 900; margin-bottom: 8px; letter-spacing: 1px; }
      p { font-size: 10px; color: var(--text-muted); margin-bottom: 20px; letter-spacing: 1px; }
      input { width: 100%; padding: 12px; background: var(--bg-color); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; font-size: 12px; margin-bottom: 15px; outline: none; text-align: center; font-family: monospace; }
      button { background: #fff; color: #000; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: 800; cursor: pointer; letter-spacing: 1px; }
    </style>
  </head>
  <body>
    <div class="login-container">
      <h2>DRAKE PANEL</h2>
      <p>ENTER YOUR LICENSE KEY TO CONTINUE</p>
      <input type="text" id="key-input" placeholder="DRKE-XXXX-XXXX-XXXX">
      <button onclick="verifyKey()">UNLOCK PANEL</button>
    </div>
    <script>
      function verifyKey() {
        const key = document.getElementById('key-input').value.trim();
        if(!key) { alert("Please enter a key!"); return; }
        fetch('/api/verify-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key })
        })
        .then(res => res.json())
        .then(data => {
          if(data.success) {
            localStorage.setItem('drake_active_key', key);
            window.location.href = '/home';
          } else {
            alert(data.message || "Invalid or expired key!");
          }
        });
      }
    </script>
  </body>
  </html>`);
});

app.get('/home', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Panel - Home</title>
    <style>
      :root { --bg-color: #0b0c10; --card-bg: #14161d; --text-muted: #8e94a0; --border-color: #242834; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background-color: var(--bg-color); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      .app-container { width: 100%; max-width: 420px; height: 100vh; max-height: 850px; background: var(--bg-color); border: 1px solid var(--border-color); display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .header { padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); font-size: 14px; font-weight: 900; letter-spacing: 1px; }
      .header-right { display: flex; align-items: center; gap: 15px; font-size: 11px; color: var(--text-muted); }
      .content { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 80px; }
      .status-bar { display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--text-muted); margin-bottom: 10px; font-weight: bold; }
      .timer-section { text-align: center; margin: 10px 0 20px 0; position: relative; padding: 30px 0; background: radial-gradient(circle, rgba(20,22,29,0.6) 0%, rgba(11,12,16,0) 70%); }
      .dial-ring { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 220px; height: 220px; border: 1px dashed rgba(142, 148, 160, 0.3); border-radius: 50%; pointer-events: none; }
      .skull-icon { font-size: 40px; margin-bottom: 2px; }
      .timer-val { font-size: 32px; font-weight: 900; letter-spacing: 1.5px; margin-top: 2px; }
      .timer-label { font-size: 9px; color: var(--text-muted); letter-spacing: 1.5px; margin-top: 4px; font-weight: bold; }
      .key-box { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-family: monospace; font-size: 12px; }
      .copy-btn { background: #1f232d; border: 1px solid var(--border-color); color: #fff; padding: 6px 14px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr 1.1fr; gap: 8px; margin-bottom: 20px; }
      .info-card { background: var(--card-bg); border: 1px solid var(--border-color); padding: 12px 8px; border-radius: 8px; text-align: left; }
      .info-card label { display: block; font-size: 8px; color: var(--text-muted); margin-bottom: 6px; font-weight: bold; }
      .info-card span { font-size: 10px; font-weight: bold; color: #fff; word-break: break-word; display: block; }
      .sub-btn { background: var(--card-bg); border: 1px solid var(--border-color); padding: 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-top: 10px; }
      .sub-btn-title { font-size: 13px; font-weight: 900; color: #fff; }
      .sub-btn-sub { font-size: 9px; color: var(--text-muted); margin-top: 3px; }
      .plus-icon { background: #1f232d; border: 1px solid var(--border-color); color: #fff; width: 32px; height: 32px; border-radius: 6px; display: flex; justify-content: center; align-items: center; font-size: 16px; font-weight: bold; }
      .nav-bar { position: absolute; bottom: 0; width: 100%; height: 65px; background: var(--bg-color); border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; align-items: center; }
      .nav-item { color: var(--text-muted); font-size: 10px; font-weight: 700; text-decoration: none; cursor: pointer; letter-spacing: 1px; }
      .nav-item.active { color: #fff; }
    </style>
  </head>
  <body>
  <div class="app-container">
    <div class="header"><span>HOME</span><div class="header-right"><span>🔔</span><span>EN</span></div></div>
    <div class="content">
      <div class="status-bar"><span>■ OFFLINE</span><span>LAST REFRESHED JUST NOW</span></div>
      <div class="timer-section"><div class="dial-ring"></div><div class="skull-icon">💀</div><div class="timer-val" id="time-left">LOADING...</div><div class="timer-label">TIME LEFT</div></div>
      <div class="key-box"><span>KEY <strong id="current-key" style="margin-left:5px;">LOADING...</strong></span><button class="copy-btn" onclick="copyKey()">COPY</button></div>
      <div class="info-grid">
        <div class="info-card"><label>ACTIVATED</label><span id="activated-date">--</span></div>
        <div class="info-card"><label>EXPIRES</label><span id="expires-date">--</span></div>
        <div class="info-card"><label>DEVICE</label><span id="device-name">Detecting...</span></div>
      </div>
      <div class="sub-btn" onclick="openHappApp()">
        <div><div class="sub-btn-title">ADD SUBSCRIPTION</div><div class="sub-btn-sub">opens your vpn app with your key ready</div></div>
        <div class="plus-icon">+</div>
      </div>
    </div>
    <div class="nav-bar">
      <a href="/home" class="nav-item active">HOME</a>
      <a href="/features" class="nav-item">FEATURES</a>
      <a href="/manage" class="nav-item">MANAGE</a>
    </div>
  </div>
  <script>
    let expiryTimestamp = null;

    window.onload = function() {
      detectDevice();
      const savedKey = localStorage.getItem('drake_active_key');
      if (savedKey) { document.getElementById('current-key').innerText = savedKey; fetchSessionDetails(savedKey); }
      else { window.location.href = '/'; }
    };

    function detectDevice() {
      const ua = navigator.userAgent;
      let device = "Mobile Device";
      if (/android/i.test(ua)) {
        let match = ua.match(/;\s*([^;]+)\s+Build\//);
        device = match ? match[1] + " · Android" : "Android Device";
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        device = "iOS · iPhone";
      }
      document.getElementById('device-name').innerText = device;
    }

    function fetchSessionDetails(key) {
      fetch('/api/session-info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key }) })
      .then(res => res.json()).then(data => {
        if (data.success) {
          document.getElementById('activated-date').innerText = new Date(data.activated_at).toLocaleDateString();
          document.getElementById('expires-date').innerText = new Date(data.expires_at).toLocaleDateString();
          expiryTimestamp = new Date(data.expires_at).getTime();
          startLiveTimer();
        } else {
          alert(data.message);
          localStorage.removeItem('drake_active_key');
          window.location.href = '/';
        }
      });
    }

    function startLiveTimer() {
      setInterval(() => {
        if (!expiryTimestamp) return;
        const now = new Date().getTime();
        const distance = expiryTimestamp - now;
        if (distance < 0) {
          document.getElementById('time-left').innerText = "EXPIRED";
          return;
        }
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById('time-left').innerText = \`\${hours}H \${minutes}M \${seconds}S\`;
      }, 1000);
    }

    function copyKey() { navigator.clipboard.writeText(document.getElementById('current-key').innerText); alert("Key copied!"); }
    function openHappApp() {
      const key = document.getElementById('current-key').innerText;
      if(!key || key === "LOADING...") { alert("No active key!"); return; }
      window.location.href = 'happ://add?key=' + key + '&server=drake-panel';
    }
  </script>
  </body>
  </html>`);
});// ----------------- ROUTE: Features Page -----------------

app.get('/features', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Panel - Features</title>
    <style>
      :root { --bg-color: #0b0c10; --card-bg: #14161d; --text-muted: #8e94a0; --border-color: #242834; --accent-red: #ff3b30; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background-color: var(--bg-color); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      .app-container { width: 100%; max-width: 420px; height: 100vh; max-height: 850px; background: var(--bg-color); border: 1px solid var(--border-color); display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .header { padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); font-size: 14px; font-weight: 700; }
      .content { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 80px; }
      .feature-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; margin-bottom: 15px; }
      .feature-header { display: flex; justify-content: space-between; align-items: center; }
      .feature-title { font-size: 14px; font-weight: 800; }
      .feature-desc { font-size: 11px; color: var(--text-muted); margin-top: 6px; line-height: 1.4; }
      .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #1a1d26; transition: .4s; border-radius: 24px; border: 1px solid var(--border-color); }
      .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #fff; }
      input:checked + .slider:before { transform: translateX(20px); background-color: #000; }
      .sub-section-title { font-size: 10px; color: var(--text-muted); font-weight: 700; margin: 15px 0 8px 0; letter-spacing: 1px; }
      .grid-btns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
      .opt-btn { background: #0b0c10; border: 1px solid var(--border-color); color: var(--text-muted); padding: 10px 4px; font-size: 10px; font-weight: 700; text-align: center; border-radius: 6px; cursor: pointer; }
      .opt-btn.active { background: #fff; color: #000; border-color: #fff; }
      .aim-section { display: flex; gap: 15px; margin-top: 15px; align-items: center; }
      .body-silhouette { width: 110px; height: 160px; background: #0b0c10; border: 1px solid var(--border-color); border-radius: 8px; position: relative; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 10px; overflow: hidden; }
      .target-head { position: absolute; top: 15px; width: 32px; height: 35px; border: 1px dashed var(--accent-red); background: rgba(255, 59, 48, 0.2); border-radius: 50% 50% 40% 40%; display: flex; justify-content: center; align-items: center; }
      .height-slider-col { flex: 1; display: flex; flex-direction: column; justify-content: center; }
      .height-labels { display: flex; flex-direction: column; gap: 6px; font-size: 10px; color: var(--text-muted); }
      .height-labels div { display: flex; justify-content: space-between; padding-bottom: 4px; border-bottom: 1px solid #1f232d; }
      .height-labels div.active-level { color: #fff; font-weight: bold; border-color: var(--accent-red); }
      .range-slider { width: 100%; accent-color: #fff; background: #333; height: 4px; border-radius: 2px; outline: none; margin-top: 12px; }
      .sub-toggle-row { display: flex; gap: 10px; margin-top: 12px; }
      .sub-toggle-box { background: #0b0c10; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 11px; flex: 1; display: flex; justify-content: space-between; align-items: center; }
      .nav-bar { position: absolute; bottom: 0; width: 100%; height: 65px; background: var(--bg-color); border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; align-items: center; }
      .nav-item { color: var(--text-muted); font-size: 10px; text-align: center; font-weight: 700; text-decoration: none; cursor: pointer; }
      .nav-item.active { color: #fff; }
    </style>
  </head>
  <body>
  <div class="app-container">
    <div class="header"><span>FEATURES</span><span>EN</span></div>
    <div class="content">
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 15px;">changes apply from your next match <span style="float: right; color: #fff; font-weight: bold;">5/5</span></div>
      <div class="feature-card">
        <div class="feature-header"><span class="feature-title">01 MARKER</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        <div class="feature-desc">marks every enemy on your screen.</div>
        <div class="sub-section-title">MARK STYLE</div>
        <div class="grid-btns">
          <div class="opt-btn active" onclick="setOpt(this)">PHANTOM</div>
          <div class="opt-btn" onclick="setOpt(this)">DREAM</div>
          <div class="opt-btn" onclick="setOpt(this)">ICE WALL</div>
          <div class="opt-btn" onclick="setOpt(this)">MOCO</div>
          <div class="opt-btn" onclick="setOpt(this)">CLU</div>
          <div class="opt-btn" onclick="setOpt(this)">SHIROU</div>
          <div class="opt-btn" onclick="setOpt(this)">IRIS</div>
          <div class="opt-btn" onclick="setOpt(this)">DREKI</div>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-header"><div><span class="feature-title">02 AIMPOINT</span><span style="font-size: 9px; background: #222; padding: 2px 5px; border-radius: 4px; margin-left: 5px; color: #aaa;">NEW</span></div><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        <div class="feature-desc">moves your aim from the chest toward the head. slide to choose how far.</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;"><span class="sub-section-title" style="margin:0;">AIM HEIGHT</span><span id="percentage-text" style="font-size: 18px; font-weight: 900; color: var(--accent-red);">100%</span></div>
        <div class="aim-section">
          <div class="body-silhouette"><div class="target-head">🎯</div><svg style="width:65px; opacity:0.8;" viewBox="0 0 24 24" fill="#666"><path d="M12 2a4 4 0 0 0-4 4c0 1.88 1.29 3.45 3 3.87V11c-3.31 0-6 2.69-6 6v1h2v-1c0-2.21 1.79-4 4-4s4 1.79 4 4v1h2v-1c0-3.31-2.69-6-6-6v-1.13c1.71-.42 3-1.99 3-3.87a4 4 0 0 0-4-4z"/></svg></div>
          <div class="height-slider-col">
            <div class="height-labels" id="height-labels-list">
              <div class="active-level"><span>HEAD</span> <span>100%</span></div>
              <div><span>NECK</span> <span>68%</span></div>
              <div><span>SHOULDERS</span> <span>50%</span></div>
              <div><span>UPPER CHEST</span> <span>30%</span></div>
              <div><span>CHEST</span> <span>0%</span></div>
            </div>
          </div>
        </div>
        <div style="margin-top: 15px;"><input type="range" min="0" max="100" value="100" class="range-slider" oninput="updateHeight(this.value)"></div>
      </div>
      <div class="feature-card">
        <div class="feature-header"><span class="feature-title">03 ESP ENEMY</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        <div class="feature-desc">displays advanced enemy information overlays on screen.</div>
        <div class="sub-toggle-row">
          <div class="sub-toggle-box"><span>Distance</span><label class="switch" style="transform: scale(0.7);"><input type="checkbox" checked><span class="slider"></span></label></div>
          <div class="sub-toggle-box"><span>Box ESP</span><label class="switch" style="transform: scale(0.7);"><input type="checkbox" checked><span class="slider"></span></label></div>
          <div class="sub-toggle-box"><span>Health</span><label class="switch" style="transform: scale(0.7);"><input type="checkbox" checked><span class="slider"></span></label></div>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-header"><span class="feature-title">04 AIM LAG</span><label class="switch"><input type="checkbox"><span class="slider"></span></label></div>
        <div class="feature-desc">freezes the enemy for a moment while you fire or scope.</div>
        <div class="sub-toggle-row" style="margin-top: 12px;">
          <div class="sub-toggle-box"><span>when firing</span><label class="switch" style="transform: scale(0.7);"><input type="checkbox"><span class="slider"></span></label></div>
          <div class="sub-toggle-box"><span>when scoping</span><label class="switch" style="transform: scale(0.7);"><input type="checkbox" checked><span class="slider"></span></label></div>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-header"><span class="feature-title">05 GLOO WALL ROTATION</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        <div class="feature-desc">turns your gloo wall to the angle you set.</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;"><span class="sub-section-title" style="margin:0;">WALL ANGLE</span><span style="font-size: 18px; font-weight: 900;">180°</span></div>
        <div style="margin-top: 10px;"><input type="range" min="-90" max="180" value="180" class="range-slider"></div>
        <div class="grid-btns" style="margin-top: 12px;">
          <div class="opt-btn" onclick="setOpt(this)">-90°</div>
          <div class="opt-btn" onclick="setOpt(this)">0°</div>
          <div class="opt-btn" onclick="setOpt(this)">+90°</div>
          <div class="opt-btn active" onclick="setOpt(this)">180°</div>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-header"><span class="feature-title">06 FAST REVIVE</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        <div class="feature-desc">picks up a knocked teammate in about 0.1 s instead of 3 s.</div>
      </div>
    </div>
    <div class="nav-bar">
      <a href="/home" class="nav-item">HOME</a>
      <a href="/features" class="nav-item active">FEATURES</a>
      <a href="/manage" class="nav-item">MANAGE</a>
    </div>
  </div>
  <script>
    function setOpt(el) { el.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); }
    function updateHeight(val) {
      document.getElementById('percentage-text').innerText = val + '%';
      const items = document.querySelectorAll('#height-labels-list div');
      items.forEach(i => i.classList.remove('active-level'));
      if(val >= 80) items[0].classList.add('active-level');
      else if(val >= 55) items[1].classList.add('active-level');
      else if(val >= 40) items[2].classList.add('active-level');
      else if(val >= 15) items[3].classList.add('active-level');
      else items[4].classList.add('active-level');
    }
  </script>
  </body>
  </html>`);
});// ----------------- ROUTES: Manage & Admin Pages -----------------

app.get('/manage', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Panel - Manage</title>
    <style>
      :root { --bg-color: #0b0c10; --card-bg: #14161d; --text-muted: #8e94a0; --border-color: #242834; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background-color: var(--bg-color); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      .app-container { width: 100%; max-width: 420px; height: 100vh; max-height: 850px; background: var(--bg-color); border: 1px solid var(--border-color); display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .header { padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); font-size: 14px; font-weight: 700; }
      .content { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 80px; }
      .card { background: var(--card-bg); border: 1px solid var(--border-color); padding: 20px; border-radius: 10px; margin-bottom: 15px; }
      .btn-danger { background: #ff3b30; color: #fff; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: 800; cursor: pointer; margin-top: 10px; text-align: center; display: block; text-decoration: none; }
      .btn-telegram { background: #0088cc; color: #fff; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: 800; cursor: pointer; margin-top: 10px; text-align: center; display: block; text-decoration: none; }
      .nav-bar { position: absolute; bottom: 0; width: 100%; height: 65px; background: var(--bg-color); border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; align-items: center; }
      .nav-item { color: var(--text-muted); font-size: 10px; text-align: center; font-weight: 700; text-decoration: none; cursor: pointer; }
      .nav-item.active { color: #fff; }
    </style>
  </head>
  <body>
  <div class="app-container">
    <div class="header"><span>MANAGE PANEL</span><span>EN</span></div>
    <div class="content">
      <div class="card">
        <h3 style="font-size: 14px; margin-bottom: 10px;">Session Control</h3>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 15px;">Logout or switch your active license key from this device.</p>
        <button class="btn-danger" onclick="logoutSession()">LOGOUT / REMOVE KEY</button>
      </div>
      <div class="card">
        <h3 style="font-size: 14px; margin-bottom: 10px;">Community Support</h3>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 15px;">Join our official channel for updates and keys.</p>
        <a href="https://t.me/your_telegram_channel" target="_blank" class="btn-telegram">JOIN TELEGRAM CHANNEL</a>
      </div>
    </div>
    <div class="nav-bar">
      <a href="/home" class="nav-item">HOME</a>
      <a href="/features" class="nav-item">FEATURES</a>
      <a href="/manage" class="nav-item active">MANAGE</a>
    </div>
  </div>
  <script>
    function logoutSession() {
      localStorage.removeItem('drake_active_key');
      alert("Session logged out!");
      window.location.href = '/';
    }
  </script>
  </body>
  </html>`);
});

app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drake Admin - Bulk Generator</title>
    <style>
      :root { --bg-color: #0b0c10; --card-bg: #14161d; --text-muted: #8e94a0; --border-color: #242834; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background-color: var(--bg-color); color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
      .admin-box { background: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; width: 100%; max-width: 450px; display: none; }
      .login-box { background: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; width: 100%; max-width: 400px; text-align: center; }
      .title { font-size: 16px; font-weight: 900; letter-spacing: 1px; text-align: center; margin-bottom: 5px; }
      .subtitle { font-size: 10px; color: var(--text-muted); text-align: center; margin-bottom: 20px; letter-spacing: 1px; }
      .form-group { margin-bottom: 15px; text-align: left; }
      .form-group label { display: block; font-size: 10px; color: var(--text-muted); margin-bottom: 6px; font-weight: 700; }
      select, input { width: 100%; padding: 12px; background: var(--bg-color); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; font-size: 13px; outline: none; }
      .btn { background: #fff; color: #000; border: none; padding: 14px; width: 100%; border-radius: 8px; font-weight: 800; cursor: pointer; margin-top: 5px; letter-spacing: 1px; }
      .result-box { margin-top: 20px; background: var(--bg-color); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; color: #00ff66; line-height: 1.6; }
    </style>
  </head>
  <body>
  <div class="login-box" id="login-screen">
    <div class="title">ADMIN ACCESS</div>
    <div class="subtitle">ENTER PASSWORD TO CONTINUE</div>
    <div class="form-group"><label>ADMIN PASSWORD</label><input type="password" id="admin-pass" placeholder="Enter password..."></div>
    <button class="btn" onclick="checkPassword()">LOGIN</button>
  </div>
  <div class="admin-box" id="admin-panel">
    <div class="title">DRAKE BULK ADMIN</div>
    <div class="subtitle">GENERATE MULTIPLE KEYS AT ONCE</div>
    <div class="form-group">
      <label>SELECT KEY DURATION</label>
      <select id="duration-select">
        <option value="1">1 Hour</option>
        <option value="24" selected>1 Day (24 Hours)</option>
        <option value="168">7 Days (1 Week)</option>
        <option value="720">30 Days (1 Month)</option>
      </select>
    </div>
    <div class="form-group">
      <label>NUMBER OF KEYS TO GENERATE</label>
      <select id="count-select">
        <option value="1">1 Key</option>
        <option value="10">10 Keys</option>
        <option value="20">20 Keys</option>
        <option value="30">30 Keys</option>
        <option value="40">40 Keys</option>
        <option value="50">50 Keys</option>
        <option value="60">60 Keys</option>
      </select>
    </div>
    <button class="btn" onclick="generateKeys()">GENERATE BULK KEYS</button>
    <div class="result-box" id="result-keys">Generated keys will appear here...</div>
  </div>
  <script>
    const ADMIN_PASSWORD = "admin";
    function checkPassword() {
      if (document.getElementById('admin-pass').value === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
      } else { alert("Incorrect Password!"); }
    }
    function generateKeys() {
      const duration = parseInt(document.getElementById('duration-select').value);
      const count = parseInt(document.getElementById('count-select').value);
      fetch('/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: duration, count: count })
      })
      .then(res => res.json()).then(data => {
        if (data.success) { document.getElementById('result-keys').innerHTML = data.keys.join('<br>'); }
        else { alert("Error generating keys!"); }
      });
    }
  </script>
  </body>
  </html>`);
});// ----------------- API ENDPOINTS: Bulk Key Generation & Verification -----------------

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
});// ----------------- API ENDPOINTS: Session Info & Server Start -----------------

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