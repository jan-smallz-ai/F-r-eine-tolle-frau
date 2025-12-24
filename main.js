(() => {
  const $ = (s) => document.querySelector(s);

  const sceneIntro  = $("#sceneIntro");
  const sceneSnow   = $("#sceneSnow");
  const sceneThanks = $("#sceneThanks");
  const sceneGift   = $("#sceneGift");

  const santaCow = $("#santaCow");
  const toGiftBtn = $("#toGift");

  const snowCanvas = $("#snowCanvas");
  const reveal = $("#reveal");
  const giftBox = $("#giftBox");
  const codeText = $("#codeText");
  const copyBtn = $("#copyBtn");
  const copyMsg = $("#copyMsg");

  // ✅ HIER später deinen echten Code einfügen (du ersetzt nur den Text im HTML oder hier)
  // Wenn du es lieber nur im HTML ersetzt: so lassen.
  // codeText.textContent = "STEAM-CODE-HIER-EINFÜGEN";

  function showScene(target) {
    [sceneIntro, sceneSnow, sceneThanks, sceneGift].forEach(s => s.classList.remove("scene--active"));
    target.classList.add("scene--active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Schritt 1: Antippen -> Crash ----------
  function triggerCrash() {
    // Stoppt nicht die Loop-Animation, aber wir “crashen” visuell weg
    santaCow.classList.add("crash");
    santaCow.setAttribute("aria-disabled", "true");

    // nach Crash zur Schnee-Szene
    setTimeout(() => {
      showScene(sceneSnow);
      initSnowWipe();
    }, 820);
  }

  // Click + Keyboard (Enter/Space) robust
  santaCow.addEventListener("click", triggerCrash);
  santaCow.addEventListener("touchstart", triggerCrash, { passive: true });
  santaCow.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") triggerCrash();
  });

  // ---------- Schritt 2: Schnee wegwischen (Canvas Scratch) ----------
  let ctx, isDown = false, clearedRatio = 0;

  function sizeCanvas() {
    const rect = snowCanvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    snowCanvas.width  = Math.floor(rect.width * dpr);
    snowCanvas.height = Math.floor(rect.height * dpr);
    ctx = snowCanvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Schnee “vollflächig”
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // leichte Struktur
    for (let i=0; i<1400; i++){
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = Math.random() * 2.3;
      ctx.fillStyle = `rgba(240,248,255,${0.25 + Math.random()*0.25})`;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-out";
  }

  function scratch(x, y) {
    const rect = snowCanvas.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;

    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  function estimateCleared() {
    // grob: wir lesen selten Pixel aus (Performance)
    const rect = snowCanvas.getBoundingClientRect();
    const sample = ctx.getImageData(0, 0, Math.min(220, rect.width), Math.min(160, rect.height)).data;
    let transparent = 0;
    for (let i = 3; i < sample.length; i += 4) {
      if (sample[i] < 10) transparent++;
    }
    clearedRatio = transparent / (sample.length / 4);
    return clearedRatio;
  }

  function onPointerDown(e) {
    isDown = true;
    const p = getPoint(e);
    scratch(p.x, p.y);
  }

  function onPointerMove(e) {
    if (!isDown) return;
    e.preventDefault();
    const p = getPoint(e);
    scratch(p.x, p.y);

    // Check ob genug frei
    if (Math.random() < 0.08) {
      const r = estimateCleared();
      if (r > 0.32) finishSnow();
    }
  }

  function onPointerUp() {
    isDown = false;
    const r = estimateCleared();
    if (r > 0.32) finishSnow();
  }

  function getPoint(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  let snowDone = false;
  function finishSnow() {
    if (snowDone) return;
    snowDone = true;

    // Canvas "wegfaden"
    snowCanvas.style.transition = "opacity .35s ease";
    snowCanvas.style.opacity = "0";

    setTimeout(() => {
      showScene(sceneThanks);
      // nach kurzem Tanz automatisch Button “glänzen”
      toGiftBtn.focus();
    }, 450);
  }

  function initSnowWipe() {
    snowDone = false;
    snowCanvas.style.opacity = "1";
    sizeCanvas();

    // Pointer Events
    snowCanvas.addEventListener("mousedown", onPointerDown);
    snowCanvas.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    snowCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
    snowCanvas.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    window.addEventListener("resize", () => {
      if (sceneSnow.classList.contains("scene--active")) sizeCanvas();
    }, { passive: true });
  }

  // ---------- Schritt 3: Weiter zum Geschenk ----------
  toGiftBtn.addEventListener("click", () => showScene(sceneGift));

  // ---------- Schritt 4: Geschenk öffnen (Shake oder Tap) ----------
  let opened = false;

  function openGift() {
    if (opened) return;
    opened = true;

    giftBox.style.animation = "none";
    giftBox.style.transform = "rotate(-2deg) translateY(6px) scale(1.03)";
    setTimeout(() => {
      reveal.classList.add("reveal--show");
    }, 200);
  }

  giftBox.addEventListener("click", openGift);
  giftBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openGift();
  });

  // Shake detection (Handy)
  let lastShake = 0;
  window.addEventListener("devicemotion", (event) => {
    if (!sceneGift.classList.contains("scene--active")) return;
    const a = event.accelerationIncludingGravity;
    if (!a) return;
    const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    const now = Date.now();
    if (mag > 26 && now - lastShake > 700) {
      lastShake = now;
      openGift();
    }
  });

  // Copy
  copyBtn.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(codeText.textContent.trim());
      copyMsg.textContent = "Kopiert ✅";
      setTimeout(() => copyMsg.textContent = "", 1400);
    }catch{
      copyMsg.textContent = "Kopieren ging nicht – markier den Code und kopier manuell.";
      setTimeout(() => copyMsg.textContent = "", 2600);
    }
  });

  // Start: Intro ist aktiv
  showScene(sceneIntro);
})();
