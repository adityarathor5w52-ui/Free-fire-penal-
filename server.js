<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DRAKE PANEL</title>
  <style>
    :root {
      --bg-color: #0b0c10;
      --card-bg: #14161d;
      --accent-color: #ffffff;
      --text-muted: #8e94a0;
      --border-color: #242834;
      --red-accent: #ff3b30;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body {
      background-color: var(--bg-color);
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .app-container {
      width: 100%;
      max-width: 420px;
      height: 100vh;
      max-height: 850px;
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }.header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      padding-bottom: 80px;
    }

    .page { display: none; }
    .page.active { display: block; }

    .login-box { text-align: center; margin-top: 40px; }
    .logo-icon { font-size: 80px; margin-bottom: 10px; }
    .brand-title { font-size: 28px; font-weight: 900; letter-spacing: 2px; margin-bottom: 5px; }
    .sub-text { color: var(--text-muted); font-size: 11px; letter-spacing: 1px; margin-bottom: 40px; }

    .input-group {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex;
      padding: 6px;
      margin-bottom: 15px;
    }

    .input-group input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      padding: 10px;
      flex: 1;
      font-family: monospace;
    }

    .btn {
      background: #fff;
      color: #000;
      border: none;
      padding: 14px;
      width: 100%;
      border-radius: 8px;
      font-weight: 800;
      letter-spacing: 1px;
      cursor: pointer;
    }

    .status-badge { display: inline-block; padding: 4px 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; font-size: 10px; color: var(--text-muted); margin-bottom: 20px; }
    .timer-circle { text-align: center; margin: 30px 0; }
    .timer-val { font-size: 36px; font-weight: 900; letter-spacing: 2px; }

    .key-info-box {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-family: monospace;
      font-size: 13px;
    }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .info-card { background: var(--card-bg); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; text-align: center; }
    .info-card label { display: block; font-size: 9px; color: var(--text-muted); margin-bottom: 4px; }
    .info-card span { font-size: 11px; font-weight: bold; }

    .sub-btn { background: #fff; color: #000; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-weight: 800; cursor: pointer; }

    .feature-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 15px; }
    .feature-header { display: flex; justify-content: space-between; align-items: center; }
    .feature-title { font-size: 16px; font-weight: 800; }
    .feature-desc { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #fff; }
    input:checked + .slider:before { transform: translateX(20px); background-color: #000; }

    .nav-bar { position: absolute; bottom: 0; width: 100%; height: 65px; background: var(--bg-color); border-top: 1px solid var(--border-color); display: flex; justify-content: space-around; align-items: center; }
    .nav-item { color: var(--text-muted); font-size: 10px; text-align: center; text-decoration: none; cursor: pointer; font-weight: 700; letter-spacing: 1px; }
    .nav-item.active { color: #fff; }
  </style>
</head><body>
<div class="app-container">
  <div class="header">
    <span id="header-title">DRAKE PANEL</span>
    <span>EN</span>
  </div>

  <div class="content">
    <!-- 1. LOGIN PAGE -->
    <div id="login-page" class="page active">
      <div class="login-box">
        <div class="logo-icon">💀</div>
        <div class="brand-title">DRAKE</div>
        <div class="sub-text">NO ACCOUNT. NO PASSWORD. JUST YOUR KEY.</div>

        <div class="input-group">
          <input type="text" id="access-key" placeholder="DRKE-XXXX-XXXX-XXXX">
        </div>

        <button class="btn" onclick="login()">UNLOCK</button><!-- 2. HOME PAGE -->
    <div id="home-page" class="page">
      <div class="status-badge">■ ONLINE</div>
      
      <div class="timer-circle">
        <div class="logo-icon" style="font-size: 50px;">💀</div>
        <div class="timer-val">02H 11M</div>
        <div style="font-size: 10px; color: var(--text-muted);">TIME LEFT</div>
      </div>

      <div class="key-info-box">
        <span>KEY: <strong id="user-key">DRKE-E9E0-1A89-A3E7</strong></span>
        <span style="cursor:pointer;" onclick="navigator.clipboard.writeText('DRKE-E9E0-1A89-A3E7')">COPY</span>
      </div>

      <div class="info-grid">
        <div class="info-card"><label>ACTIVATED</label><span>03 Nov 2026</span></div>
        <div class="info-card"><label>EXPIRES</label><span>04 Nov 2026</span></div>
        <div class="info-card"><label>DEVICE</label><span>Android / PC</span></div>
      </div>

      <div class="sub-btn">
        <div>
          <div>ADD SUBSCRIPTION</div>
          <div style="font-size: 9px; opacity: 0.7;">opens panel with your key ready</div>
        </div>
        <span style="font-size: 20px;">+</span>
      </div>
    </div>

    <!-- 3. FEATURES PAGE -->
    <div id="features-page" class="page">
      <h3 style="margin-bottom: 15px;">FEATURES</h3>

      <div class="feature-card">
        <div class="feature-header">
          <span class="feature-title">01 MARKER (ESP)</span>
          <label class="switch"><input type="checkbox"><span class="slider"></span></label>
        </div>
        <div class="feature-desc">marks every enemy on your screen.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span class="feature-title">02 AIMPOINT (HEADLOCK)</span>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <div class="feature-desc">moves your aim from chest toward head.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span class="feature-title">03 AIM LAG</span>
          <label class="switch"><input type="checkbox"><span class="slider"></span></label>
        </div>
        <div class="feature-desc">freezes enemy momentarily while scoping/firing.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span class="feature-title">04 GLOO WALL ROTATION</span>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <div class="feature-desc">turns your gloo wall to 180° angle automatically.</div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <span class="feature-title">05 FAST REVIVE</span>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <div class="feature-desc">picks up knocked teammate in ~0.1s.</div>
      </div>
    </div><!-- 4. MANAGE PAGE -->
    <div id="manage-page" class="page">
      <h3 style="margin-bottom: 15px;">MANAGE</h3>
      
      <div class="feature-card">
        <div style="font-size: 11px; color: var(--text-muted);">THIS DEVICE</div>
        <h4 style="margin: 5px 0 10px 0;">CONNECTED DEVICE</h4>
        <div style="font-size: 10px; color: var(--text-muted);">LOCKED TO THIS KEY</div>
      </div>

      <div class="feature-card">
        <h4>UPDATE NOTES</h4>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">V1.7 Aim Lag & Gloo Wall angle improvements added.</p>
      </div>
    </div>

  </div>

  <!-- Bottom Navigation -->
  <div class="nav-bar" id="bottom-nav" style="display: none;">
    <div class="nav-item active" onclick="switchTab('home-page', this)">HOME</div>
    <div class="nav-item" onclick="switchTab('features-page', this)">FEATURES</div>
    <div class="nav-item" onclick="switchTab('manage-page', this)">MANAGE</div>
  </div>
</div>

<script>
  function login() {
    const key = document.getElementById('access-key').value;
    if (key.trim() !== "") {
      document.getElementById('user-key').innerText = key;
      document.getElementById('login-page').classList.remove('active');
      document.getElementById('home-page').classList.add('active');
      document.getElementById('bottom-nav').style.display = 'flex';
    } else {
      alert("Please enter a valid key!");
    }
  }

  function switchTab(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    element.classList.add('active');
  }
</script>

</body>
</html>