/* ══════════════════════════════════════════════════════
   DEMO 1 — MOLECULAR BIT: controllable protein switch
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('mbCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const btn = document.getElementById('mbToggle');
  const lbl = document.getElementById('mbStateLabel');

  const CX = W / 2, CY = H / 2;
  const colors = {
    bg: '#0F1722',      
    grid: 'rgba(61, 217, 192, 0.08)', 
    teal: '#3DD9C0',    
    shell: '#1E2C3D',   
    muted: '#4C6A8D',   
    textDim: 'rgba(232, 236, 240, 0.85)' // Even higher contrast for readability
  };

  let activation = 0, fieldAlpha = 0, fieldPhase = 0, holding = false;
  let pulseAlpha = 0;
  let hasTriggered = false;

  function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const size = 30;
    for(let x=0; x<=W+size; x+=size) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for(let y=0; y<=H+size; y+=size) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function drawField() {
    if (fieldAlpha < 0.01) return;
    ctx.save();
    // Tighter scan period for faster reset: starts closer to edges
    const period = W + 100;
    const speed = 350;
    const scanX = (fieldPhase * speed) % period - 50;
    
    const grad = ctx.createLinearGradient(scanX - 80, 0, scanX, 0);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(61, 217, 192, ${fieldAlpha * 0.2})`);
    ctx.fillStyle = grad;
    ctx.fillRect(scanX - 80, 0, 80, H);

    ctx.strokeStyle = `rgba(61,217,192,${fieldAlpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H);
    ctx.stroke();
    ctx.restore();
  }

  function drawMolecule(t, dt) {
    const r1 = 45, d = 34, r2 = t * 32;
    ctx.save();
    ctx.translate(CX, CY);

    // 1. Draw Revealed Active Core
    if (t > 0.01) {
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(0, 0, r1 - 3, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Precision Pulse Effect
      pulseAlpha += dt * 0.0015;
      const p = pulseAlpha % 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - p) * t})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(d, 0, 5 + p * 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Draw Shell (Pocket Reveal)
    ctx.beginPath();
    if (r2 > 0 && d + r2 > r1) {
      const x = (d*d - r2*r2 + r1*r1) / (2*d);
      const y = Math.sqrt(Math.max(0, r1*r1 - x*x));
      const a1 = Math.atan2(y, x), a2 = Math.atan2(y, x - d);
      ctx.arc(0, 0, r1, a1, 2 * Math.PI - a1, false);
      ctx.arc(d, 0, r2, 2 * Math.PI - a2, a2, true);
    } else {
      ctx.arc(0, 0, r1, 0, 2 * Math.PI, false);
      if (r2 > 0) { ctx.moveTo(d + r2, 0); ctx.arc(d, 0, r2, 0, 2 * Math.PI, true); }
    }
    ctx.closePath();
    ctx.fillStyle = colors.shell;
    ctx.fill();

    // 3. High-Precision Outer Stroke
    ctx.strokeStyle = t > 0.5 ? colors.teal : colors.muted;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  function drawHUD(t) {
    ctx.font = "700 13px 'DM Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = t > 0.8 ? colors.teal : colors.textDim;
    ctx.fillText(t > 0.8 ? "MOLECULAR SWITCH: ACTIVE" : "MOLECULAR SWITCH: INACTIVE", W / 2, 45);
  }

  let last = 0;
  function loop(ts) {
    const dt = last ? ts - last : 0; last = ts;
    
    // Field visualization
    if (holding) { 
      fieldAlpha = Math.min(1, fieldAlpha + 0.08); 
    } else { 
      fieldAlpha = Math.max(0, fieldAlpha - 0.2); // Fast fade
    }
    fieldPhase += dt * 0.001;

    // Trigger Logic: Only activate when a field line is passing over the center (CX)
    let isHit = false;
    const period = W + 100;
    const speed = 350;
    const scanX = (fieldPhase * speed) % period - 50;
    if (Math.abs(scanX - CX) < 60) isHit = true;

    if (holding) {
      if (isHit) hasTriggered = true;
      if (hasTriggered) {
        activation = Math.min(1, activation + 0.1); 
      }
    } else {
      hasTriggered = false;
      activation = Math.max(0, activation - 0.05); 
    }

    ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, W, H);
    drawGrid();
    drawField();
    drawMolecule(activation, dt);
    drawHUD(activation);

    lbl.textContent = activation > 0.8 ? 'Field ON' : 'Field Off';
    lbl.style.color = activation > 0.8 ? colors.teal : colors.textDim;
    requestAnimationFrame(loop);
  }

  const startHolding = () => {
    holding = true;
    fieldPhase = 0; // Reset to start scan from left
  };

  btn.addEventListener('mousedown', startHolding);
  window.addEventListener('mouseup', () => holding = false);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); startHolding(); });
  window.addEventListener('touchend', () => holding = false);
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════
/* ══════════════════════════════════════════════════════
   DEMO 2 — UAV INTERCEPTION: Predictive Dynamic Pursuit
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('uavCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lbl = document.getElementById('uavLabel');
  const resetBtn = document.getElementById('uavReset');

  const colors = {
    bg: '#0F1722',
    grid: 'rgba(61, 217, 192, 0.08)',
    teal: '#3DD9C0',
    blue: '#6BA3E8',
    red: '#E85A4F', // Re-introduced for target highlight
    muted: '#4C6A8D',
    textDim: 'rgba(232, 236, 240, 0.7)'
  };

  let t = 0, raf, last = 0;
  const SPEED = 0.0022; // Slower simulation

  // Simulation entities
  const OBSTACLE = { x: W/2 - 80, y: 50, w: 160, h: 50 }; // Longer left-to-right
  const UAV_START = { x: W/2, y: H - 40 };
  const UAV = { x: UAV_START.x, y: UAV_START.y, vx: 0, vy: 0, angle: 0, state: 'WATCHING', speed: 0, targetX: 0, targetY: 0 };
  const TARGET_START = { x: -50, y: 75 }; 

  function targetPos(tt) {
    const x = TARGET_START.x + tt * (W + 100);
    const y = TARGET_START.y; 
    return { x, y };
  }

  function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const size = 30;
    ctx.beginPath();
    for(let x=0; x<=W+size; x+=size) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for(let y=0; y<=H+size; y+=size) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function drawFOV(x, y, angle, occluded) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 600, angle - 0.2, angle + 0.2);
    ctx.lineTo(x, y);
    const grd = ctx.createRadialGradient(x, y, 30, x, y, 400);
    grd.addColorStop(0, occluded ? 'rgba(76, 106, 141, 0.15)' : 'rgba(61, 217, 192, 0.15)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  }

  function drawDrone(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = colors.teal;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(61, 217, 192, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function loop(ts) {
    const dt = last ? ts - last : 0; last = ts;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    const tgt = targetPos(t);
    const isOccluded = tgt.x > OBSTACLE.x && tgt.x < OBSTACLE.x + OBSTACLE.w;

    // 1. Precise Interception Math
    const interceptT = (OBSTACLE.x + OBSTACLE.w + 35 - TARGET_START.x) / (W + 100);
    const interceptPos = targetPos(interceptT);

    if (isOccluded && UAV.state === 'WATCHING') {
      UAV.state = 'INTERCEPTING';
      UAV.targetX = interceptPos.x;
      UAV.targetY = interceptPos.y;
      
      const dx = UAV.targetX - UAV.x;
      const dy = UAV.targetY - UAV.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      UAV.angle = Math.atan2(dy, dx);
      
      const timeLeft = (interceptT - t) / SPEED;
      UAV.speed = dist / timeLeft;
      UAV.vx = Math.cos(UAV.angle) * UAV.speed;
      UAV.vy = Math.sin(UAV.angle) * UAV.speed;
    }

    if (UAV.state === 'INTERCEPTING') {
      const dx = UAV.targetX - UAV.x;
      const dy = UAV.targetY - UAV.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 2) {
        UAV.x += UAV.vx;
        UAV.y += UAV.vy;
      } else {
        UAV.state = 'INTERCEPTED';
        UAV.vx = 0; UAV.vy = 0; UAV.speed = 0;
      }
    } else if (UAV.state === 'WATCHING') {
      UAV.angle = Math.atan2(tgt.y - UAV.y, tgt.x - UAV.x);
      // Update predictive path for visualization
      UAV.targetX = interceptPos.x;
      UAV.targetY = interceptPos.y;
    }

    // 2. Draw Intercept Path (Dotted)
    if (UAV.state !== 'INTERCEPTED') {
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Line from start (or current pos) to target
      ctx.moveTo(UAV.state === 'INTERCEPTING' ? UAV.x - (UAV.vx * 10) : UAV.x, UAV.state === 'INTERCEPTING' ? UAV.y - (UAV.vy * 10) : UAV.y);
      ctx.lineTo(UAV.targetX, UAV.targetY);
      ctx.stroke();
      
      // Target Reticle at predicted spot
      ctx.beginPath();
      ctx.arc(UAV.targetX, UAV.targetY, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw POV
    drawFOV(UAV.x, UAV.y, UAV.angle, isOccluded);

    // 3. Draw Obstacle (Horizontal Opaque Block)
    ctx.fillStyle = '#1A242F';
    ctx.fillRect(OBSTACLE.x, OBSTACLE.y, OBSTACLE.w, OBSTACLE.h);
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 1;
    ctx.strokeRect(OBSTACLE.x, OBSTACLE.y, OBSTACLE.w, OBSTACLE.h);

    // 4. Draw Target (Red)
    if (!isOccluded) {
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, 6, 0, Math.PI*2);
      ctx.fillStyle = colors.red;
      ctx.fill();
      ctx.strokeStyle = colors.red;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, 11, 0, Math.PI*2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, 5, 0, Math.PI*2);
      ctx.strokeStyle = colors.muted;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw UAV
    drawDrone(UAV.x, UAV.y, UAV.angle);
    ctx.font = `700 9px 'DM Mono', monospace`;
    ctx.fillStyle = colors.teal;
    ctx.textAlign = 'center';
    ctx.fillText('REF: UAV-01', UAV.x, UAV.y + 28);

    // 6. HUD
    ctx.font = `700 11px 'DM Mono', monospace`;
    ctx.fillStyle = isOccluded ? colors.blue : colors.teal;
    const status = UAV.state === 'WATCHING' ? "STATE: SCANNING" : (isOccluded ? "STATE: PREDICTING" : "STATE: INTERCEPTED");
    ctx.fillText(status, W/2, 45);

    lbl.textContent = isOccluded
      ? 'Target occluded — executing precision intercept trajectory'
      : (UAV.state === 'WATCHING' ? 'Visual tracking active' : 'Intercept successfully completed');

    t += SPEED;
    if (t > 1) {
      t = 0;
      UAV.x = UAV_START.x; UAV.y = UAV_START.y;
      UAV.state = 'WATCHING';
      UAV.speed = 0;
    }
    raf = requestAnimationFrame(loop);
  }

  resetBtn.addEventListener('click', () => { 
    t = 0; UAV.x = UAV_START.x; UAV.y = UAV_START.y; UAV.state = 'WATCHING'; UAV.speed = 0;
  });
  loop();
})();

/* ══════════════════════════════════════════════════════
   DEMO 3 — PIPELINE FLOW: Automated Candidate Screening
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('pipeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lbl = document.getElementById('pipeLabel');
  const runBtn = document.getElementById('pipeRun');

  const colors = {
    bg: '#0F1722',
    grid: 'rgba(61, 217, 192, 0.08)',
    teal: '#3DD9C0',
    blue: '#6BA3E8',
    muted: '#4C6A8D',
    textDim: 'rgba(232, 236, 240, 0.7)'
  };

  const STAGES = [
    { name:'RFdiffusion', sub:'BACKBONE', color:colors.textDim, x:50 },
    { name:'ProteinMPNN', sub:'SEQUENCE', color:colors.teal, x:160 },
    { name:'ESMFold', sub:'STRUCTURE', color:colors.blue, x:270 },
    { name:'Rosetta', sub:'STABILITY', color:colors.blue, x:380 },
  ];
  const STAGE_W = 80, STAGE_H = 52, STAGE_Y = H/2 - STAGE_H/2;

  let particles = [];
  let running = false, raf, passed = 0, filtered = 0, frameCount = 0;

  function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for(let x=0; x<=W+30; x+=30) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for(let y=0; y<=H+30; y+=30) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function spawnParticle(){
    particles.push({ x: 10, y: H/2, stage:-1, progress:0, speed:0.012+Math.random()*0.008, color:colors.teal, alive:true, rejected:false, rejStage:-1 });
  }

  function drawStages(){
    STAGES.forEach((s,i) => {
      const sx = s.x + (STAGE_W/2) - 40;
      ctx.fillStyle = '#1A242F';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(sx, STAGE_Y, 80, STAGE_H, 4);
      ctx.fill(); ctx.stroke();
      ctx.font = `700 8.5px 'DM Mono', monospace`;
      ctx.fillStyle = s.color;
      ctx.textAlign = 'center';
      ctx.fillText(s.name, sx+40, STAGE_Y+19);
      ctx.font = `600 7.5px 'DM Mono', monospace`;
      ctx.fillStyle = colors.muted;
      ctx.fillText(s.sub, sx+40, STAGE_Y+33);
    });
  }

  function drawParticles(){
    particles.forEach(p => {
      if(!p.alive) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fillStyle = p.rejected ? colors.muted : p.color;
      ctx.globalAlpha = p.rejected ? Math.max(0, 1 - p.progress*2) : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function updateParticles(){
    const totalWidth = STAGES[STAGES.length-1].x + STAGE_W/2 + 40;
    particles.forEach(p => {
      if(!p.alive) return;
      if(p.rejected){
        p.y += 2; p.x += 0.5; p.progress += 0.04;
        if(p.progress > 1) p.alive = false;
        return;
      }
      p.x += p.speed * (totalWidth - 10);
      STAGES.forEach((s,i) => {
        const sx = s.x + STAGE_W/2;
        if(Math.abs(p.x - sx) < 5 && p.rejStage !== i){
          p.rejStage = i;
          if(Math.random() < 0.4){ p.rejected = true; p.progress = 0; filtered++; }
        }
      });
      if(p.x > totalWidth){ p.alive = false; passed++; }
    });
    particles = particles.filter(p => p.alive || p.rejected);
  }

  function loop(){
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0,0,W,H);
    drawGrid();

    ctx.beginPath();
    ctx.moveTo(10, H/2); ctx.lineTo(W-40, H/2);
    ctx.strokeStyle = 'rgba(232,236,240,0.08)';
    ctx.lineWidth = 2; ctx.stroke();

    drawStages();
    if(running) {
      updateParticles();
      frameCount++;
      if(frameCount % 25 === 0) spawnParticle();
      lbl.textContent = `STATE: ACTIVE — ${passed} passed, ${filtered} filtered`;
    }
    drawParticles();

    ctx.font = `700 9px 'DM Mono', monospace`;
    ctx.fillStyle = colors.teal;
    ctx.textAlign = 'left';
    ctx.fillText(`PASSED: ${passed}`, 12, H-14);
    ctx.fillStyle = colors.muted;
    ctx.textAlign = 'right';
    ctx.fillText(`FILTERED: ${filtered}`, W-12, H-14);
    
    raf = requestAnimationFrame(loop);
  }

  runBtn.addEventListener('click', () => {
    running = !running;
    if(running){
      passed = 0; filtered = 0; particles = []; frameCount = 0;
      runBtn.textContent = 'Stop';
      runBtn.style.background = 'rgba(232,236,240,0.1)';
    } else {
      runBtn.textContent = 'Run Pipeline';
      runBtn.style.background = 'rgba(232,236,240,0.1)';
      lbl.textContent = `STATE: STANDBY — ${passed} candidates passed`;
    }
  });
  loop();
})();

/* ══════════════════════════════════════════════════════
   DEMO 4 — ENZYME CAP DOMAIN: Conformational Control
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('enzymeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const btn = document.getElementById('enzymeToggle');
  const lbl = document.getElementById('enzymeLabel');

  const colors = {
    bg: '#0F1722',
    grid: 'rgba(61, 217, 192, 0.08)',
    teal: '#3DD9C0',
    blue: '#6BA3E8',
    muted: '#4C6A8D',
    textDim: 'rgba(232, 236, 240, 0.7)'
  };

  let ligandPresent = false, capAngle = 0, ligandProgress = 0, animDir = 0, raf;
  const CENTER = { x: W/2, y: H/2 + 10 };
  const BODY_R = 52;
  const CAP_LENGTH = 60;

  function ease(t){ return t<0.5?2*t*t:-1+(4-2*t)*t; }

  function drawGrid() {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for(let x=0; x<=W+30; x+=30) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for(let y=0; y<=H+30; y+=30) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function drawBody(){
    const grd = ctx.createRadialGradient(CENTER.x-10, CENTER.y-10, 5, CENTER.x, CENTER.y, BODY_R);
    grd.addColorStop(0, '#1B3A5C');
    grd.addColorStop(1, '#121B26');
    ctx.beginPath();
    ctx.ellipse(CENTER.x, CENTER.y, BODY_R, BODY_R*0.85, 0, 0, Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(61, 217, 192, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y - BODY_R*0.6, 18, 0, Math.PI);
    ctx.fillStyle = 'rgba(12, 27, 38, 0.8)';
    ctx.fill();
    
    ctx.font = `700 8px 'DM Mono', monospace`;
    ctx.fillStyle = colors.teal;
    ctx.textAlign = 'center';
    ctx.fillText('ENZYME CORE', CENTER.x, CENTER.y + 6);
  }

  function drawCap(t){
    const et = ease(Math.max(0, Math.min(1, t)));
    const pivotX = CENTER.x - 20;
    const pivotY = CENTER.y - BODY_R * 0.55;
    const openAngle = -0.4, closedAngle = 0.95;
    const angle = openAngle + (closedAngle - openAngle) * et;
    const tipX = pivotX + Math.cos(angle) * CAP_LENGTH;
    const tipY = pivotY + Math.sin(angle) * CAP_LENGTH;
    
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    const headR = 14;
    const headGrd = ctx.createRadialGradient(tipX-3, tipY-3, 2, tipX, tipY, headR);
    headGrd.addColorStop(0, colors.blue);
    headGrd.addColorStop(1, '#1B3A5C');
    ctx.beginPath();
    ctx.arc(tipX, tipY, headR, 0, Math.PI*2);
    ctx.fillStyle = headGrd;
    ctx.fill();
    
    ctx.font = `600 8px 'DM Mono', monospace`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'left';
    ctx.fillText('CAP DOMAIN', tipX + 18, tipY + 3);
    return { tipX, tipY };
  }

  function drawLigand(){
    if(!ligandPresent && ligandProgress <= 0) return;
    const et = ease(Math.max(0, Math.min(1, ligandProgress)));
    const startX = W - 40, startY = 40;
    const endX = CENTER.x + 30, endY = CENTER.y - 70;
    const lx = startX + (endX - startX) * et;
    const ly = startY + (endY - startY) * et;
    
    ctx.beginPath();
    ctx.arc(lx, ly, 9, 0, Math.PI*2);
    ctx.fillStyle = colors.teal;
    ctx.fill();
    
    ctx.font = `700 8px 'DM Mono', monospace`;
    ctx.fillStyle = colors.teal;
    ctx.textAlign = 'center';
    ctx.fillText('LIGAND', lx, ly - 14);
  }

  function draw(){
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0,0,W,H);
    drawGrid();
    drawBody();
    drawLigand();
    drawCap(capAngle);
    
    const stateText = capAngle > 0.5 ? 'STATE: CLOSED (BLOCKED)' : 'STATE: OPEN (ACCESSIBLE)';
    ctx.font = `700 11px 'DM Mono', monospace`;
    ctx.fillStyle = capAngle > 0.5 ? colors.muted : colors.teal;
    ctx.textAlign = 'center';
    ctx.fillText(stateText, CENTER.x, H - 20);
  }

  function animate(){
    let done = true;
    if(animDir !== 0){
      capAngle += animDir * 0.02;
      ligandProgress += animDir * 0.025;
      capAngle = Math.max(0, Math.min(1, capAngle));
      ligandProgress = Math.max(0, Math.min(1, ligandProgress));
      if(capAngle > 0 && capAngle < 1) done = false;
    }
    draw();
    if(!done) raf = requestAnimationFrame(animate);
  }

  btn.addEventListener('click', () => {
    ligandPresent = !ligandPresent;
    animDir = ligandPresent ? 1 : -1;
    btn.textContent = ligandPresent ? 'Remove Signal' : 'Add Signal';
    btn.style.background = 'rgba(232,236,240,0.1)';
    lbl.textContent = ligandPresent ? 'Signal localized — conformational closure in progress' : 'Signal absent — cap in default open state';
    cancelAnimationFrame(raf);
    animate();
  });
  draw();
})();
