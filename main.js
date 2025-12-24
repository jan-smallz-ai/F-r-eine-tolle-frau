// ====== HIER DEN GUTSCHEINCODE EINTRAGEN ======
const GUTSCHEIN_CODE = "XXXX-XXXX-XXXX"; // <-- später ersetzen
// ============================================

const $ = (sel) => document.querySelector(sel);

const screens = {
  intro: $("#screen-intro"),
  wipe: $("#screen-wipe"),
  balls: $("#screen-balls"),
  reveal: $("#screen-reveal"),
};

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0,0);
}

// Buttons
$("#btn-start").addEventListener("click", () => showScreen("wipe"));

// ===== Snow Wipe =====
const canvas = $("#wipeCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const wipeBar = $("#wipeBar");
const wipePct = $("#wipePct");
const btnToBalls = $("#btn-to-balls");

let isDown = false;
let last = null;
let clearedPercent = 0;

function resizeCanvas(){
  // Set canvas internal size to match CSS pixels (devicePixelRatio-scharf)
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixel coords

  // Redraw snow layer
  drawSnowLayer(rect.width, rect.height);
  clearedPercent = 0;
  updateProgress(0);
  btnToBalls.disabled = true;
}

function drawSnowLayer(w, h){
  // "Schnee" als deckende Schicht mit etwas Struktur
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0,0,w,h);

  // Grund-Schnee
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(0,0,w,h);

  // Strukturpunkte
  for(let i=0;i<600;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = Math.random()*2.2 + 0.4;
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.55})`;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }

  // leichte "Kälte"-Tönung
  ctx.fillStyle = "rgba(160,210,255,0.12)";
  ctx.fillRect(0,0,w,h);
}

function getPos(e){
  const rect = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

function eraseAt(x,y){
  // Radier-Pinsel
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x,y, 26, 0, Math.PI*2);
  ctx.fill();

  // Verbindung für "Striche"
  if(last){
    ctx.lineWidth = 56;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x,y);
    ctx.stroke();
  }
  last = {x,y};
}

function computeCleared(){
  // Stichprobe (schneller als jeden Pixel)
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0,0,w,h).data;

  // Sample-Grid: alle N Pixel
  const step = 20; // höher = schneller, niedriger = genauer
  let total = 0;
  let cleared = 0;

  for(let y=0; y<h; y+=step){
    for(let x=0; x<w; x+=step){
      const i = (y*w + x)*4 + 3; // alpha
      total++;
      if(img[i] === 0) cleared++;
    }
  }
  return Math.round((cleared/total)*100);
}

function updateProgress(p){
  wipeBar.style.width = `${p}%`;
  wipePct.textContent = `${p}%`;
}

function onDown(e){
  isDown = true;
  last = null;
  const p = getPos(e);
  eraseAt(p.x,p.y);
  e.preventDefault();
}
function onMove(e){
  if(!isDown) return;
  const p = getPos(e);
  eraseAt(p.x,p.y);

  // Fortschritt nicht bei jedem Move berechnen -> etwas drosseln
  if (Math.random() < 0.25){
    clearedPercent = computeCleared();
    updateProgress(clearedPercent);
    if(clearedPercent >= 55){
      btnToBalls.disabled = false;
    }
  }
  e.preventDefault();
}
function onUp(){
  isDown = false;
  last = null;
  clearedPercent = computeCleared();
  updateProgress(clearedPercent);
  if(clearedPercent >= 55){
    btnToBalls.disabled = false;
  }
}

canvas.addEventListener("pointerdown", onDown);
canvas.addEventListener("pointermove", onMove);
window.addEventListener("pointerup", onUp);

btnToBalls.addEventListener("click", () => showScreen("balls"));

// Resize fix für Handy / Rotation / GitHub Pages
window.addEventListener("resize", () => {
  // kleine Verzögerung, damit Layout fertig ist
  clearTimeout(window.__rz);
  window.__rz = setTimeout(resizeCanvas, 120);
});

// ===== Ornament Tap Game =====
const foundCountEl = $("#foundCount");
const btnReveal = $("#btn-reveal");
let found = new Set();

document.querySelectorAll(".ornBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.orn;
    if(found.has(id)) return;

    found.add(id);
    btn.classList.add("found");

    foundCountEl.textContent = String(found.size);

    // kleines "Pling" per Vibration (falls erlaubt)
    if (navigator.vibrate) navigator.vibrate(30);

    if(found.size >= 5){
      btnReveal.disabled = false;
    }
  });
});

btnReveal.addEventListener("click", () => {
  showScreen("reveal");
  // Code anzeigen
  $("#giftCode").textContent = GUTSCHEIN_CODE;
});

// Copy
$("#btn-copy").addEventListener("click", async () => {
  const code = GUTSCHEIN_CODE;
  try{
    await navigator.clipboard.writeText(code);
    $("#copiedMsg").classList.add("show");
    setTimeout(()=>$("#copiedMsg").classList.remove("show"), 1400);
  }catch(e){
    // Fallback: markierbar machen
    alert("Kopieren ging nicht automatisch. Bitte manuell kopieren:\n\n" + code);
  }
});

// Startzustand
showScreen("intro");

// Canvas initial nach dem ersten Render
setTimeout(resizeCanvas, 80);
