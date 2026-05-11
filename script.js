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
  const WARM_BG   = '#F5F3F0';
  const WARM_NAVY = '#1B3A5C';
  const WARM_RED  = '#C7483C';
  const WARM_TEAL = '#2E8B8B';

  function hexRgb(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
  function rgba(hex, a) { const [r,g,b] = hexRgb(hex); return `rgba(${r},${g},${b},${+a.toFixed(3)})`; }
  function lerpN(a, b, t) { return a + (b - a) * t; }
  function lerpRgb(rgb1, rgb2, t) { return [Math.round(lerpN(rgb1[0],rgb2[0],t)), Math.round(lerpN(rgb1[1],rgb2[1],t)), Math.round(lerpN(rgb1[2],rgb2[2],t))]; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  const TOXIC_TH = 0.72;
  const SUB_TH   = 0.35;

  let mode = 'traditional', held = false, activation = 0, drugLevel = 0, tradTime = 0, toxicSev = 0, subSev = 0;

  const GRAPH_N = 220;
  const graph   = new Float32Array(GRAPH_N);
  let graphHead = 0;

  window.addEventListener('keydown', e => { if ((e.key === 'm' || e.key === 'M') && !e.repeat) setHeld(true); });
  window.addEventListener('keyup',   e => { if (e.key === 'm' || e.key === 'M') setHeld(false); });
  holdBtn.addEventListener('mousedown',  e => { e.preventDefault(); setHeld(true); });
  document.addEventListener('mouseup',   () => { if (held) setHeld(false); });
  holdBtn.addEventListener('touchstart', e => { e.preventDefault(); setHeld(true); });
  document.addEventListener('touchend',  () => { if (held) setHeld(false); });

  function setHeld(v) {
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
    holdBtn.className = 'hold-btn' + (m === 'molecular'   ? '' : ' hidden');
    poolParticles.length = 0;
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
    if (toxicSev > 0.12 && Math.random() < toxicSev * 0.04 * dt * 60) {
      poolParticles.push({ x: BRAIN_X + (Math.random()-0.5)*28, y: BRAIN_Y + (Math.random()-0.5)*16, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.3, life: 1.0 });
    }
    for (let i = poolParticles.length - 1; i >= 0; i--) {
      const p = poolParticles[i];
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.006 * dt * 60;
      if (p.life <= 0) poolParticles.splice(i, 1);
    }
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
    update((ts - lastTs) / 1000);
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
  const BRAIN_X = BCX;
  const BRAIN_Y = BCY - 96;
  const RGB_NAVY  = hexRgb(WARM_NAVY);
  const RGB_BG    = hexRgb(WARM_BG);
  const RGB_REDBG = [255, 222, 218];
  const poolParticles = [];

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
    poolParticles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = `rgba(158,42,43,${(p.life*0.55).toFixed(3)})`; ctx.fill(); });
    drawHumanSilhouette(BCX, BCY, BODY_SCALE, toxicSev);
    drawBrain(BRAIN_X, BRAIN_Y, 0.45, toxicSev * 100, subSev * 75);
    ctx.restore();
    if (toxicSev > 0) { const sp = Math.sin(Date.now()/120)*0.5+0.5; ctx.fillStyle = `rgba(233,94,85,${(toxicSev*0.18*sp).toFixed(3)})`; ctx.fillRect(MID, 0, W - MID, H); }
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
    const wx = BCX - 83, wy = BCY - 10;
    [30, 56, 82].forEach((r, i) => {
      const phase = ((t * 1.4 + i * 0.38) % 1), alpha = act * (1 - phase) * 0.5;
      if (alpha < 0.012) return;
      ctx.beginPath(); ctx.arc(wx, wy, r*(0.25+phase*0.75)+6, -Math.PI*0.58, Math.PI*0.58);
      ctx.strokeStyle = `rgba(46,139,139,${alpha.toFixed(3)})`; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
    });
  }

  function buildHumanPath() {
    ctx.beginPath();
    ctx.moveTo(0, -180);
    ctx.bezierCurveTo(20, -180, 25, -165, 25, -145);
    ctx.bezierCurveTo(25, -135, 20, -125, 15, -120);
    ctx.bezierCurveTo(30, -120, 50, -110, 60, -90);
    ctx.bezierCurveTo(75, -50, 80, 10, 85, 40);
    ctx.bezierCurveTo(86, 50, 78, 55, 70, 50);
    ctx.bezierCurveTo(65, 45, 60, 20, 55, -20);
    ctx.bezierCurveTo(50, -10, 50, 30, 55, 80);
    ctx.bezierCurveTo(60, 140, 65, 200, 60, 220);
    ctx.bezierCurveTo(55, 230, 35, 230, 30, 210);
    ctx.bezierCurveTo(25, 170, 20, 120, 5, 90);
    ctx.lineTo(0, 90);
    ctx.lineTo(-5, 90);
    ctx.bezierCurveTo(-20, 120, -25, 170, -30, 210);
    ctx.bezierCurveTo(-35, 230, -55, 230, -60, 220);
    ctx.bezierCurveTo(-65, 200, -60, 140, -55, 80);
    ctx.bezierCurveTo(-50, 30, -50, -10, -55, -20);
    ctx.bezierCurveTo(-60, 20, -65, 45, -70, 50);
    ctx.bezierCurveTo(-78, 55, -86, 50, -85, 40);
    ctx.bezierCurveTo(-80, 10, -75, -50, -60, -90);
    ctx.bezierCurveTo(-50, -110, -30, -120, -15, -120);
    ctx.bezierCurveTo(-20, -125, -25, -135, -25, -145);
    ctx.bezierCurveTo(-25, -165, -20, -180, 0, -180);
    ctx.closePath();
  }

  function drawHumanSilhouette(cx, cy, scale, urgency) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    buildHumanPath();
    const fillRgb = lerpRgb([38,45,53], [170,45,38], urgency * 0.72);
    ctx.fillStyle = `rgb(${fillRgb[0]},${fillRgb[1]},${fillRgb[2]})`; ctx.fill();
    if (drugLevel > 0.03) {
      buildHumanPath(); ctx.save(); ctx.clip();
      let cr, cg, cb, alpha;
      if (drugLevel > TOXIC_TH) {
        const pulse = Math.sin(Date.now()/180)*0.15+0.85; cr=233; cg=80; cb=70; alpha=(0.28+toxicSev*0.52)*pulse;
      } else if (drugLevel >= SUB_TH) {
        const tFrac = (drugLevel-SUB_TH)/(TOXIC_TH-SUB_TH), pulse=Math.sin(Date.now()/700)*0.06+0.94;
        cr=61; cg=217; cb=192; alpha=0.30*tFrac*pulse;
      } else { cr=90; cg=130; cb=170; alpha=0.08*(drugLevel/SUB_TH); }
      const grd = ctx.createRadialGradient(0,-10,0,0,-10,130);
      grd.addColorStop(0,    `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`);
      grd.addColorStop(0.55, `rgba(${cr},${cg},${cb},${(alpha*0.38).toFixed(3)})`);
      grd.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(-110,-190,220,430); ctx.restore();
    }
    buildHumanPath();
    ctx.lineWidth = 2.5 + urgency * 2;
    if (urgency > 0) {
      const r = Math.round(107+(233-107)*urgency), g = Math.round(162-(162-94)*urgency), b = Math.round(230-(230-85)*urgency);
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
    } else { ctx.strokeStyle = '#6BA2E6'; }
    ctx.stroke(); ctx.restore();
  }

  function drawBrain(cx, cy, scale, bleed, clot) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    const healthyRgb=[183,228,199], hypoxicRgb=[253,244,184], redRgb=[233,94,85];
    const hypoxiaF = clot/100, bleedF = bleed/100;
    const mix = (c1,c2,f) => c1.map((v,i) => Math.round(v+(c2[i]-v)*f));
    let col = mix(healthyRgb, hypoxicRgb, hypoxiaF*0.95);
    col = mix(col, redRgb, bleedF*0.98);
    const healthGlow = Math.max(0, 1-hypoxiaF-bleedF);
    const glowPulse  = (Math.sin(Date.now()/400)*0.2+0.8)*healthGlow;
    if (healthGlow > 0.05) {
      const grd = ctx.createRadialGradient(0,0,0,0,0,75);
      grd.addColorStop(0,   `rgba(183,228,199,${(0.7*glowPulse).toFixed(3)})`);
      grd.addColorStop(0.5, `rgba(183,228,199,${(0.3*glowPulse).toFixed(3)})`);
      grd.addColorStop(1,   'rgba(183,228,199,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0,0,80,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    const drawLobe = side => {
      ctx.beginPath(); ctx.moveTo(side*2,35); ctx.bezierCurveTo(side*30,35,side*30,-35,side*2,-35); ctx.bezierCurveTo(side*-10,-35,side*-10,35,side*2,35); ctx.fill();
      if (healthGlow > 0.2) { ctx.lineWidth=4; ctx.strokeStyle=`rgba(255,255,255,${(0.4*glowPulse).toFixed(3)})`; ctx.stroke(); }
      ctx.lineWidth=1; ctx.strokeStyle=`rgba(0,0,0,${(0.05+bleedF*0.2).toFixed(3)})`; ctx.stroke();
    };
    drawLobe(1); drawLobe(-1); ctx.restore();
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
  let t = 0, isPlaying = false, targetHistory = [], UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 };
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
        if (Math.sqrt(dx*dx + dy*dy) > 2) { UAV.x += UAV.vx; UAV.y += UAV.vy; } else { UAV.state = 'INTERCEPTED'; UAV.vx = 0; UAV.vy = 0; }
      } else if (UAV.state === 'WATCHING') {
        UAV.angle = Math.atan2(tgt.y - UAV.y, tgt.x - UAV.x);
        const lead = targetPos(Math.min(t + 0.15, exitT)); UAV.targetX = lead.x; UAV.targetY = lead.y;
      }
      if (UAV.state !== 'INTERCEPTED') t += SPEED;
      if (t > 1) { isPlaying = false; controlBtn.textContent = 'Play'; }
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

  controlBtn.addEventListener('click', () => {
    if (controlBtn.textContent === 'Reset') {
      t = 0; UAV = { ...UAV_START, vx:0, vy:0, angle:0, state:'WATCHING', targetX:0, targetY:0, lockedInterceptT:0 };
      isPlaying = false; targetHistory = []; controlBtn.textContent = 'Play';
    } else { isPlaying = true; controlBtn.textContent = 'Reset'; }
  });
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════
   DEMO 4 — ENZYME CAP DOMAIN: Conformational Control
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('enzymeCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  const btn = document.getElementById('enzymeToggle');
  let ligand = false, cap = 0, anim = 0;
  function draw(){
    ctx.fillStyle = '#0F1722'; ctx.fillRect(0,0,W,H);
    ctx.beginPath(); ctx.ellipse(W/2, H/2+10, 52, 44, 0, 0, Math.PI*2); ctx.fillStyle = '#121B26'; ctx.fill();
    const angle = -0.4 + (0.95 - (-0.4)) * cap;
    ctx.beginPath(); ctx.moveTo(W/2-20, H/2-16); ctx.lineTo(W/2-20 + Math.cos(angle)*60, H/2-16 + Math.sin(angle)*60); ctx.strokeStyle = '#E8ECF0'; ctx.lineWidth = 5; ctx.stroke();
    if(ligand || anim > 0) {
      const lx = W-40 + (W/2+30 - (W-40)) * cap, ly = 40 + (H/2-60 - 40) * cap;
      ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI*2); ctx.fillStyle = '#3DD9C0'; ctx.fill();
    }
    cap = Math.max(0, Math.min(1, cap + anim * 0.02));
    requestAnimationFrame(draw);
  }
  btn.addEventListener('click', () => { ligand = !ligand; anim = ligand ? 1 : -1; btn.textContent = ligand ? 'Remove Signal' : 'Add Signal'; });
  draw();
})();
