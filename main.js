(() => {
  const $ = (id) => document.getElementById(id);

  const rig = $("rig");
  const bubbleTitle = $("bubbleTitle");
  const bubbleText  = $("bubbleText");
  const hint = $("hint");

  const wipe = $("wipe");
  const wipeCanvas = $("wipeCanvas");
  const wipeSkip = $("wipeSkip");

  const rescue = $("rescue");
  const toGift = $("toGift");

  const gift = $("gift");
  const giftbox = $("giftbox");
  const openGift = $("openGift");

  const modal = $("modal");
  const copyBtn = $("copyBtn");
  const closeBtn = $("closeBtn");
  const codeText = $("codeText");

  // --- STATE ---
  let taps = 0;
  let stage = 1; // 1=tap santa, 2=wipe snow, 3=gift, 4=modal
  let wipeCtx, isDrawing = false;
  let lastPoint = null;
  let dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

  // Prevent "click not working" on mobile overlays:
  // Ensure our main interactive elements are always clickable.
  rig.style.pointerEvents = "auto";

  function setBubble(title, text) {
    bubbleTitle.textContent = title;
    bubbleText.innerHTML = text;
  }

  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }

  // --------------------
  // STEP 1: Tap Santa 3x
  // --------------------
  function onRigTap() {
    if (stage !== 1) return;

    taps++;
    rig.classList.add("hit");
    setTimeout(() => rig.classList.remove("hit"), 120);

    if (taps < 3) {
      setBubble("Santa:", `Michelle, bitte! Noch <b>${3 - taps}×</b> tippen – die Kühe sind außer Kontrolle! 🐮💨`);
      hint.innerHTML = `Treffer: <b>${taps}/3</b> — tippe weiter! 👆`;
      return;
    }

    // success -> crash into snow
    stage = 2;
    hint.innerHTML = `Aua… Landung war… kreativ. 😵‍💫`;
    setBubble("Santa:", `Uff! Ich bin im Schnee gelandet… <b>wisch</b> mich frei! ❄️`);

    // Stop flying animation and hide rig nicely
    rig.style.animationPlayState = "paused";
    rig.style.transform = "translateX(640px) rotate(6deg)";
    setTimeout(() => { rig.style.opacity = "0.15"; }, 120);

    startWipe();
  }

  rig.addEventListener("click", onRigTap, { passive: true });
  rig.addEventListener("touchstart", (e) => { e.preventDefault(); onRigTap(); }, { passive: false });

  // --------------------
  // STEP 2: Snow Wipe (canvas erase)
  // --------------------
  function resizeCanvas() {
    dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const rect = wipeCanvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    wipeCanvas.width = w;
    wipeCanvas.height = h;

    wipeCtx = wipeCanvas.getContext("2d", { willReadFrequently: true });

    // Draw snow layer
    wipeCtx.save();
    wipeCtx.clearRect(0, 0, w, h);

    // Background (slightly visible Santa area under snow)
    wipeCtx.fillStyle = "rgba(255,255,255,0.06)";
    wipeCtx.fillRect(0, 0, w, h);

    // Underlay hint: a faint silhouette (so user "sees" something)
    wipeCtx.fillStyle = "rgba(255,211,106,0.10)";
    wipeCtx.beginPath();
    wipeCtx.ellipse(w*0.55, h*0.55, w*0.20, h*0.18, 0, 0, Math.PI*2);
    wipeCtx.fill();

    // Snow on top
    wipeCtx.globalCompositeOperation = "source-over";
    wipeCtx.fillStyle = "rgba(245,248,255,0.95)";
    wipeCtx.fillRect(0, 0, w, h);

    // Add snow speckles
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = (Math.random() * 6 + 2) * dpr;
      wipeCtx.fillStyle = `rgba(255,255,255,${0.35 + Math.random()*0.5})`;
      wipeCtx.beginPath();
      wipeCtx.arc(x, y, r, 0, Math.PI * 2);
      wipeCtx.fill();
    }

    wipeCtx.restore();

    // Switch to erase mode
    wipeCtx.globalCompositeOperation = "destination-out";
    wipeCtx.lineCap = "round";
    wipeCtx.lineJoin = "round";
    wipeCtx.lineWidth = 42 * dpr;
  }

  function startWipe() {
    show(wipe);
    requestAnimationFrame(() => {
      resizeCanvas();
    });
  }

  function getPoint(evt) {
    const rect = wipeCanvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    return { x, y };
  }

  function drawTo(p) {
    if (!wipeCtx) return;
    if (!lastPoint) lastPoint = p;
    wipeCtx.beginPath();
    wipeCtx.moveTo(lastPoint.x, lastPoint.y);
    wipeCtx.lineTo(p.x, p.y);
    wipeCtx.stroke();
    lastPoint = p;
  }

  function beginDraw(evt) {
    if (stage !== 2) return;
    isDrawing = true;
    lastPoint = getPoint(evt);
    drawTo(lastPoint);
    evt.preventDefault();
  }

  function moveDraw(evt) {
    if (!isDrawing || stage !== 2) return;
    const p = getPoint(evt);
    drawTo(p);
    evt.preventDefault();
  }

  function endDraw(evt) {
    if (stage !== 2) return;
    isDrawing = false;
    lastPoint = null;
    evt && evt.preventDefault();
    checkCleared();
  }

  wipeCanvas.addEventListener("mousedown", beginDraw);
  wipeCanvas.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);

  wipeCanvas.addEventListener("touchstart", beginDraw, { passive: false });
  wipeCanvas.addEventListener("touchmove", moveDraw, { passive: false });
  wipeCanvas.addEventListener("touchend", endDraw, { passive: false });

  wipeSkip.addEventListener("click", () => {
    resizeCanvas(); // redraw snow if something glitched
  });

  window.addEventListener("resize", () => {
    if (!wipe.hidden) resizeCanvas();
  });

  function checkCleared() {
    // Estimate cleared percentage by sampling pixels
    if (!wipeCtx) return;

    const w = wipeCanvas.width;
    const h = wipeCanvas.height;
    const img = wipeCtx.getImageData(0, 0, w, h).data;

    // We are in destination-out mode; erased pixels => alpha becomes 0 in the snow layer area.
    // We'll sample a grid for speed.
    const step = Math.max(8, Math.floor(12 * dpr));
    let total = 0, cleared = 0;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const idx = (y * w + x) * 4 + 3; // alpha channel
        total++;
        if (img[idx] < 40) cleared++;
      }
    }

    const pct = cleared / total;
    if (pct >= 0.42) {
      // Success
      stage = 3;
      hide(wipe);
      show(rescue);

      // little celebration wobble
      document.querySelector(".stage").classList.add("celebrate");
      setTimeout(() => document.querySelector(".stage").classList.remove("celebrate"), 900);
    }
  }

  // --------------------
  // STEP 3: Gift
  // --------------------
  toGift.addEventListener("click", () => {
    hide(rescue);
    show(gift);
  });

  function openNow() {
    // small shake animation, then show modal
    giftbox.classList.add("shake");
    setTimeout(() => giftbox.classList.remove("shake"), 650);
    setTimeout(() => {
      stage = 4;
      show(modal);
    }, 450);
  }

  openGift.addEventListener("click", openNow);
  giftbox.addEventListener("click", openNow);
  giftbox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openNow();
  });

  // Device motion (optional)
  let lastShake = 0;
  window.addEventListener("devicemotion", (e) => {
    if (stage !== 3) return;
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const m = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    if (m > 28 && Date.now() - lastShake > 900) {
      lastShake = Date.now();
      openNow();
    }
  });

  // --------------------
  // MODAL: Copy code
  // --------------------
  copyBtn.addEventListener("click", async () => {
    const text = codeText.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    }
  });

  closeBtn.addEventListener("click", () => {
    hide(modal);
  });

  // Ensure start state
  hide(wipe);
  hide(rescue);
  hide(gift);
  hide(modal);
})();
