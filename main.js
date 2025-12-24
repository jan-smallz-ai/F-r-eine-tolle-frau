(() => {
  const $ = (s) => document.querySelector(s);

  const flightScene = $("#flightScene");
  const snowScene   = $("#snowScene");
  const giftScene   = $("#giftScene");

  const santaBtn = $("#santa");
  const tapFill  = $("#tapFill");
  const tapText  = $("#tapText");
  const skipBtn  = $("#skipBtn");

  const scratch  = $("#scratch");

  const modal    = $("#modal");
  const openGift = $("#openGiftBtn");
  const closeBtn = $("#closeBtn");
  const copyBtn  = $("#copyBtn");
  const codeText = $("#codeText");

  const snowLayer = $("#snowLayer");

  // ---- Schneeflocken im Hintergrund ----
  function spawnSnow() {
    const flake = document.createElement("div");
    flake.className = "snow";
    const size = 4 + Math.random() * 8;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}vw`;
    flake.style.opacity = `${0.35 + Math.random() * 0.6}`;
    flake.style.animationDuration = `${4 + Math.random() * 5}s`;
    flake.style.animationDelay = `${Math.random() * 1.5}s`;
    snowLayer.appendChild(flake);
    setTimeout(() => flake.remove(), 11000);
  }
  setInterval(spawnSnow, 140);

  // ---- Step 1: Tap Santa (3x) bevor er abhaut ----
  let taps = 0;
  const needTaps = 3;
  let wonTapGame = false;

  function updateTapUI() {
    tapFill.style.width = `${(taps / needTaps) * 100}%`;
    tapText.textContent = `${taps} / ${needTaps}`;
  }
  updateTapUI();

  function winTapGame() {
    wonTapGame = true;
    // Crash in Schnee
    toSnowScene();
  }

  function onTapSanta() {
    if (wonTapGame) return;
    taps = Math.min(needTaps, taps + 1);
    updateTapUI();

    // kleines Feedback
    santaBtn.style.filter = "drop-shadow(0 0 14px rgba(255,211,106,.55))";
    setTimeout(() => (santaBtn.style.filter = ""), 180);

    if (taps >= needTaps) winTapGame();
  }

  santaBtn.addEventListener("click", onTapSanta);
  santaBtn.addEventListener("touchstart", (e) => { e.preventDefault(); onTapSanta(); }, { passive:false });
  santaBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") onTapSanta();
  });

  skipBtn.addEventListener("click", toSnowScene);

  // Wenn Spieler Santa nicht schafft: nach 7s automatisch Crash (damit’s weitergeht)
  setTimeout(() => { if (!wonTapGame) toSnowScene(); }, 7200);

  // ---- Step 2: Schnee wegwischen (Scratch) ----
  let ctx, w, h;
  let scratchDone = false;

  function setupScratch() {
    w = scratch.clientWidth;
    h = scratch.clientHeight;
    scratch.width = Math.floor(w * devicePixelRatio);
    scratch.height = Math.floor(h * devicePixelRatio);

    ctx = scratch.getContext("2d");
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // “Schnee” Fläche
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(0, 0, w, h);

    // etwas “Flocken” Struktur
    for (let i = 0; i < 140; i++) {
      ctx.beginPath();
      const r = 1 + Math.random() * 3;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + Math.random() * 0.35})`;
      ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-out";
  }

  function scratchAt(x, y) {
    if (scratchDone) return;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    checkScratchProgress();
  }

  function getXY(ev) {
    const r = scratch.getBoundingClientRect();
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    return { x: clientX - r.left, y: clientY - r.top };
  }

  let isDown = false;
  scratch.addEventListener("mousedown", (e) => { isDown = true; const p=getXY(e); scratchAt(p.x,p.y); });
  window.addEventListener("mouseup", () => { isDown = false; });
  scratch.addEventListener("mousemove", (e) => { if (!isDown) return; const p=getXY(e); scratchAt(p.x,p.y); });

  scratch.addEventListener("touchstart", (e) => { e.preventDefault(); isDown = true; const p=getXY(e); scratchAt(p.x,p.y); }, { passive:false });
  scratch.addEventListener("touchmove", (e) => { e.preventDefault(); if(!isDown) return; const p=getXY(e); scratchAt(p.x,p.y); }, { passive:false });
  scratch.addEventListener("touchend", () => { isDown = false; });

  function checkScratchProgress() {
    // grob: wir prüfen wenige Samples, nicht jedes Pixel (schnell auf Handy)
    const samples = 120;
    let cleared = 0;

    // Wir lesen Mini-Punkte (getImageData) in sample-Koordinaten
    for (let i = 0; i < samples; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      // alpha = d[3]; bei destination-out: je “weggeschrubbt”, desto niedriger
      if (d[3] < 40) cleared++;
    }

    const ratio = cleared / samples;
    if (ratio > 0.55) {
      scratchDone = true;
      // Canvas weg, Santa bedankt sich + Tanz, dann Geschenk
      scratch.style.transition = "opacity .45s ease";
      scratch.style.opacity = "0";
      setTimeout(() => {
        scratch.style.display = "none";
        toGiftScene();
      }, 520);
    }
  }

  // ---- Scene transitions ----
  function toSnowScene() {
    flightScene.classList.add("hidden");
    snowScene.classList.remove("hidden");
    giftScene.classList.add("hidden");

    // Reset scratch state
    scratchDone = false;
    scratch.style.display = "block";
    scratch.style.opacity = "1";

    // klein warten bis layout steht
    setTimeout(() => {
      setupScratch();
    }, 60);
  }

  function toGiftScene() {
    snowScene.classList.add("hidden");
    giftScene.classList.remove("hidden");

    // kurzer “Danke”-Moment (Santa tanzt sowieso per CSS)
    // Danach darf man Geschenk öffnen
  }

  // ---- Modal (Code) ----
  function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  openGift.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  copyBtn.addEventListener("click", async () => {
    const text = codeText.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    } catch {
      // Fallback: markieren
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(codeText);
      sel.removeAllRanges();
      sel.addRange(range);
      copyBtn.textContent = "Markiert 👆";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    }
  });

  // Safety: Modal niemals automatisch öffnen
  closeModal();

  // Wenn Bildschirm dreht: Scratch neu aufsetzen
  window.addEventListener("resize", () => {
    if (!snowScene.classList.contains("hidden") && scratch.style.display !== "none") {
      setupScratch();
    }
  });
})();
