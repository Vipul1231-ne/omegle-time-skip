

// ==UserScript==
// @name         Omegle Time-Skip Automation
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Auto-skip strangers on Omegle after a configurable time limit
// @author       You
// @match        https://ome.tv/*
// @match        https://ome.tv/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==
// ==UserScript==
// @name        Omegle Time-Skip Automation
// @namespace   http://tampermonkey.net/
// @version     1.0.0
// @description Auto-skip strangers on Omegle after a configurable time limit
// @author      You
// @match       https://www.omegle.com/*
// @match       https://omegle.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @run-at      document-end
// ==/UserScript==

(function () {
  'use strict';

  // CONFIG — edit these defaults
  const CFG = {
    skipAfter: GM_getValue('skipAfter', 30), // seconds before auto-skip
    warnAt: GM_getValue('warnAt', 10), // seconds left → warning colour
    skipDelay: GM_getValue('skipDelay', 1.0), // seconds to wait after skip fires
    autoMode: GM_getValue('autoMode', true), // false = timer HUD only, no auto-skip
  };

  let timer = null;
  let elapsed = 0;
  let skipPending = false;
  let sessionTotal = 0;

  // Inject HUD
  const hud = document.createElement('div');
  hud.id = 'ts-hud';
  Object.assign(hud.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '999999',
    background: 'rgba(15,15,15,0.88)',
    color: '#e8e8e8',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '13px',
    borderRadius: '10px',
    padding: '12px 16px',
    minWidth: '180px',
    backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    userSelect: 'none',
    lineHeight: '1.6',
  });

  function btnStyle(bg) {
    return `flex:1;padding:5px 0;border:none;border-radius:6px;background:${bg};color:#fff;font-size:12px;font-weight:600;cursor:pointer;`;
  }

  hud.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;font-size:14px;letter-spacing:0.02em;">Time-Skip</span>
      <span id="ts-dot" style="width:8px;height:8px;border-radius:50%;background:#555;display:inline-block;"></span>
    </div>
    <div style="margin-bottom:6px;">
      <span style="color:#888;">Remaining</span>
      <span id="ts-time" style="float:right;font-weight:600;font-size:16px;">--</span>
    </div>
    <div style="margin-bottom:10px;">
      <span style="color:#888;">Skipped</span>
      <span id="ts-count" style="float:right;">0</span>
    </div>
    <div style="display:flex;gap:6px;">
      <button id="ts-skip-btn" style="${btnStyle('#c0392b')}">Skip now</button>
      <button id="ts-toggle-btn" style="${btnStyle('#2d7d46')}">${CFG.autoMode ? 'Auto ON' : 'Auto OFF'}</button>
    </div>
    <div style="margin-top:8px;font-size:11px;color:#555;">
      Limit: <span id="ts-cfg-display">${CFG.skipAfter}s</span>
    </div>
  `;
  document.body.appendChild(hud);

  const $time = () => document.getElementById('ts-time');
  const $dot = () => document.getElementById('ts-dot');
  const $count = () => document.getElementById('ts-count');
  const $toggle = () => document.getElementById('ts-toggle-btn');

  document.getElementById('ts-skip-btn').addEventListener('click', () => triggerSkip('manual'));
  document.getElementById('ts-toggle-btn').addEventListener('click', () => {
    CFG.autoMode = !CFG.autoMode;
    GM_setValue('autoMode', CFG.autoMode);
    $toggle().textContent = CFG.autoMode ? 'Auto ON' : 'Auto OFF';
    $toggle().style.background = CFG.autoMode ? '#2d7d46' : '#555';
  });

  // Find the skip/stop button on Omegle
  function findSkipButton() {
    const candidates = Array.from(document.querySelectorAll('button, input[type=button]'));
    return (
      candidates.find(el => /stop/i.test(el.textContent)) ||
      candidates.find(el => /next|new/i.test(el.textContent)) ||
      null
    );
  }

  function clickSkip() {
    const btn = findSkipButton();
    if (!btn) return false;
    btn.click();
    setTimeout(() => {
      const confirm = Array.from(document.querySelectorAll('button'))
        .find(el => /yes|confirm|new/i.test(el.textContent));
      if (confirm) confirm.click();
    }, 400);
    return true;
  }

  // Watch for new conversation starting
  function watchForNewConversation() {
    const observer = new MutationObserver(() => {
      const log = document.querySelector('.logitem, .statuslog, #logdiv');
      if (!log) return;
      const connected = Array.from(log.querySelectorAll('*')).some(el =>
        /you're now chatting|stranger has connected/i.test(el.textContent)
      );
      if (connected && !timer) startTimer();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Timer
  function startTimer() {
    elapsed = 0;
    skipPending = false;
    setDot('green');
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
    timer = null;
    setDisplay('--');
    setDot('idle');
  }

  function tick() {
    elapsed++;
    const remaining = CFG.skipAfter - elapsed;
    setDisplay(remaining);
    if (remaining <= CFG.warnAt) setDot('amber');
    if (remaining <= 3) setDot('red');
    if (remaining <= 0 && CFG.autoMode && !skipPending) triggerSkip('auto');
  }

  function triggerSkip(reason) {
    if (skipPending) return;
    skipPending = true;
    stopTimer();
    setDot('red');
    setTimeout(() => {
      const ok = clickSkip();
      if (ok) {
        sessionTotal++;
        $count().textContent = sessionTotal;
        console.log(`[Omegle-TS] [${reason}] skipped after ${elapsed}s — total: ${sessionTotal}`);
      }
      skipPending = false;
    }, CFG.skipDelay * 1000);
  }

  // HUD helpers
  function setDisplay(val) {
    const el = $time();
    if (!el) return;
    el.textContent = val === '--' ? '--' : String(Math.max(0, val)) + 's';
    el.style.color = (val !== '--' && val <= CFG.warnAt) ? '#e67e22' : '#e8e8e8';
    if (val !== '--' && val <= 3) el.style.color = '#e74c3c';
  }

  const dotColors = { green: '#27ae60', amber: '#e67e22', red: '#e74c3c', idle: '#555' };
  function setDot(state) {
    const d = $dot();
    if (d) d.style.background = dotColors[state] || dotColors.idle;
  }

  // Boot
  document.getElementById('ts-cfg-display').textContent = CFG.skipAfter + 's';
  watchForNewConversation();
  console.log('[Omegle-TS] Loaded. Watching for conversations...');

})();