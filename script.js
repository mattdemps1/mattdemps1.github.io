/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ══════════════════════════════════════════════════════
   DEMO 1 — MOLECULAR BIT: drug dosage split-panel
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const canvas    = document.getElementById('mbCanvas');
  if (!canvas) return;
  const ctx       = canvas.getContext('2d');
  const btnTrad   = document.getElementById('btnTrad');
  const btnMol    = document.getElementById('btnMol');
  const holdBtn   = document.getElementById('holdBtn');
  const statusLbl = document.getElementById('mbStateLabel');

  const W = 840, H = 420, MID = W / 2;

  const TEAL  = '#3DD9C0';
  const RED   = '#E55A50';
  const MUTED = '#4C6A8D';
  const TEXT  = '#E8ECF0';
  const BG    = '#0F1722';
  const WARM_BG   = '#0F1722';
  const WARM_NAVY = '#E8ECF0';
  const WARM_RED  = '#E55A50';
  const WARM_TEAL = '#3DD9C0';

  // SVG path from male_silhouette_exact.svg — matches web-molecularbit/index.html
  const FIG_PATH = new Path2D('m84.25 34c-1.79 1.1-3.88 3.46-4.64 5.25-0.76 1.79-1.72 7.3-2.12 12.25-0.61 7.59-0.47 9.27 0.89 10.75 0.89 0.96 1.63 2.09 1.63 2.5 0.01 0.41 0.97 2.78 2.13 5.25 1.22 2.61 1.84 5.34 1.47 6.5-0.34 1.1-2.76 3.55-5.37 5.45-2.61 1.9-8.34 4.92-12.74 6.73-4.4 1.8-9.24 4.18-10.75 5.3-1.51 1.11-3.97 4.61-5.47 7.77-2.61 5.5-2.76 6.68-3.45 27.25-0.4 11.82-1.18 23.53-1.74 26-0.55 2.47-1.02 12.49-1.05 22.25-0.02 9.76-0.51 19.89-1.09 22.5-0.73 3.32-0.72 6.71 0.02 11.25 0.63 3.89 1.83 7.3 2.98 8.5 1.06 1.1 3.31 2.79 4.99 3.75 2.66 1.52 3.13 1.55 3.56 0.25 0.28-0.82-0.4-2.85-1.5-4.5-1.1-1.65-2.01-4.46-2.03-6.25-0.01-1.79 0.32-3.61 0.75-4.05 0.43-0.43 1.47 1.14 2.31 3.5 0.86 2.43 2.17 4.3 3 4.3 1.06 0 1.45-1.11 1.39-4-0.04-2.2-0.63-6.7-1.31-10-0.67-3.3-1.48-7.35-1.79-9-0.33-1.78 0.71-8.08 2.55-15.5 1.95-7.84 3.67-18.56 4.62-28.75 0.83-8.94 1.55-16.59 1.6-17 0.04-0.41 0.48 0.6 0.97 2.25 0.49 1.65 1.4 10.2 2.02 19 1.1 15.34 1.05 16.37-1.12 25-1.7 6.73-2.38 12.9-2.72 24.5-0.26 8.53 0.02 21.35 0.61 28.5 0.59 7.15 1.8 16.15 2.68 20 1.17 5.07 1.59 11.75 1.54 24.25-0.05 11.65 0.4 19.28 1.36 23.5 0.79 3.44 2.15 10.98 3.01 16.75 0.86 5.77 1.57 11.96 1.57 13.75-0.01 1.94-1.22 5.07-3.01 7.75-1.65 2.48-3 5.4-3 6.5 0 1.1 0.67 2.23 1.5 2.5 0.83 0.27 5.01 0.5 9.3 0.5 4.92 0 8.25-0.46 9.02-1.25 0.67-0.69 1.21-2.26 1.2-3.5-0.01-1.24-0.76-4.84-1.66-8-1.37-4.79-1.5-7.85-0.8-18.25 0.46-6.88 0.89-21.27 0.95-32 0.06-11.09 0.63-21.87 1.32-25 0.66-3.02 1.9-12.93 2.76-22 0.86-9.07 1.89-18.07 2.3-20 0.56-2.64 1.18 0.9 2.54 14.5 0.98 9.9 2.59 23.18 3.56 29.5 1.27 8.2 1.62 14.65 1.25 22.5-0.29 6.05 0.07 18.2 0.79 27 1.18 14.44 1.15 16.63-0.37 22.5-0.92 3.57-1.68 7.63-1.69 9 0 1.38 0.57 3.07 1.26 3.77 0.81 0.8 4.18 1.27 9.27 1.29 6.19 0.02 8.34-0.34 9.5-1.62 1.34-1.48 1.29-1.99-0.43-4.8-1.05-1.73-2.77-4.71-3.8-6.64-1.79-3.35-1.8-3.95-0.27-14 0.87-5.77 2.46-14.77 3.51-20 1.51-7.45 1.89-13.17 1.75-26.5-0.13-13.1 0.22-18.49 1.51-23.5 0.92-3.57 2.19-14.38 2.82-24 0.63-9.63 0.91-21.78 0.61-27-0.3-5.22-1.48-13.32-2.62-18-1.13-4.68-2.07-11.88-2.08-16-0.01-4.13 0.54-13.02 1.24-19.76 0.69-6.74 1.6-12.25 2.01-12.25 0.41 0.01 0.76 1.02 0.77 2.26 0.01 1.24 0.65 8.78 1.41 16.75 0.84 8.76 2.66 19.44 4.58 27 2.78 10.87 3.05 13.02 2.08 16.5-0.61 2.2-1.71 6.93-2.44 10.5-0.88 4.27-1.02 7.36-0.42 9l0.91 2.5c3.06-3.87 3.93-5.79 3.9-6.75-0.02-0.96 0.41-1.97 0.96-2.25 0.55-0.28 1.22 0.18 1.5 1 0.28 0.82 0.5 2.4 0.5 3.5 0 1.1-1.01 3.78-2.25 5.95q-2.24 3.95-1.25 4.94c0.66 0.64 2.63-0.2 5.75-2.46 4.21-3.04 4.82-3.97 5.41-8.18 0.36-2.61 0.09-10.6-0.59-17.75-0.69-7.15-0.96-16.6-0.6-21 0.37-4.63 0.15-11.16-0.52-15.5-0.64-4.13-1.5-17.18-1.91-29-0.6-17.17-1.13-22.51-2.61-26.5-1.03-2.75-3.23-6.36-4.9-8.03-1.66-1.67-6.18-4.24-10.03-5.72-3.85-1.48-9.81-4.5-13.25-6.72-3.44-2.22-6.65-5.04-7.13-6.28-0.62-1.6-0.34-3.33 1-6 1.03-2.06 1.86-4.31 1.84-5-0.03-0.69 0.67-1.92 1.54-2.75 0.88-0.83 1.84-3.08 2.15-5 0.31-1.92 0.11-4.4-0.43-5.5-0.55-1.1-1.04-4.14-1.11-6.75-0.06-2.61-0.79-6.1-1.61-7.75-0.85-1.7-3.02-3.65-5-4.5-1.93-0.83-5.86-1.5-8.75-1.5q-5.25 0.01-8.5 2z');

  function hexRgb(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
  function rgba(hex, a) { const [r,g,b] = hexRgb(hex); return `rgba(${r},${g},${b},${+a.toFixed(3)})`; }
  function lerpN(a, b, t) { return a + (b - a) * t; }
  function lerpRgb(rgb1, rgb2, t) { return [Math.round(lerpN(rgb1[0],rgb2[0],t)), Math.round(lerpN(rgb1[1],rgb2[1],t)), Math.round(lerpN(rgb1[2],rgb2[2],t))]; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  const TOXIC_TH = 0.72;
  const SUB_TH   = 0.35;

  let mode = 'traditional', held = false, activation = 0, drugLevel = 0, tradTime = 0, toxicSev = 0, subSev = 0;
  let started = false;

  const GRAPH_N = 220;
  const graph   = new Float32Array(GRAPH_N);
  let graphHead = 0;

  holdBtn.addEventListener('mousedown',  e => { e.preventDefault(); setHeld(true); });
  document.addEventListener('mouseup',   () => { if (held) setHeld(false); });
  holdBtn.addEventListener('touchstart', e => { e.preventDefault(); setHeld(true); }, { passive: false });
  document.addEventListener('touchend',  () => { if (held) setHeld(false); });
  canvas.addEventListener('mousedown',   e => { e.preventDefault(); setHeld(true); });
  canvas.addEventListener('touchstart',  e => { e.preventDefault(); setHeld(true); }, { passive: false });

  function setHeld(v) {
    if (!started && v) {
      started = true;
      lastTs = null;
      holdBtn.className = 'hold-btn hidden';
      return;
    }
    if (mode !== 'molecular') return;
    held = v;
    holdBtn.classList.toggle('active', v);
  }

  btnTrad.addEventListener('click', () => setMode('traditional'));
  btnMol.addEventListener('click',  () => setMode('molecular'));

  function setMode(m) {
    mode = m; held = false; activation = 0; drugLevel = 0;
    tradTime = 0; toxicSev = 0; subSev = 0;
    graph.fill(0); graphHead = 0;
    holdBtn.classList.remove('active');
    btnTrad.className = 'mode-btn' + (m === 'traditional' ? ' trad' : '');
    btnMol.className  = 'mode-btn' + (m === 'molecular'   ? ' mol'  : '');
    if (m === 'molecular') {
      started = true; lastTs = null;
      holdBtn.textContent = 'Hold — Apply Field';
      holdBtn.className = 'hold-btn';
    } else {
      started = false;
      holdBtn.textContent = 'Start';
      holdBtn.className = 'hold-btn';
    }
  }

  function pkLevel(t) {
    if (t <= 0) return 0;
    const tPeak = 20;
    const rise  = 1 - Math.exp(-0.5 * t);
    const fall  = t < tPeak ? 1 : Math.exp(-1.0 * Math.pow(t - tPeak, 2));
    const drift = 1 - 0.025 * Math.sin(t * 0.65);
    return clamp(0.94 * rise * fall * drift, 0, 1);
  }

  function update(dt) {
    dt = Math.min(dt, 0.05);
    if (mode === 'traditional') {
      tradTime += dt;
      if (tradTime > 30) tradTime -= 30;
      drugLevel  = pkLevel(tradTime);
      activation = 0;
    } else {
      drugLevel  = held ? clamp(drugLevel + 0.35 * dt, 0, 1) : clamp(drugLevel - 0.22 * dt, 0, 1);
      const diff = (held ? 1 : 0) - activation;
      activation = clamp(activation + Math.sign(diff) * Math.min(Math.abs(diff), dt / 0.28), 0, 1);
    }
    graph[graphHead] = drugLevel;
    graphHead = (graphHead + 1) % GRAPH_N;
    updateStatus();
    toxicSev = clamp((drugLevel - TOXIC_TH) / (1 - TOXIC_TH), 0, 1);
    subSev   = clamp((SUB_TH - drugLevel) / SUB_TH, 0, 1);
  }

  function updateStatus() {
    const toxic = drugLevel > TOXIC_TH, sub = drugLevel < SUB_TH;
    if (mode === 'traditional') {
      if (tradTime < 0.4)   { statusLbl.textContent = 'drug administered — no controls'; statusLbl.style.color = rgba(MUTED, 0.8); }
      else if (toxic)       { statusLbl.textContent = '⚠ exceeding safe dose — no controls'; statusLbl.style.color = rgba(RED, 0.9); }
      else if (sub)         { statusLbl.textContent = 'sub-therapeutic — no controls'; statusLbl.style.color = rgba(MUTED, 0.7); }
      else                  { statusLbl.textContent = 'in window — no controls'; statusLbl.style.color = rgba(MUTED, 0.85); }
    } else {
      if (!held && drugLevel < 0.04) { statusLbl.textContent = 'field off — protein inactive'; statusLbl.style.color = rgba(MUTED, 0.8); }
      else if (toxic)                { statusLbl.textContent = '⚠ exceeding safe dose — release field'; statusLbl.style.color = rgba(RED, 0.95); }
      else if (sub)                  { statusLbl.textContent = held ? 'field on — building up...' : 'field off — decaying'; statusLbl.style.color = held ? rgba(TEAL, 0.7) : rgba(MUTED, 0.75); }
      else                           { statusLbl.textContent = '✓ in therapeutic window'; statusLbl.style.color = TEAL; }
    }
  }

  let lastTs = null;
  function tick(ts) {
    if (!lastTs) lastTs = ts;
    if (started) update((ts - lastTs) / 1000);
    lastTs = ts;
    draw();
    requestAnimationFrame(tick);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    drawLeft(); drawDivider(); drawRight();
  }

  const GX = 18, GY = 44, GW = MID - GX - 14, GH = H - GY - 46;

  function drawLeft() {
    const toxY = GY + GH * (1 - TOXIC_TH);
    const subY = GY + GH * (1 - SUB_TH);
    ctx.fillStyle = rgba(RED, 0.07);  ctx.fillRect(GX, GY, GW, toxY - GY);
    ctx.fillStyle = rgba(TEAL, 0.045); ctx.fillRect(GX, toxY, GW, subY - toxY);
    ctx.fillStyle = rgba(TEXT, 0.01); ctx.fillRect(GX, subY, GW, GY + GH - subY);
    ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.strokeStyle = rgba(TEAL, 0.045);
    for (let i = 1; i < 4; i++) { const y = GY + GH * i / 4; ctx.beginPath(); ctx.moveTo(GX, y); ctx.lineTo(GX + GW, y); ctx.stroke(); }
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = rgba(RED, 0.5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(GX, toxY); ctx.lineTo(GX + GW, toxY); ctx.stroke();
    ctx.strokeStyle = rgba(TEAL, 0.3);
    ctx.beginPath(); ctx.moveTo(GX, subY); ctx.lineTo(GX + GW, subY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px monospace'; ctx.textAlign = 'right';
    ctx.fillStyle = rgba(RED, 0.5);   ctx.fillText('⚠ TOXIC', GX + GW - 4, GY + 13);
    ctx.fillStyle = rgba(TEAL, 0.4);  ctx.fillText('THERAPEUTIC', GX + GW - 4, toxY + 15);
    ctx.fillStyle = rgba(TEXT, 0.18); ctx.fillText('SUB-THERAPEUTIC', GX + GW - 4, subY + 15);
    const lv = drugLevel;
    const lineCol = lv > TOXIC_TH ? rgba(RED, 0.9) : lv < SUB_TH ? rgba(MUTED, 0.5) : rgba(TEAL, 0.9);
    ctx.beginPath();
    for (let i = 0; i < GRAPH_N; i++) {
      const idx = (graphHead + i) % GRAPH_N;
      const x = GX + (i / (GRAPH_N - 1)) * GW;
      const y = GY + GH * (1 - graph[idx]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lineCol; ctx.lineWidth = 2; ctx.stroke();
    const ex = GX + GW, ey = GY + GH * (1 - lv);
    if (lv >= SUB_TH && lv <= TOXIC_TH) { ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fillStyle = rgba(TEAL, 0.14); ctx.fill(); }
    ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fillStyle = lineCol; ctx.fill();
    ctx.textAlign = 'left'; ctx.font = '9px monospace';
    ctx.fillStyle = rgba(TEXT, 0.25); ctx.fillText('DRUG ACTIVITY', GX, GY - 12);
    if (mode === 'traditional') { ctx.fillStyle = rgba(RED, 0.4); ctx.fillText('NO CONTROLS AVAILABLE', GX, H - 18); }
  }

  function drawDivider() {
    ctx.strokeStyle = rgba(TEXT, 0.07); ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(MID, 0); ctx.lineTo(MID, H); ctx.stroke();
  }

  const BCX = MID + (W - MID) / 2;
  const BCY = 200;
  const BODY_SCALE = 0.65;
  const RGB_NAVY  = hexRgb(WARM_NAVY);
  const RGB_BG    = hexRgb(WARM_BG);
  const RGB_REDBG = [45, 15, 12];

  function drawRight() {
    const t = performance.now() / 1000, act = activation;
    const bg = lerpRgb(RGB_BG, RGB_REDBG, toxicSev * 0.6);
    ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`; ctx.fillRect(MID, 0, W - MID, H);
    if (mode === 'molecular' && act > 0.01) drawWaves(act, t);
    if (drugLevel >= SUB_TH && drugLevel <= TOXIC_TH) {
      const beat = Math.pow(Math.max(0, Math.sin(t * 1.75)), 10);
      if (beat > 0.01) { ctx.beginPath(); ctx.arc(BCX, BCY, 55 + beat * 22, 0, Math.PI * 2); ctx.strokeStyle = `rgba(46,139,139,${(beat * 0.22).toFixed(3)})`; ctx.lineWidth = beat * 5 + 1; ctx.setLineDash([]); ctx.stroke(); }
    }
    const shakeAmp = toxicSev * 3.8;
    const shakeX = shakeAmp > 0.1 ? (Math.sin(t*31)*0.55 + Math.sin(t*23)*0.45) * shakeAmp : 0;
    const shakeY = shakeAmp > 0.1 ? (Math.sin(t*27)*0.55 + Math.sin(t*19)*0.45) * shakeAmp * 0.5 : 0;
    ctx.save(); ctx.translate(shakeX, shakeY);
    drawHumanSilhouette(BCX, BCY, BODY_SCALE, toxicSev);
    ctx.restore();
    if (toxicSev > 0) { const sp = Math.sin(Date.now()/120)*0.5+0.5; ctx.fillStyle = `rgba(233,94,85,${(toxicSev*0.18*sp).toFixed(3)})`; ctx.fillRect(MID, 0, W - MID, H); }
    if (drugLevel >= SUB_TH && drugLevel <= TOXIC_TH && toxicSev < 0.05) {
      const tFrac = (drugLevel - SUB_TH) / (TOXIC_TH - SUB_TH);
      const tp = Math.sin(t * 0.9) * 0.12 + 0.88;
      ctx.fillStyle = `rgba(61,217,192,${(tFrac * 0.07 * tp).toFixed(3)})`; ctx.fillRect(MID, 0, W - MID, H);
    }
    ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = `rgba(${RGB_NAVY[0]},${RGB_NAVY[1]},${RGB_NAVY[2]},0.4)`;
    ctx.fillText('PATIENT', MID + 18, GY - 12);
    const headTopY = BCY - 117;
    if (toxicSev > 0.15) { ctx.textAlign = 'center'; ctx.font = 'bold 10px monospace'; ctx.fillStyle = `rgba(199,72,60,${(toxicSev*0.85).toFixed(2)})`; ctx.fillText('⚠  ADVERSE EFFECTS', BCX, headTopY - 8); }
    if (toxicSev > 0.55) { const pulse = Math.sin(Date.now()/80)*0.3+0.7; ctx.font = `bold ${9+Math.round(toxicSev*4)}px monospace`; ctx.fillStyle = `rgba(233,94,85,${(pulse*toxicSev).toFixed(2)})`; ctx.textAlign = 'center'; ctx.fillText('⚠ TOXIC — ORGAN DAMAGE RISK', BCX, headTopY + 6); }
    ctx.textAlign = 'center'; ctx.font = '9px monospace';
    let lbl, lblCol;
    if (mode === 'traditional') {
      if (toxicSev > 0.08)     { lbl = 'DRUG ACTIVE — NO CONTROL'; lblCol = WARM_RED; }
      else if (drugLevel < SUB_TH) { lbl = tradTime < 0.4 ? 'DRUG ADMINISTERED' : 'SUB-THERAPEUTIC — INEFFECTIVE'; lblCol = `rgba(${RGB_NAVY[0]},${RGB_NAVY[1]},${RGB_NAVY[2]},0.45)`; }
      else                     { lbl = 'DRUG ACTIVE — NO CONTROL'; lblCol = `rgba(${RGB_NAVY[0]},${RGB_NAVY[1]},${RGB_NAVY[2]},0.65)`; }
    } else {
      if (toxicSev > 0.08)     { lbl = 'ADVERSE EFFECTS — RELEASE FIELD'; lblCol = WARM_RED; }
      else if (act < 0.05)     { lbl = 'DRUG INACTIVE — AWAITING SIGNAL'; lblCol = `rgba(${RGB_NAVY[0]},${RGB_NAVY[1]},${RGB_NAVY[2]},0.38)`; }
      else if (drugLevel < SUB_TH) { lbl = 'FIELD ON — ACTIVATING...'; lblCol = WARM_TEAL; }
      else                     { lbl = 'FIELD APPLIED — IN THERAPEUTIC WINDOW'; lblCol = WARM_TEAL; }
    }
    ctx.fillStyle = lblCol; ctx.fillText(lbl, BCX, H - 18);
  }

  function drawWaves(act, t) {
    const wx = BCX - 100, wy = BCY - 5;
    [22, 48, 76, 108].forEach((r, i) => {
      const phase = ((t * 1.15 + i * 0.32) % 1);
      const alpha = act * Math.pow(1 - phase, 1.4) * 0.72;
      if (alpha < 0.01) return;
      ctx.beginPath();
      ctx.arc(wx, wy, r * (0.28 + phase * 0.72) + 6, -Math.PI * 0.65, Math.PI * 0.65);
      ctx.strokeStyle = `rgba(61,217,192,${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([]);
      ctx.stroke();
    });
    const srcAlpha = act * 0.55;
    ctx.beginPath(); ctx.arc(wx, wy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(61,217,192,${srcAlpha.toFixed(3)})`; ctx.fill();
  }

  function drawHumanSilhouette(cx, cy, _scale, urgency) {
    const fs = 0.48;
    ctx.save();
    ctx.translate(cx - fs * 325, cy - fs * 450 + 28);
    ctx.scale(fs, fs);
    ctx.translate(153, 20);
    ctx.scale(2.03, 2.03);

    if (drugLevel > 0.02) {
      ctx.save();
      ctx.clip(FIG_PATH);
      let fillStyle;
      if (drugLevel > TOXIC_TH) {
        fillStyle = `rgba(232,90,79,${(0.22 + toxicSev * 0.28).toFixed(3)})`;
      } else if (drugLevel >= SUB_TH) {
        const tFrac = (drugLevel - SUB_TH) / (TOXIC_TH - SUB_TH);
        fillStyle = `rgba(61,217,192,${(0.12 + tFrac * 0.10).toFixed(3)})`;
      } else {
        fillStyle = `rgba(232,236,240,${(0.04 * (drugLevel / SUB_TH)).toFixed(3)})`;
      }
      ctx.fillStyle = fillStyle;
      ctx.fillRect(-50, -20, 250, 470);
      ctx.restore();
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (urgency > 0) {
      const now = performance.now() / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(now * 3.5);
      ctx.shadowColor = 'rgba(232,90,79,1)';
      ctx.shadowBlur  = 24 + urgency * 32 + pulse * 16;
      ctx.strokeStyle = `rgba(232,90,79,${(0.45 + urgency * 0.35 * pulse).toFixed(2)})`;
      ctx.stroke(FIG_PATH);
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      ctx.strokeStyle = `rgba(232,90,79,${(0.88 + urgency * 0.12).toFixed(2)})`;
      ctx.stroke(FIG_PATH);
    } else {
      if (drugLevel >= SUB_TH && drugLevel <= TOXIC_TH) {
        const tFrac = (drugLevel - SUB_TH) / (TOXIC_TH - SUB_TH);
        ctx.strokeStyle = `rgba(61,217,192,${(0.65 + tFrac * 0.25).toFixed(2)})`;
      } else if (drugLevel > 0) {
        ctx.strokeStyle = 'rgba(232,236,240,0.62)';
      } else {
        ctx.strokeStyle = 'rgba(232,236,240,0.82)';
      }
      ctx.stroke(FIG_PATH);
    }

    ctx.restore();
  }

  setMode('traditional');
  requestAnimationFrame(tick);
}());

/* ══════════════════════════════════════════════════════
   DEMO 2 — UAV INTERCEPTION: Predictive Dynamic Pursuit
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('uavCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lbl = document.getElementById('uavLabel'), controlBtn = document.getElementById('uavControl');
  const colors = { bg: '#0F1722', grid: 'rgba(61, 217, 192, 0.08)', teal: '#3DD9C0', blue: '#6BA3E8', red: '#E85A4F', muted: '#4C6A8D' };
  const OBSTACLE = { x: W/2 - 80, y: 50, w: 160, h: 50 }, UAV_START = { x: W/2, y: H - 40 }, TARGET_START = { x: -50, y: 30 };
  let t = 0, isPlaying = false, interceptDone = false, targetHistory = [], UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 };
  const SPEED = 0.0022;

  function targetPos(tt) { return { x: TARGET_START.x + tt * (W + 100), y: TARGET_START.y }; }
  function drawGrid() {
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
    for(let x=0; x<=W; x+=30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for(let y=0; y<=H; y+=30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  function drawFOV(x, y, angle, isOccluded) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 600, angle-0.2, angle+0.2); ctx.lineTo(x,y);
    const grd = ctx.createRadialGradient(x, y, 30, x, y, 400);
    grd.addColorStop(0, hexToRgba(isOccluded ? '#5C85B3' : colors.teal, 0.12)); grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fill(); ctx.restore();
  }

  function drawDrone(x, y, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = colors.teal; ctx.beginPath(); ctx.moveTo(15,0); ctx.lineTo(-8,-8); ctx.lineTo(-4,0); ctx.lineTo(-8,8); ctx.fill();
    ctx.strokeStyle = hexToRgba(colors.teal, 0.3); ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }

  function loop() {
    ctx.fillStyle = colors.bg; ctx.fillRect(0,0,W,H); drawGrid();
    const tgt = targetPos(t), isOver = tgt.x > OBSTACLE.x && tgt.x < OBSTACLE.x + OBSTACLE.w;
    const exitT = (OBSTACLE.x + OBSTACLE.w + 65 - TARGET_START.x) / (W + 100);
    const finalInterceptPos = targetPos(exitT);

    if (isPlaying) {
      targetHistory.push({x: tgt.x, y: tgt.y}); if (targetHistory.length > 15) targetHistory.shift();
      if (tgt.x > OBSTACLE.x + OBSTACLE.w/3 && UAV.state === 'WATCHING') {
        UAV.state = 'INTERCEPTING'; UAV.lockedInterceptT = exitT;
        const dest = targetPos(exitT); UAV.targetX = dest.x; UAV.targetY = dest.y;
        const dx = UAV.targetX - UAV.x, dy = UAV.targetY - UAV.y, dist = Math.sqrt(dx*dx + dy*dy);
        UAV.angle = Math.atan2(dy, dx);
        const timeLeft = (exitT - t) / SPEED; UAV.vx = (Math.cos(UAV.angle) * dist) / timeLeft; UAV.vy = (Math.sin(UAV.angle) * dist) / timeLeft;
      }
      if (UAV.state === 'INTERCEPTING') {
        const dx = UAV.targetX - UAV.x, dy = UAV.targetY - UAV.y;
        if (Math.sqrt(dx*dx + dy*dy) > 2) { UAV.x += UAV.vx; UAV.y += UAV.vy; } else {
          UAV.state = 'INTERCEPTED'; UAV.vx = 0; UAV.vy = 0;
          if (!interceptDone) { interceptDone = true; setTimeout(() => {
            isPlaying = false; interceptDone = false; t = 0; targetHistory = [];
            UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 };
            controlBtn.textContent = 'Play';
          }, 2000); }
        }
      } else if (UAV.state === 'WATCHING') {
        UAV.angle = Math.atan2(tgt.y - UAV.y, tgt.x - UAV.x);
        const lead = targetPos(Math.min(t + 0.15, exitT)); UAV.targetX = lead.x; UAV.targetY = lead.y;
      }
      if (UAV.state !== 'INTERCEPTED') t += SPEED;
      if (t > 1) { isPlaying = false; t = 0; targetHistory = []; UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 }; controlBtn.textContent = 'Play'; }
    } else {
      UAV.angle = Math.atan2(tgt.y - UAV.y, tgt.x - UAV.x);
      const lead = targetPos(Math.min(t + 0.15, exitT)); UAV.targetX = lead.x; UAV.targetY = lead.y;
    }

    if (UAV.state !== 'INTERCEPTED') {
      ctx.save();
      if (isOver || UAV.state === 'INTERCEPTING') {
        ctx.setLineDash([2, 2]); ctx.strokeStyle = 'rgba(107, 163, 232, 0.3)';
        ctx.beginPath(); ctx.moveTo(UAV.x, UAV.y); ctx.lineTo(finalInterceptPos.x, finalInterceptPos.y); ctx.stroke();
      }
      ctx.setLineDash([3, 3]); ctx.strokeStyle = colors.blue; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(tgt.x, tgt.y); ctx.lineTo(UAV.targetX, UAV.targetY); ctx.stroke();
      ctx.beginPath(); ctx.arc(UAV.targetX, UAV.targetY, 3, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    }

    drawFOV(UAV.x, UAV.y, UAV.angle, isOver);
    ctx.fillStyle = '#1A242F'; ctx.fillRect(OBSTACLE.x, OBSTACLE.y, OBSTACLE.w, OBSTACLE.h);
    ctx.strokeStyle = colors.muted; ctx.strokeRect(OBSTACLE.x, OBSTACLE.y, OBSTACLE.w, OBSTACLE.h);

    targetHistory.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
      ctx.fillStyle = hexToRgba(isOver ? colors.muted : colors.red, (i/targetHistory.length) * 0.2); ctx.fill();
    });

    ctx.save(); if (isOver) ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(tgt.x, tgt.y, 6, 0, Math.PI*2); ctx.fillStyle = isOver ? colors.muted : colors.red; ctx.fill();
    ctx.strokeStyle = isOver ? colors.muted : colors.red; ctx.beginPath(); ctx.arc(tgt.x, tgt.y, 11, 0, Math.PI*2); ctx.stroke(); ctx.restore();

    drawDrone(UAV.x, UAV.y, UAV.angle);
    ctx.font = `700 11px 'IBM Plex Mono', monospace`; ctx.fillStyle = isOver ? colors.blue : colors.teal;
    ctx.textAlign = 'center'; ctx.fillText(UAV.state === 'WATCHING' ? (isOver ? "STATE: SCANNING" : "STATE: TRACKING") : (UAV.state === 'INTERCEPTING' ? "STATE: INTERCEPTING" : "STATE: INTERCEPTED"), W/2, 45);
    lbl.textContent = isOver ? 'Target occluded — maintaining state estimate' : (UAV.state === 'WATCHING' ? 'Visual tracking active' : 'Intercept successfully completed');
    requestAnimationFrame(loop);
  }

  function uavStart() {
    t = 0; interceptDone = false;
    UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 };
    targetHistory = []; isPlaying = true; controlBtn.textContent = 'Reset';
  }
  controlBtn.addEventListener('click', () => { if (!isPlaying) uavStart(); });
  canvas.style.cursor = 'pointer';
  canvas.addEventListener('click', () => { if (!isPlaying) uavStart(); });
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════
   DEMO 4 — ENZYME CAP DOMAIN: SVG catalytic cycle
══════════════════════════════════════════════════════ */
(function(){
  const svgEl = document.getElementById('enzyme-svg');
  if (!svgEl) return;
  const btn = document.getElementById('enzymeCycleBtn');
  const statusLabel = document.getElementById('enzymeStatusLabel');
  if (!btn || !statusLabel) return;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    statusLabel.textContent = 'Binding: Substrate enters pocket';
    svgEl.className.baseVal = 'stage-2';
    await sleep(900);
    statusLabel.textContent = 'Closed: Active site sealed';
    svgEl.className.baseVal = 'stage-3';
    await sleep(900);
    statusLabel.textContent = 'Reaction: Conversion to product';
    svgEl.className.baseVal = 'stage-4';
    await sleep(900);
    statusLabel.textContent = 'Opening: Cap rotates to release';
    svgEl.className.baseVal = 'stage-5';
    await sleep(900);
    statusLabel.textContent = 'Release: Product unbinds';
    svgEl.className.baseVal = 'stage-6';
    await sleep(900);
    svgEl.className.baseVal = 'stage-reset';
    await sleep(50);
    svgEl.className.baseVal = 'stage-1';
    statusLabel.textContent = 'Apo state — active site open';
    btn.disabled = false;
  });
  svgEl.style.cursor = 'pointer';
  svgEl.addEventListener('click', () => { if (!btn.disabled) btn.click(); });
})();
