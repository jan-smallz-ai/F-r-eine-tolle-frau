// Michelles Geschenk 2.0 – Santa auf Kuh, Schnee wegwischen, Geschenk schütteln, Code kopieren
// Keine externen Assets. Sound via WebAudio (kleine festliche Melodie).

const $ = (sel) => document.querySelector(sel);

const sceneIntro = $("#sceneIntro");
const sceneSnow  = $("#sceneSnow");
const sceneGift  = $("#sceneGift");

const cowSled = $("#cowSled");
const speech = $("#speechBubble");

const snowBoard = $("#snowBoard");
const btnSkipSnow = $("#btnSkipSnow");

const giftBox = $("#giftBox");
const giftHint = $("#giftHint");
const reveal = $("#reveal");
const btnCopy = $("#btnCopy");
const copyToast = $("#copyToast");
const btnReset = $("#btnReset");

const btnSound = $("#btnSound");

let audioEnabled = false;
let audioCtx = null;

function showScene(which){
  [sceneIntro, sceneSnow, sceneGift].forEach(s => s.classList.remove("active"));
  which.classList.add("active");
}

function spawnBackgroundSnow(){
  const host = $("#bgSnow");
  host.innerHTML = "";
  const count = 55;
  for(let i=0;i<count;i++){
    const f = document.createElement("div");
    f.className = "snowflake";
    const left = Math.random()*100;
    const size = 5 + Math.random()*7;
    const dur  = 5 + Math.random()*8;
    const delay= -Math.random()*dur;
    f.style.left = left + "vw";
    f.style.width = size + "px";
    f.style.height = size + "px";
    f.style.animationDuration = dur + "s";
    f.style.animationDelay = delay + "s";
    host.appendChild(f);
  }
}

function ensureAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playFestiveBlips(){
  if(!audioEnabled) return;
  ensureAudio();
  if(audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime + 0.02;
  const notes = [
    659, 659, 659, 0,
    659, 659, 659, 0,
    659, 784, 523, 587, 659, 0,
    698, 698, 698, 698, 698, 659, 659, 659, 659, 587, 587, 659, 587, 784
  ];
  let t = now;
  for(const f of notes){
    if(f === 0){
      t += 0.11;
      continue;
    }
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = f;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);

    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + 0.11);
    t += 0.115;
  }
}

btnSound.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  btnSound.textContent = audioEnabled ? "🔈 Sound: AN" : "🔈 Sound: AUS";
  btnSound.setAttribute("aria-pressed", String(audioEnabled));
  if(audioEnabled){
    // Sound darf meist erst nach User-Geste starten:
    playFestiveBlips();
  }
});

function landCow(){
  cowSled.classList.add("landing");
  speech.textContent = "Oha… Landeanflug! 🐮💨";
  playFestiveBlips();

  // Nach der Landing-Animation zur Schneeszene
  setTimeout(() => {
    showScene(sceneSnow);
    initSnowWipe();
  }, 1200);
}

// Klick / Enter auf CowSled
cowSled.addEventListener("click", landCow, { once:true });
cowSled.addEventListener("keydown", (e) => {
  if(e.key === "Enter" || e.key === " "){
    e.preventDefault();
    landCow();
  }
}, { once:true });

// ===== Schnee-Wisch-Spiel =====
let clearedCount = 0;
let totalDots = 0;

function initSnowWipe(){
  snowBoard.innerHTML = "";
  clearedCount = 0;

  // Dots abhängig von Fläche
  const rect = snowBoard.getBoundingClientRect();
  const cols = Math.max(8, Math.floor(rect.width / 50));
  const rows = Math.max(7, Math.floor(rect.height / 55));
  totalDots = cols * rows;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const d = document.createElement("div");
      d.className = "snowGameDot";

      const jitterX = (Math.random()*10)-5;
      const jitterY = (Math.random()*10)-5;

      const x = (c/(cols-1)) * (rect.width - 34) + jitterX;
      const y = (r/(rows-1)) * (rect.height - 34) + jitterY;

      d.style.left = Math.max(0, Math.min(rect.width-34, x)) + "px";
      d.style.top  = Math.max(0, Math.min(rect.height-34, y)) + "px";

      snowBoard.appendChild(d);
    }
  }

  const onWipe = (clientX, clientY) => {
    const boardRect = snowBoard.getBoundingClientRect();
    const x = clientX - boardRect.left;
    const y = clientY - boardRect.top;

    const dots = [...snowBoard.querySelectorAll(".snowGameDot")];
    for(const dot of dots){
      const dx = (dot.offsetLeft + 17) - x;
      const dy = (dot.offsetTop + 17) - y;
      const dist = Math.hypot(dx, dy);
      if(dist < 28){
        dot.remove();
        clearedCount++;
      }
    }

    // reicht: ca. 55% weg
    if(clearedCount >= Math.floor(totalDots * 0.55)){
      finishSnow();
    }
  };

  let wiping = false;

  snowBoard.onpointerdown = (e) => { wiping = true; snowBoard.setPointerCapture(e.pointerId); onWipe(e.clientX, e.clientY); };
  snowBoard.onpointermove = (e) => { if(!wiping) return; onWipe(e.clientX, e.clientY); };
  snowBoard.onpointerup   = () => { wiping = false; };
  snowBoard.onpointercancel = () => { wiping = false; };

  btnSkipSnow.onclick = finishSnow;
}

function finishSnow(){
  // Cleanup handler (safe)
  snowBoard.onpointerdown = null;
  snowBoard.onpointermove = null;
  snowBoard.onpointerup = null;
  snowBoard.onpointercancel = null;

  showScene(sceneGift);
  initGift();
  playFestiveBlips();
}

// ===== Geschenk / Shake =====
let shakeCount = 0;
let lastAccel = 0;

function initGift(){
  reveal.classList.remove("show");
  giftHint.textContent = "Schütteln / Antippen!";
  shakeCount = 0;

  giftBox.addEventListener("click", handleGiftAction);
  giftBox.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      handleGiftAction();
    }
  });

  // Motion (Handy)
  if(window.DeviceMotionEvent){
    window.addEventListener("devicemotion", onMotion, { passive:true });
  }
}

function onMotion(e){
  const a = e.accelerationIncludingGravity;
  if(!a) return;
  const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
  // einfache Schwelle
  if(mag - lastAccel > 18){
    handleGiftAction(true);
  }
  lastAccel = mag;
}

function handleGiftAction(fromShake=false){
  shakeCount++;
  giftBox.classList.remove("shake");
  // reflow trick
  void giftBox.offsetWidth;
  giftBox.classList.add("shake");

  if(shakeCount === 1){
    giftHint.textContent = "Nochmal! 😄";
    return;
  }
  if(shakeCount === 2){
    giftHint.textContent = "Okay… du meinst es ernst 😏";
    return;
  }
  // ab 3: reveal
  reveal.classList.add("show");
  giftHint.textContent = "Da isser! 🎉";
  playFestiveBlips();
}

btnCopy.addEventListener("click", async () => {
  const code = $("#steamCode").textContent.trim();
  try{
    await navigator.clipboard.writeText(code);
    copyToast.classList.add("show");
    setTimeout(() => copyToast.classList.remove("show"), 1100);
  }catch{
    // Fallback: mark + copy
    const range = document.createRange();
    range.selectNodeContents($("#steamCode"));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    copyToast.classList.add("show");
    setTimeout(() => copyToast.classList.remove("show"), 1100);
  }
});

btnReset.addEventListener("click", () => {
  // reset alles
  cowSled.classList.remove("landing");
  speech.textContent = "Michelle! Hilfe! Tippe mich! 😂";
  showScene(sceneIntro);
});

// Init
spawnBackgroundSnow();
showScene(sceneIntro);
