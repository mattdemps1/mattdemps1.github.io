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
   DEMO 1 — MOLECULAR BIT: controllable protein switch
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('mbCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const btn = document.getElementById('mbToggle');
  const lbl = document.getElementById('mbStateLabel');
  const CX = W / 2, CY = H / 2;
  const colors = { bg: '#0F1722', grid: 'rgba(61, 217, 192, 0.08)', teal: '#3DD9C0', shell: '#1E2C3D', muted: '#4C6A8D', textDim: 'rgba(232, 236, 240, 0.85)' };
  let activation = 0, fieldAlpha = 0, fieldPhase = 0, holding = false, pulseAlpha = 0, hasTriggered = false, last = 0;

  function drawGrid() {
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
    for(let x=0; x<=W; x+=30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for(let y=0; y<=H; y+=30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  function drawField() {
    if (fieldAlpha < 0.01) return;
    const scanX = (fieldPhase * 350) % (W + 100) - 50;
    const grad = ctx.createLinearGradient(scanX - 80, 0, scanX, 0);
    grad.addColorStop(0, 'transparent'); grad.addColorStop(1, hexToRgba(colors.teal, fieldAlpha * 0.2));
    ctx.fillStyle = grad; ctx.fillRect(scanX - 80, 0, 80, H);
    ctx.strokeStyle = hexToRgba(colors.teal, fieldAlpha * 0.7); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H); ctx.stroke();
  }

  function drawMolecule(t, dt) {
    const r1 = 45, d = 34, r2 = t * 32;
    ctx.save(); ctx.translate(CX, CY);
    if (t > 0.01) {
      ctx.fillStyle = colors.teal; ctx.beginPath(); ctx.arc(0, 0, r1 - 3, 0, Math.PI * 2); ctx.fill();
      pulseAlpha += dt * 0.0015;
      const p = pulseAlpha % 1;
      ctx.strokeStyle = hexToRgba('#FFFFFF', 0.5 * (1 - p) * t); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(d, 0, 5 + p * 30, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath();
    if (r2 > 0 && d + r2 > r1) {
      const x = (d*d - r2*r2 + r1*r1) / (2*d), y = Math.sqrt(Math.max(0, r1*r1 - x*x));
      const a1 = Math.atan2(y, x), a2 = Math.atan2(y, x - d);
      ctx.arc(0, 0, r1, a1, 2 * Math.PI - a1, false); ctx.arc(d, 0, r2, 2 * Math.PI - a2, a2, true);
    } else {
      ctx.arc(0, 0, r1, 0, 2 * Math.PI, false); if (r2 > 0) { ctx.moveTo(d + r2, 0); ctx.arc(d, 0, r2, 0, 2 * Math.PI, true); }
    }
    ctx.fillStyle = colors.shell; ctx.fill();
    ctx.strokeStyle = t > 0.5 ? colors.teal : colors.muted; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
  }

  function loop(ts) {
    const dt = ts - last; last = ts;
    if (holding) fieldAlpha = Math.min(1, fieldAlpha + 0.08); else fieldAlpha = Math.max(0, fieldAlpha - 0.2);
    fieldPhase += dt * 0.001;
    const scanX = (fieldPhase * 350) % (W + 100) - 50;
    if (holding && Math.abs(scanX - CX) < 60) hasTriggered = true;
    if (holding && hasTriggered) activation = Math.min(1, activation + 0.1); else { hasTriggered = false; activation = Math.max(0, activation - 0.05); }
    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, W, H);
    drawGrid(); drawField(); drawMolecule(activation, dt);
    lbl.textContent = holding ? 'Field ON' : 'Field Off';
    lbl.style.color = holding ? colors.teal : colors.textDim;
    requestAnimationFrame(loop);
  }

  btn.addEventListener('mousedown', () => { holding = true; fieldPhase = 0; });
  window.addEventListener('mouseup', () => holding = false);
  requestAnimationFrame(loop);
})();

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
    ctx.font = `700 11px 'DM Mono', monospace`; ctx.fillStyle = isOver ? colors.blue : colors.teal;
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
