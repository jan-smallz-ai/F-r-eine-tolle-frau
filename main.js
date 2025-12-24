(() => {
  // ====== HIER EINTRAGEN: echter Steam-Code ======
  // Wichtig: exakt wie Steam-Keys aussehen (z.B. ABCDE-FGHIJ-KLMNO)
  const STEAM_CODE = "HIER-DEIN-STEAM-CODE";

  // ====== Helpers ======
  const $ = (sel) => document.querySelector(sel);

  const sceneSled = $("#scene-sled");
  const sceneSnow = $("#scene-snow");
  const sceneGift = $("#scene-gift");

  const sled = $("#sled");
  const tapCounter = $("#tapCounter");

  const wipeCanvas = $("#wipeCanvas");
  const wipeProgress = $("#wipeProgress");
  const btnSkipWipe = $("#btnSkipWipe");

  const gift = $("#gift");
  const reveal = $("#reveal");
  const codeText = $("#codeText");
  const btnCopy = $("#btnCopy");
  const motionHint = $("#motionHint");

  // Sound (kleiner “Plopp” ohne Datei, per WebAudio)
  let audioCtx = null;
  function beep(type = "plop") {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);

      const t0 = audioCtx.currentTime;
      const dur = type === "plop" ? 0.10 : 0.16;
      const f1 = type === "plop" ? 520 : 220;
      const f2 = type === "plop" ? 260 : 110;

      o.type = "triangle";
      o.frequency.setValueAtTime(f1, t0);
      o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);

      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      o.start(t0);
      o.stop(t0 + dur);
    } catch (e) {
      // wenn Audio blockiert ist: egal
    }
  }

  function showScene(which) {
    [sceneSled, sceneSnow, sceneGift].forEach(s => s.classList.remove("active"));
    which.classList.add("active");
  }

  // ====== Szene 1: 3x tippen ======
  let taps = 0;
  function updateTaps() {
    tapCounter.textContent = `Taps: ${taps} / 3`;
  }
  function onSledTap() {
    taps++;
    beep("tap");
    updateTaps();

    if (taps >= 3) {
      // Stoppen -> kurzer Effekt
      sled.style.animation = "none";
      sled.style.transform = "translateX(0) rotate(0deg)";
      setTimeout(() => {
        showScene(sceneSnow);
        setupWipeCanvas(); // wichtig: Canvas erst jetzt korrekt dimensionieren
      }, 350);
    }
  }

  sled.addEventListener("click", onSledTap);
  sled.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") onSledTap();
  });

  updateTaps();

  // ====== Szene 2: Schnee wegwischen ======
  let ctx, w, h;
  let isDown = false;
  let removedApprox = 0;
  let done = false;

  function resizeCanvasToCSS(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    w = rect.width;
    h = rect.height;
  }

  function paintSnow() {
    // dicke “Schneeschicht”
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    // leicht strukturierter Schnee
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(1, "rgba(235,245,255,0.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // “Schneeflecken”
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 6 + Math.random() * 26;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset
    removedApprox = 0;
    wipeProgress.textContent = "Schnee entfernt: 0%";
    done = false;
  }

  function scratch(x, y) {
    if (done) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    // “ungefähr” Fortschritt (schnell & stabil auf Handy)
    removedApprox += 1;
    const pct = Math.min(100, Math.floor((removedApprox / 260) * 100));
    wipeProgress.textContent = `Schnee entfernt: ${pct}%`;

    if (pct >= 85) finishWipe();
  }

  function finishWipe() {
    if (done) return;
    done = true;
    beep("plop");
    wipeProgress.textContent = "Schnee entfernt: 100% ✅";

    setTimeout(() => {
      showScene(sceneGift);
      setupGiftScene();
    }, 650);
  }

  function getPos(e) {
    const rect = wipeCanvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function setupWipeCanvas() {
    // Dimensionieren NACH dem Anzeigen, sonst "zu klein"
    resizeCanvasToCSS(wipeCanvas);
    paintSnow();

    const onDown = (e) => {
      isDown = true;
      const p = getPos(e);
      scratch(p.x, p.y);
    };
    const onMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const p = getPos(e);
      scratch(p.x, p.y);
    };
    const onUp = () => { isDown = false; };

    // Clean event listeners (falls mehrfach aufgerufen)
    wipeCanvas.onpointerdown = null;
    wipeCanvas.onpointermove = null;
    wipeCanvas.onpointerup = null;
    wipeCanvas.onpointercancel = null;

    // Pointer events (best auf Mobile)
    wipeCanvas.addEventListener("pointerdown", onDown, { passive: true });
    wipeCanvas.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    // Bei Resize neu anpassen
    window.addEventListener("resize", () => {
      if (!sceneSnow.classList.contains("active")) return;
      resizeCanvasToCSS(wipeCanvas);
      paintSnow();
    }, { passive: true });

    btnSkipWipe.onclick = () => finishWipe();
  }

  // ====== Szene 3: Geschenk schütteln / tippen ======
  let revealed = false;
  let shakeScore = 0;
  let lastShakeTime = 0;
  let motionActive = false;

  function setupGiftScene() {
    // Code einsetzen
    codeText.textContent = (STEAM_CODE && STEAM_CODE.trim() !== "HIER-DEIN-STEAM-CODE")
      ? STEAM_CODE.trim()
      : "XXXX-XXXX-XXXX";

    reveal.classList.remove("show");
    btnCopy.disabled = true;
    revealed = false;
    shakeScore = 0;
    motionActive = false;

    // Hinweis für Motion
    motionHint.textContent = "";

    // Tap-Fallback
    gift.onclick = () => {
      // Tap zählt als "mini-shake"
      shakeScore += 2;
      wiggleGift();
      if (shakeScore >= 10) doReveal();
    };
    gift.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") gift.click();
    };

    // Motion permission (iOS)
    enableMotionIfPossible();
  }

  function wiggleGift() {
    gift.animate(
      [
        { transform: "translateX(-50%) rotate(0deg) scale(1)" },
        { transform: "translateX(-50%) rotate(-6deg) scale(1.02)" },
        { transform: "translateX(-50%) rotate(6deg) scale(1.02)" },
        { transform: "translateX(-50%) rotate(0deg) scale(1)" }
      ],
      { duration: 260, iterations: 1, easing: "ease-out" }
    );
    beep("tap");
  }

  function doReveal() {
    if (revealed) return;
    revealed = true;
    reveal.classList.add("show");
    btnCopy.disabled = false;
    beep("plop");

    // “Plopp”-Partikelchen (klein, aber süß)
    burst();
  }

  function burst() {
    const container = sceneGift;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      p.className = "pop";
      const x = 42 + Math.random() * 18; // in % um gift herum
      const y = 70 + Math.random() * 10;
      p.style.left = x + "%";
      p.style.top = y + "%";
      p.style.transform = `translate(-50%, -50%) scale(${0.7 + Math.random()*0.8})`;
      container.appendChild(p);
      p.animate(
        [
          { opacity: 0, transform: p.style.transform + " translateY(0px)" },
          { opacity: 1 },
          { opacity: 0, transform: p.style.transform + ` translateY(${-60 - Math.random()*60}px)` }
        ],
        { duration: 700 + Math.random()*400, easing: "ease-out" }
      ).onfinish = () => p.remove();
    }
  }

  // kleine CSS-Ergänzung für Burst ohne extra Datei:
  const style = document.createElement("style");
  style.textContent = `
    .pop{
      position:absolute;
      width:10px;height:10px;border-radius:999px;
      background: rgba(255,211,106,.95);
      box-shadow: 0 0 18px rgba(255,211,106,.35);
      pointer-events:none;
    }
  `;
  document.head.appendChild(style);

  // Copy
  btnCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeText.textContent);
      btnCopy.textContent = "✅ Kopiert!";
      setTimeout(() => btnCopy.textContent = "Code kopieren", 1200);
    } catch (e) {
      btnCopy.textContent = "Kopieren nicht möglich";
      setTimeout(() => btnCopy.textContent = "Code kopieren", 1200);
    }
  });

  async function enableMotionIfPossible() {
    // Motion funktioniert nur auf Geräten mit Sensoren
    // iOS braucht Permission nach User-Geste.
    const needsPermission = typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";

    if (needsPermission) {
      motionHint.innerHTML = "📱 Tipp einmal irgendwo ins Fenster, um <b>Schütteln</b> zu aktivieren.";
      const once = async () => {
        window.removeEventListener("click", once);
        try {
          const res = await DeviceMotionEvent.requestPermission();
          if (res === "granted") {
            motionHint.textContent = "Schütteln ist aktiv ✅";
            startMotion();
          } else {
            motionHint.textContent = "Schütteln blockiert – du kannst das Geschenk einfach antippen.";
          }
        } catch {
          motionHint.textContent = "Schütteln nicht verfügbar – du kannst antippen.";
        }
      };
      window.addEventListener("click", once, { once: true });
      return;
    }

    // Android/Chrome oft ohne Permission
    if (typeof DeviceMotionEvent !== "undefined") {
      motionHint.textContent = "Schütteln ist aktiv ✅ (falls dein Handy es unterstützt)";
      startMotion();
    } else {
      motionHint.textContent = "Dein Gerät unterstützt kein Schütteln – antippen reicht.";
    }
  }

  function startMotion() {
    if (motionActive) return;
    motionActive = true;

    window.addEventListener("devicemotion", (e) => {
      if (!sceneGift.classList.contains("active")) return;
      if (revealed) return;

      const a = e.accelerationIncludingGravity;
      if (!a) return;

      // “shake intensity”
      const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);

      const now = Date.now();
      // nur echte Peaks zählen, nicht permanentes Rauschen
      if (mag > 28 && now - lastShakeTime > 180) {
        lastShakeTime = now;
        shakeScore += 3;
        wiggleGift();
        if (shakeScore >= 10) doReveal();
      }
    }, { passive: true });
  }

  // Startzustand
  showScene(sceneSled);
})();
