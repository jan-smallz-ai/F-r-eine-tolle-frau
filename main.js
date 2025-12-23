// ====== Einstellungen ======
const STEAM_CODE = "STEAM-CODE-HIER-EINFÜGEN"; // <-- HIER später deinen echten Code rein

// Tap-Landing
const TAPS_NEEDED = 2;

// Scratch-Off (wie viel % müssen weg sein)
const SCRATCH_CLEAR_THRESHOLD = 0.62;

// Geschenk: Tippen oder Schütteln bis Reveal
const GIFT_TAPS_NEEDED = 4;
const SHAKE_THRESHOLD = 16; // grob, je nach Handy

// ====== DOM ======
const stage1 = document.getElementById("stage1");
const stage2 = document.getElementById("stage2");
const stage3 = document.getElementById("stage3");

const hint = document.getElementById("hint");
const santaCow = document.getElementById("santaCow");
const tapBadge = document.getElementById("tapBadge");
const tapNeed = document.getElementById("tapNeed");

const scratch = document.getElementById("scratch");
const toStage3 = document.getElementById("toStage3");

const gift = document.getElementById("gift");
const codeCard = document.getElementById("codeCard");
const steamCodeEl = document.getElementById("steamCode");
const copyBtn = document.getElementById("copyBtn");
const copyMsg = document.getElementById("copyMsg");

// ====== State ======
let taps = 0;
let giftTaps = 0;
let landed = false;
let audioUnlocked = false;

// ====== Helpers ======
function showStage(n){
  stage1.classList.remove("stage--active");
  stage2.classList.remove("stage--active");
  stage3.classList.remove("stage--active");
  hint.textContent = "";

  if(n === 1){
    stage1.classList.add("stage--active");
    hint.textContent = "Tipp: Tippe Santa auf der Kuh an, um ihn zu landen!";
  }
  if(n === 2){
    stage2.classList.add("stage--active");
    hint.textContent = "Wisch den Schnee weg – dann geht’s weiter.";
  }
  if(n === 3){
    stage3.classList.add("stage--active");
    hint.textContent = "Schütteln oder Tippen – erst dann kommt der Code.";
  }
}

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

// Kleiner “Jingle” (WebAudio), läuft erst nach User-Interaktion
let audioCtx = null;
function tryUnlockAudio(){
  if(audioUnlocked) return;
  audioUnlocked = true;
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }catch(e){
    audioCtx = null;
  }
}
function beep(freq, time=0.08, gain=0.08, when=0){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g); g.connect(audioCtx.destination);
  const t0 = audioCtx.currentTime + when;
  o.start(t0);
  o.stop(t0 + time);
}
function playTinyJingle(){
  if(!audioCtx) return;
  // kurzer, lustiger Klang (kein Lied)
  beep(880, .07, .06, 0.00);
  beep(660, .07, .06, 0.08);
  beep(990, .09, .07, 0.16);
  beep(1320,.11, .07, 0.28);
}

// ====== STAGE 1: Tap-Landing ======
tapNeed.textContent = String(TAPS_NEEDED);
tapBadge.textContent = `Treffer: 0 / ${TAPS_NEEDED}`;

function registerTap(){
  if(landed) return;
  tryUnlockAudio();

  taps++;
  tapBadge.textContent = `Treffer: ${taps} / ${TAPS_NEEDED}`;

  // kleines Feedback
  santaCow.animate(
    [{ transform: "translate(-50%,-50%) scale(1)" }, { transform: "translate(-50%,-50%) scale(0.97)" }, { transform: "translate(-50%,-50%) scale(1)" }],
    { duration: 160 }
  );

  if(taps >= TAPS_NEEDED){
    landed = true;
    playTinyJingle();

    // Flug stoppen + “Absturz” in Stage 2
    santaCow.style.animation = "none";
    santaCow.style.left = "55%";
    santaCow.style.top = "40%";

    // kleiner Drop
    santaCow.animate(
      [{ transform: "translate(-50%,-50%) rotate(0deg)" }, { transform: "translate(-50%,-10%) rotate(6deg)" }],
      { duration: 650, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    setTimeout(() => {
      showStage(2);
      initScratch();
    }, 680);
  }
}

santaCow.addEventListener("pointerdown", registerTap, { passive: true });

// ====== STAGE 2: Scratch-Off Schnee ======
let ctx = null;
let isScratching = false;
let lastX = 0, lastY = 0;

function resizeCanvasToDisplaySize(canvas){
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  return dpr;
}

function drawSnowLayer(){
  const w = scratch.width;
  const h = scratch.height;
  ctx.clearRect(0,0,w,h);

  // Schneeschicht
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(0,0,w,h);

  // “Flocken”
  ctx.globalAlpha = 0.25;
  for(let i=0;i<180;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = 2 + Math.random()*6;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = "rgba(220,240,255,1)";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Text-Hinweis
  ctx.fillStyle = "rgba(20,40,70,0.55)";
  ctx.font = `${Math.floor(w/28)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText("WISCH DEN SCHNEE WEG", w/2, h/2);
}

function scratchAt(x,y, radius){
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function getScratchPercentCleared(){
  // Grobe Messung: wir sampeln Pixel, um Performance zu halten
  const w = scratch.width, h = scratch.height;
  const img = ctx.getImageData(0,0,w,h).data;
  const step = 16; // sampling step
  let total = 0, cleared = 0;

  for(let y=0; y<h; y+=step){
    for(let x=0; x<w; x+=step){
      const idx = (y*w + x)*4 + 3; // alpha
      const a = img[idx];
      total++;
      if(a < 20) cleared++;
    }
  }
  return cleared / total;
}

function pointerPos(ev){
  const rect = scratch.getBoundingClientRect();
  const dpr = scratch.width / rect.width;
  const x = (ev.clientX - rect.left) * dpr;
  const y = (ev.clientY - rect.top) * dpr;
  return {x,y};
}

function initScratch(){
  // Button reset
  toStage3.disabled = true;
  toStage3.classList.add("btn--disabled");

  ctx = scratch.getContext("2d", { willReadFrequently: true });
  resizeCanvasToDisplaySize(scratch);
  drawSnowLayer();

  const radiusBase = Math.max(26, scratch.width * 0.03);

  function start(ev){
    tryUnlockAudio();
    isScratching = true;
    const p = pointerPos(ev);
    lastX = p.x; lastY = p.y;
    scratchAt(p.x,p.y, radiusBase);
  }
  function move(ev){
    if(!isScratching) return;
    const p = pointerPos(ev);

    // Linie aus “Kreisen”, damit es weich wirkt
    const dx = p.x - lastX;
    const dy = p.y - lastY;
    const dist = Math.hypot(dx,dy);
    const steps = Math.max(1, Math.floor(dist / 8));

    for(let i=0;i<steps;i++){
      const t = i/steps;
      scratchAt(lastX + dx*t, lastY + dy*t, radiusBase);
    }

    lastX = p.x; lastY = p.y;

    // Check Fortschritt
    const cleared = getScratchPercentCleared();
    if(cleared >= SCRATCH_CLEAR_THRESHOLD){
      isScratching = false;
      toStage3.disabled = false;
      toStage3.classList.remove("btn--disabled");
      playTinyJingle();
      // Leichtes “Finish”-Fading
      scratch.style.transition = "opacity 500ms ease";
      scratch.style.opacity = "0.25";
    }
  }
  function end(){ isScratching = false; }

  scratch.onpointerdown = (ev)=>{ scratch.setPointerCapture(ev.pointerId); start(ev); };
  scratch.onpointermove = move;
  scratch.onpointerup = end;
  scratch.onpointercancel = end;

  window.addEventListener("resize", () => {
    resizeCanvasToDisplaySize(scratch);
    drawSnowLayer();
  }, { passive:true });
}

toStage3.addEventListener("click", () => {
  tryUnlockAudio();
  showStage(3);
});

// ====== STAGE 3: Geschenk öffnen ======
steamCodeEl.textContent = STEAM_CODE;

function revealCode(){
  if(!codeCard.classList.contains("hidden")) return;
  codeCard.classList.remove("hidden");
  playTinyJingle();

  // Geschenk-Deckel “auf”
  const lid = gift.querySelector(".gift__lid");
  lid.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(-22deg) translateY(-6px)" }],
    { duration: 380, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );
}

function giftTap(){
  tryUnlockAudio();
  giftTaps++;
  gift.animate(
    [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(2deg) scale(0.985)" }, { transform: "rotate(-2deg) scale(1)" }],
    { duration: 220 }
  );
  if(giftTaps >= GIFT_TAPS_NEEDED){
    revealCode();
  }
}

gift.addEventListener("pointerdown", giftTap, { passive:true });

// Device motion shake
let lastShake = 0;
if (window.DeviceMotionEvent) {
  window.addEventListener("devicemotion", (e) => {
    const acc = e.accelerationIncludingGravity;
    if(!acc) return;

    const now = Date.now();
    if(now - lastShake < 250) return;

    const magnitude = Math.sqrt(
      (acc.x || 0) * (acc.x || 0) +
      (acc.y || 0) * (acc.y || 0) +
      (acc.z || 0) * (acc.z || 0)
    );

    if(magnitude > SHAKE_THRESHOLD){
      lastShake = now;
      giftTap();
    }
  }, { passive:true });
}

// Copy
copyBtn.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(steamCodeEl.textContent.trim());
    copyMsg.textContent = "Kopiert! 🎉";
    setTimeout(()=> copyMsg.textContent = "", 1600);
  }catch(e){
    // Fallback: markieren
    const range = document.createRange();
    range.selectNodeContents(steamCodeEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    copyMsg.textContent = "Konnte nicht automatisch kopieren – bitte manuell markieren & kopieren.";
  }
});

// Start
showStage(1);
