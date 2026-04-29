/* ─── COLOURS ─── */
const C = { navy:'#1B3A5C', teal:'#2E8B8B', blue:'#5A9FD4', red:'#C7483C', bg:'#F5F3F0', bg2:'#ECEAE6', muted:'#5a5a5a', text:'#1a1a1a', white:'#ffffff', border:'rgba(27,58,92,0.12)' };

/* ══════════════════════════════════════════════════════
   DEMO 1 — MOLECULAR BIT: high-fidelity transistor simulation
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('mbCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const btn = document.getElementById('mbToggle');
  const lbl = document.getElementById('mbStateLabel');

  let activation = 0, target = 0;

  // Mechanical parameters
  const R = 100, ANC = -R, LNK = 65, HNG = ANC - LNK, SWL = 65;
  const REST_ANGLE = 155 * Math.PI / 180;

  function hexToRgb(h) {
    let hex = h.trim();
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return [r, g, b];
  }

  function drawPill(len, col, w) {
    ctx.beginPath();
    ctx.arc(0, 0, w/2, 0, Math.PI);
    ctx.lineTo(-w/2, -len);
    ctx.arc(0, -len, w/2, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  }

  function drawRtpa(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    const spikes = 10;
    for(let i=0; i<spikes*2; i++) {
      let r = (i%2 === 0) ? 45 : 25;
      let angle = (i * Math.PI) / spikes;
      ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
    }
    ctx.closePath();
    ctx.fillStyle = '#E85A4F';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function loop() {
    activation += (target - activation) * 0.12;
    ctx.clearRect(0, 0, W, H);

    const teal = '#3DD9C0';
    const blue = '#6BA3E8';
    const navy = '#1B3A5C';

    ctx.save();
    ctx.translate(W/2, H/2 + 50);
    ctx.scale(0.8, 0.8);

    if (activation > 0.01) {
      const [r, g, b] = hexToRgb(teal);
      const grd = ctx.createRadialGradient(0, 0, R, 0, 0, R + 40);
      grd.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 * activation})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(0, 0, R + 40, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI*2);
    ctx.fillStyle = '#1a242f'; ctx.fill();
    ctx.strokeStyle = activation > 0.5 ? teal : blue;
    ctx.lineWidth = 3; ctx.stroke();

    ctx.beginPath(); ctx.arc(0, 0, R*0.5, 0, Math.PI*2);
    ctx.strokeStyle = activation > 0.8 ? teal : 'rgba(255,255,255,0.1)';
    ctx.stroke();

    ctx.save();
    ctx.translate(0, ANC);
    drawPill(LNK, blue, 18);
    ctx.restore();

    const angle = REST_ANGLE * (1 - activation);
    ctx.save();
    ctx.translate(0, HNG);
    ctx.rotate(angle);
    drawRtpa(0, -SWL - 10, 0.3);
    drawPill(SWL, teal, 18);
    ctx.restore();

    ctx.beginPath(); ctx.arc(0, HNG, 12, 0, Math.PI*2); ctx.fillStyle = '#2c3e50'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, ANC, 10, 0, Math.PI*2); ctx.fillStyle = navy; ctx.fill();

    ctx.restore();

    if (activation > 0.8) {
      lbl.textContent = 'Drug State: ACTIVATED (Field Applied)';
      lbl.style.color = teal;
    } else {
      lbl.textContent = 'Drug State: Inactive (Safe)';
      lbl.style.color = '';
    }

    requestAnimationFrame(loop);
  }

  btn.addEventListener('mousedown', () => { target = 1; btn.textContent = 'Field Active'; });
  window.addEventListener('mouseup', () => { target = 0; btn.textContent = 'Apply Field →'; });
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); target = 1; btn.textContent = 'Field Active'; });
  btn.addEventListener('touchend', () => { target = 0; btn.textContent = 'Apply Field →'; });

  loop();
})();

/* ══════════════════════════════════════════════════════
   DEMO 2 — UAV TRACKING: Object Permanence & Prediction
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('uavCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lbl = document.getElementById('uavLabel');
  const resetBtn = document.getElementById('uavReset');

  let t = 0, raf;
  const SPEED = 0.0035;

  // Simulation entities
  const OBSTACLE = { x: W/2 - 40, y: H/2 - 60, w: 80, h: 120 };
  const DRONE = { x: 50, y: H - 50 };

  function targetPos(tt) {
    // Horizontal pass with a slight curve
    const x = -50 + tt * (W + 100);
    const y = H/2 - 20 + Math.sin(tt * Math.PI * 2) * 30;
    return { x, y };
  }

  function lineIntersectsRect(p1, p2, r) {
    // Standard segment-rectangle intersection (simplified for this demo)
    // We check if the target is behind the obstacle relative to the drone
    const tx = p2.x, ty = p2.y;
    return (tx > r.x && tx < r.x + r.w && ty > r.y && ty < r.y + r.h);
  }

  function drawDrone(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Body
    ctx.fillStyle = '#E8ECF0';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0F1722';
    ctx.fillRect(0, 0, W, H);

    const tgt = targetPos(t);
    const isOccluded = tgt.x > OBSTACLE.x - 10 && tgt.x < OBSTACLE.x + OBSTACLE.w + 10;

    // 1. Draw Field of View (FOV)
    ctx.save();
    const angleToTarget = Math.atan2(tgt.y - DRONE.y, tgt.x - DRONE.x);
    // Predicted angle if occluded: look at the far edge of the obstacle
    const exitPos = targetPos(Math.min(1, t + 0.15));
    const lookAngle = isOccluded ? Math.atan2(exitPos.y - DRONE.y, exitPos.x - DRONE.x) : angleToTarget;

    ctx.beginPath();
    ctx.moveTo(DRONE.x, DRONE.y);
    ctx.arc(DRONE.x, DRONE.y, 600, lookAngle - 0.2, lookAngle + 0.2);
    ctx.lineTo(DRONE.x, DRONE.y);
    const fovGrd = ctx.createRadialGradient(DRONE.x, DRONE.y, 50, DRONE.x, DRONE.y, 400);
    fovGrd.addColorStop(0, 'rgba(61, 217, 192, 0.15)');
    fovGrd.addColorStop(1, 'transparent');
    ctx.fillStyle = fovGrd;
    ctx.fill();
    ctx.restore();

    // 2. Draw Obstacle
    ctx.fillStyle = '#1A242F';
    ctx.strokeStyle = 'rgba(232, 236, 240, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(OBSTACLE.x, OBSTACLE.y, OBSTACLE.w, OBSTACLE.h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.font = `9px 'DM Mono', monospace`;
    ctx.fillStyle = 'rgba(232, 236, 240, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('OBSTACLE', OBSTACLE.x + OBSTACLE.w/2, OBSTACLE.y + OBSTACLE.h/2 + 4);

    // 3. Draw Prediction path (dashed)
    if (isOccluded) {
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(tgt.x - 40, tgt.y);
      for(let i=1; i<=10; i++) {
        const p = targetPos(t + i*0.015);
        ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#6BA3E8';
      ctx.stroke();
      ctx.setLineDash([]);

      // Predicted ghost target
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, 6, 0, Math.PI*2);
      ctx.strokeStyle = '#6BA3E8';
      ctx.stroke();
      ctx.font = `8px 'DM Mono', monospace`;
      ctx.fillStyle = '#6BA3E8';
      ctx.textAlign = 'left';
      ctx.fillText('predicted state', tgt.x + 10, tgt.y + 4);
    }

    // 4. Draw Actual Target (only if not occluded)
    if (!isOccluded) {
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, 7, 0, Math.PI*2);
      ctx.fillStyle = '#E85A4F';
      ctx.fill();
      ctx.font = `8px 'DM Mono', monospace`;
      ctx.fillStyle = '#E85A4F';
      ctx.textAlign = 'left';
      ctx.fillText('active target', tgt.x + 10, tgt.y + 4);
    }

    // 5. Draw Drone
    drawDrone(DRONE.x, DRONE.y, lookAngle);
    ctx.font = `8px 'DM Mono', monospace`;
    ctx.fillStyle = '#E8ECF0';
    ctx.textAlign = 'center';
    ctx.fillText('uav-cam', DRONE.x, DRONE.y + 25);

    lbl.textContent = isOccluded
      ? 'Target occluded — shifting gaze to predicted exit point'
      : 'Target acquired — tracking state';

    t += SPEED;
    if (t > 1) t = 0;
    raf = requestAnimationFrame(loop);
  }

  resetBtn.addEventListener('click', () => { t = 0; });
  loop();
})();

/* ══════════════════════════════════════════════════════
   DEMO 3 — PIPELINE FLOW
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('pipeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lbl = document.getElementById('pipeLabel');
  const runBtn = document.getElementById('pipeRun');

  const STAGES = [
    { name:'RFdiffusion', sub:'Generate structures', color:'#E8ECF0', x:50 },
    { name:'ProteinMPNN', sub:'Design sequences', color:'#3DD9C0', x:160 },
    { name:'ESMFold', sub:'Predict fold', color:'#6BA3E8', x:270 },
    { name:'Rosetta', sub:'Score stability', color:'#A8D1FF', x:380 },
  ];
  const STAGE_W = 80, STAGE_H = 52, STAGE_Y = H/2 - STAGE_H/2;

  let particles = [];
  let running = false;
  let raf;
  let passed = 0, filtered = 0;
  let frameCount = 0;

  function spawnParticle(){
    particles.push({ x: 10, y: H/2, stage:-1, progress:0, speed:0.012+Math.random()*0.008, color:'#3DD9C0', alive:true, rejected:false, rejStage:-1, vy:0 });
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
      ctx.font = `500 8.5px 'DM Mono', monospace`;
      ctx.fillStyle = s.color;
      ctx.textAlign = 'center';
      ctx.fillText(s.name, sx+40, STAGE_Y+19);
      ctx.font = `7.5px 'DM Mono', monospace`;
      ctx.fillStyle = 'rgba(232,236,240,0.6)';
      ctx.fillText(s.sub, sx+40, STAGE_Y+33);
      if(i < STAGES.length-1){
        const ax = sx + 83;
        ctx.beginPath();
        ctx.moveTo(ax, H/2);
        ctx.lineTo(ax+12, H/2);
        ctx.strokeStyle = 'rgba(232,236,240,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax+12, H/2-4); ctx.lineTo(ax+16, H/2); ctx.lineTo(ax+12, H/2+4);
        ctx.stroke();
      }
    });
    ctx.font = `500 8px 'DM Mono', monospace`;
    ctx.fillStyle = '#3DD9C0';
    ctx.textAlign = 'center';
    ctx.fillText('Top Candidates', W-28, H/2+4);
    ctx.beginPath();
    ctx.arc(W-28, H/2-18, 10, 0, Math.PI*2);
    ctx.fillStyle = '#3DD9C0';
    ctx.fill();
    ctx.font = `bold 10px sans-serif`;
    ctx.fillStyle = '#121B26';
    ctx.fillText('✓', W-28, H/2-14);
  }

  function drawParticles(){
    particles.forEach(p => {
      if(!p.alive) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
      ctx.fillStyle = p.rejected ? '#E85A4F' : p.color;
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
        p.y += 2.5;
        p.x += 0.5;
        p.progress += 0.04;
        if(p.progress > 1) p.alive = false;
        return;
      }
      p.x += p.speed * (totalWidth - 10);
      STAGES.forEach((s,i) => {
        const sx = s.x + STAGE_W/2 - 40 + 40;
        if(Math.abs(p.x - sx) < 3 && p.rejStage !== i){
          p.rejStage = i;
          if(Math.random() < 0.38){
            p.rejected = true;
            p.progress = 0;
            filtered++;
          }
        }
      });
      if(p.x > totalWidth){
        p.alive = false;
        passed++;
      }
    });
    particles = particles.filter(p => p.alive || p.rejected);
  }

  function loop(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#121B26';
    ctx.fillRect(0,0,W,H);
    ctx.beginPath();
    ctx.moveTo(10, H/2);
    ctx.lineTo(W-40, H/2);
    ctx.strokeStyle = 'rgba(232,236,240,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawStages();
    if(running) updateParticles();
    drawParticles();
    ctx.font = `8px 'DM Mono', monospace`;
    ctx.fillStyle = '#3DD9C0';
    ctx.textAlign = 'left';
    ctx.fillText(`Passed: ${passed}`, 12, H-14);
    ctx.fillStyle = '#E85A4F';
    ctx.textAlign = 'right';
    ctx.fillText(`Filtered: ${filtered}`, W-12, H-14);
    if(running){
      frameCount++;
      if(frameCount % 28 === 0) spawnParticle();
      lbl.textContent = `Running… ${passed} passed, ${filtered} filtered`;
    }
    raf = requestAnimationFrame(loop);
  }

  runBtn.addEventListener('click', () => {
    if(!running){
      running = true;
      passed = 0; filtered = 0; particles = []; frameCount = 0;
      runBtn.textContent = 'Stop';
      runBtn.style.background = '#E85A4F';
    } else {
      running = false;
      runBtn.textContent = 'Run Pipeline';
      runBtn.style.background = '#3DD9C0';
      lbl.textContent = `Done — ${passed} candidates passed all stages`;
    }
  });

  loop();
})();

/* ══════════════════════════════════════════════════════
   DEMO 4 — ENZYME CAP DOMAIN
══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('enzymeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const btn = document.getElementById('enzymeToggle');
  const lbl = document.getElementById('enzymeLabel');

  let ligandPresent = false;
  let capAngle = 0;         // 0 = open, 1 = closed
  let ligandProgress = 0;   // ligand approach animation
  let animDir = 0;
  let raf;

  const CENTER = { x: W/2, y: H/2 + 10 };
  const BODY_R = 52;
  const CAP_LENGTH = 60;

  function ease(t){ return t<0.5?2*t*t:-1+(4-2*t)*t; }

  function drawBody(){
    const grd = ctx.createRadialGradient(CENTER.x-10, CENTER.y-10, 5, CENTER.x, CENTER.y, BODY_R);
    grd.addColorStop(0, '#1B3A5C');
    grd.addColorStop(1, '#121B26');
    ctx.beginPath();
    ctx.ellipse(CENTER.x, CENTER.y, BODY_R, BODY_R*0.85, 0, 0, Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(61, 217, 192, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y - BODY_R*0.6, 18, 0, Math.PI);
    ctx.fillStyle = 'rgba(12, 27, 38, 0.8)';
    ctx.fill();
    ctx.font = `8px 'DM Mono', monospace`;
    ctx.fillStyle = '#3DD9C0';
    ctx.textAlign = 'center';
    ctx.fillText('enzyme', CENTER.x, CENTER.y + 6);
    ctx.fillStyle = 'rgba(61, 217, 192, 0.6)';
    ctx.fillText('active site ↑', CENTER.x, CENTER.y - 20);
  }

  function drawCap(t){
    const et = ease(Math.max(0, Math.min(1, t)));
    const pivotX = CENTER.x - 20;
    const pivotY = CENTER.y - BODY_R * 0.55;
    const openAngle = -0.4;
    const closedAngle = 0.95;
    const angle = openAngle + (closedAngle - openAngle) * et;
    const tipX = pivotX + Math.cos(angle) * CAP_LENGTH;
    const tipY = pivotY + Math.sin(angle) * CAP_LENGTH;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = '#E8ECF0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
    const headR = 14;
    const headGrd = ctx.createRadialGradient(tipX-3, tipY-3, 2, tipX, tipY, headR);
    headGrd.addColorStop(0, '#6BA3E8');
    headGrd.addColorStop(1, '#1B3A5C');
    ctx.beginPath();
    ctx.arc(tipX, tipY, headR, 0, Math.PI*2);
    ctx.fillStyle = headGrd;
    ctx.fill();
    ctx.font = `500 8px 'DM Mono', monospace`;
    ctx.fillStyle = '#E8ECF0';
    ctx.textAlign = 'left';
    ctx.fillText('cap domain', tipX + 16, tipY + 3);
    return { tipX, tipY };
  }

  function drawLigand(t){
    if(!ligandPresent && ligandProgress <= 0) return;
    const et = ease(Math.max(0, Math.min(1, ligandProgress)));
    const startX = W - 40, startY = 40;
    const endX = CENTER.x + 30, endY = CENTER.y - 70;
    const lx = startX + (endX - startX) * et;
    const ly = startY + (endY - startY) * et;
    ctx.beginPath();
    ctx.arc(lx, ly, 9, 0, Math.PI*2);
    ctx.fillStyle = '#3DD9C0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx-7, ly+5, 5, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(61, 217, 192, 0.7)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx+6, ly+4, 4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(61, 217, 192, 0.5)';
    ctx.fill();
    ctx.font = `8px 'DM Mono', monospace`;
    ctx.fillStyle = '#3DD9C0';
    ctx.textAlign = 'center';
    ctx.fillText('ligand', lx, ly - 14);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#121B26';
    ctx.fillRect(0,0,W,H);
    drawBody();
    drawLigand(ligandProgress);
    drawCap(capAngle);
    const stateText = capAngle > 0.5 ? 'CLOSED — substrate blocked' : 'OPEN — substrate accessible';
    ctx.font = `500 9px 'DM Mono', monospace`;
    ctx.fillStyle = capAngle > 0.5 ? '#E85A4F' : '#3DD9C0';
    ctx.textAlign = 'center';
    ctx.fillText(stateText, CENTER.x, H - 18);
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
    btn.textContent = ligandPresent ? 'Remove Ligand' : 'Add Ligand';
    btn.style.background = ligandPresent ? '#E85A4F' : '#6BA3E8';
    lbl.textContent = ligandPresent ? 'Ligand bound — cap closing, active site blocked' : 'No ligand — cap open, substrate accessible';
    cancelAnimationFrame(raf);
    animate();
  });

  draw();
})();
