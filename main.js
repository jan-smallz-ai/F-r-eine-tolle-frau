// main.js – Geschenk 4 (Fix: Modal nicht automatisch öffnen)
// Enthüllung erst nach "Schütteln" (oder Klicks am Handy/PC)

const modal = document.getElementById("modal");
const copyBtn = document.getElementById("copyBtn");
const closeBtn = document.getElementById("closeBtn");
const codeText = document.getElementById("codeText");

// Falls du im HTML schon einen Button hast, der "Geschenk schütteln" heißt,
// gib ihm bitte id="shakeBtn". Wenn nicht: wir fangen trotzdem Klicks auf der Seite ab.
const shakeBtn = document.getElementById("shakeBtn");

let progress = 0;
let revealed = false;

function openModal(){
  if (revealed) return;
  revealed = true;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function bumpProgress(amount){
  if (revealed) return;
  progress = Math.min(100, progress + amount);

  // Optional: Wenn du irgendwo einen Progress-Balken hast:
  const meter = document.querySelector("[data-meter]");
  if (meter) meter.style.width = progress + "%";

  // ab 100% enthüllen
  if (progress >= 100) openModal();
}

// --- Klick-Interaktion (PC & Handy) ---
function clickShake(){
  // kleine, schnelle Schritte – fühlt sich nach „Minispiel“ an
  bumpProgress(14);
}

// Button, falls vorhanden
if (shakeBtn){
  shakeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clickShake();
  });
}

// Fallback: Tippen/Klicken irgendwo auf Geschenkbereich, wenn Button fehlt
document.addEventListener("click", (e) => {
  // Wenn Modal offen ist: Klicks nicht als Schütteln zählen
  if (modal.classList.contains("show")) return;

  // Wenn jemand auf "Kopieren/Schließen" klickt, nicht mitzählen
  if (e.target === copyBtn || e.target === closeBtn) return;

  clickShake();
}, { passive: true });

// --- Bewegungssensor (Handy schütteln) ---
let lastShake = 0;

function handleMotion(event){
  if (revealed) return;

  const a = event.accelerationIncludingGravity;
  if (!a) return;

  const x = a.x || 0;
  const y = a.y || 0;
  const z = a.z || 0;

  const magnitude = Math.sqrt(x*x + y*y + z*z);
  const now = Date.now();

  // simple shake detection
  if (magnitude > 18 && (now - lastShake) > 250){
    lastShake = now;
    bumpProgress(22);
  }
}

// iOS braucht Permission – wir versuchen’s freundlich
async function enableMotion(){
  try{
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"){
      const res = await DeviceMotionEvent.requestPermission();
      if (res === "granted"){
        window.addEventListener("devicemotion", handleMotion, { passive: true });
      }
    }else{
      window.addEventListener("devicemotion", handleMotion, { passive: true });
    }
  }catch(_){
    // Wenn Permission nicht klappt: ist nicht schlimm – Klick funktioniert trotzdem.
  }
}

// Wir aktivieren Motion beim ersten User-Input (wichtig für Mobile Browser Regeln)
window.addEventListener("touchstart", enableMotion, { once: true, passive: true });
window.addEventListener("click", enableMotion, { once: true, passive: true });

// --- Copy ---
copyBtn?.addEventListener("click", async () => {
  const text = (codeText?.textContent || "").trim();
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Kopiert ✅";
    setTimeout(() => copyBtn.textContent = "Kopieren", 1200);
  }catch(_){
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copyBtn.textContent = "Kopiert ✅";
    setTimeout(() => copyBtn.textContent = "Kopieren", 1200);
  }
});

closeBtn?.addEventListener("click", closeModal);

// Klick auf dunklen Hintergrund schließt auch
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// WICHTIG: KEIN openModal() beim Laden!
// -> Modal bleibt zu, bis progress >= 100
