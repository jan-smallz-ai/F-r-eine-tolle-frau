(() => {
  const flyer = document.getElementById("flyer");
  const rig = document.getElementById("rig");
  const crash = document.getElementById("crash");
  const gift = document.getElementById("gift");
  const bubbleTop = document.getElementById("bubbleTop");
  const bubbleMid = document.getElementById("bubbleMid");

  const copyBtn = document.getElementById("copyBtn");
  const codeText = document.getElementById("codeText");

  const wipeCanvas = document.getElementById("wipe");
  const ctx = wipeCanvas.getContext("2d");

  // --- Flight config (no time limit!) ---
  let taps = 0;
  let running = true;

  // Start off-screen left -> fly to right (correct direction)
  let x = -280;
  let y = 130;
  let vx = 2.35;  // speed
  let vy = 0.55;  // slight drift
  let t = 0;

  function setFlyerPos() {
    flyer.style.left = `${x}px`;
    flyer.style.top = `${y}px`;
  }

  function loop() {
    if (!running) return;

    t += 0.016;

    // movement
    x += vx;
    y += Math.sin(t * 2.1) * 0.8 + vy;

    // keep within a nice band
    const stage = document.getElementById("stage");
    const maxY = stage.clientHeight - 280;
    if (y < 90) y = 90;
    if (y > maxY) y = maxY;

    // Wrap around forever (no timer)
    const wrapAt = stage.clientWidth + 260;
    if (x > wrapAt) {
      x = -320;
      y = 120 + (Math.random() * 220);
    }

    setFlyerPos();

    // Face to the right (not backwards)
    rig.style.transform = ""; // base wobble is in CSS
    flyer.style.transform = ""; // ensure no accidental flips

    requestAnimationFrame(loop);
  }

  // --- Tap 3 times to trigger crash ---
  flyer.addEventListener("click", () => {
    if (!running) return;
    taps += 1;

    bubbleTop.innerHTML =
      `Michelle, Hilfe! Die Kühe sind außer Kontrolle!<br><b>Tipp: 3× antippen</b> ✋ (${taps}/3)`;

    // small feedback wobble burst
    rig.animate(
      [
        { transform: "rotate(-2deg) translateY(0px)" },
        { transform: "rotate(3deg) translateY(4px)" },
        { transform: "rotate(-2deg) translateY(0px)" }
      ],
      { duration: 260, easing: "ease-out" }
    );

    if (taps >= 3) {
      doCrash();
    }
  }, { passive: true });

  function doCrash() {
    running = false;

    // animate the flyer falling down into snow
    flyer.style.pointerEvents = "none";
    flyer.animate(
      [
        { transform: "translate(0,0) rotate(0deg)" },
        { transform: "translate(80px, 220px) rotate(18deg)" }
      ],
      { duration: 520, easing: "cubic-bezier(.2,.9,.2,1)" }
    ).onfinish = () => {
      flyer.hidden = true;
      showCrash();
    };
  }

  // --- Snow wipe (canvas erase) ---
  let wiping = false;
  let clearedRatio = 0;

  function resizeCanvasToDisplaySize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    }
  }

  function paintSnow() {
    resizeCanvasToDisplaySize(wipeCanvas);
    const rect = wipeCanvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, rect.width, rect.height);

    // thick snow layer
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // fluffy dots
    for (let i = 0; i < 1600; i++) {
      const px = Math.random() * rect.width;
      const py = Math.random() * rect.height;
      const r = 0.5 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.35})`;
      ctx.fill();
    }

    // now we will erase
    ctx.globalCompositeOperation = "destination-out";
  }

  function eraseAt(clientX, clientY) {
    const rect = wipeCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // estimate cleared ratio by sampling a grid (cheap + good enough)
    clearedRatio = estimateCleared(rect.width, rect.height);
    if (clearedRatio > 0.55) {
      finishWipe();
    }
  }

  function estimateCleared(w, h) {
    // sample a small grid and count transparent pixels
    const cols = 18, rows = 10;
    const img = ctx.getImageData(0, 0, w, h).data;
    let transparent = 0;
    let total = cols * rows;

    for (let ry = 0; ry < rows; ry++) {
      for (let cx = 0; cx < cols; cx++) {
        const sx = Math.floor((cx + 0.5) * (w / cols));
        const sy = Math.floor((ry + 0.5) * (h / rows));
        const idx = (sy * w + sx) * 4 + 3; // alpha
        if (img[idx] === 0) transparent++;
      }
    }
    return transparent / total;
  }

  function showCrash() {
    crash.hidden = false;
    paintSnow();

    // speak bubble already there
    bubbleMid.innerHTML = `Aua! Ich bin im Schnee gelandet…<br><b>Wisch den Schnee weg</b> ❄️➡️`;

    // enable wipe
    wipeCanvas.addEventListener("pointerdown", onDown);
    wipeCanvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    wipeCanvas.style.pointerEvents = "auto";
  }

  function onDown(e) {
    wiping = true;
    wipeCanvas.setPointerCapture?.(e.pointerId);
    eraseAt(e.clientX, e.clientY);
  }
  function onMove(e) {
    if (!wiping) return;
    eraseAt(e.clientX, e.clientY);
  }
  function onUp() {
    wiping = false;
  }

  function finishWipe() {
    // stop listeners
    wipeCanvas.removeEventListener("pointerdown", onDown);
    wipeCanvas.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);

    // quick “thank you” bubble before gift
    bubbleMid.innerHTML = `Danke, Michelle! 😄<br><b>Du hast mich gerettet!</b>`;

    setTimeout(() => {
      crash.hidden = true;
      showGift();
    }, 700);
  }

  function showGift() {
    gift.hidden = false;

    // little extra wobble on the whole card
    const stageCard = document.querySelector(".stageCard");
    stageCard.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-0.6deg)" },
        { transform: "rotate(0.6deg)" },
        { transform: "rotate(0deg)" }
      ],
      { duration: 520, easing: "ease-in-out" }
    );
  }

  // --- Copy button ---
  copyBtn?.addEventListener("click", async () => {
    const txt = (codeText?.textContent || "").trim();
    try {
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = "Kopiert ✓";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copyBtn.textContent = "Kopiert ✓";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    }
  });

  // init
  setFlyerPos();
  requestAnimationFrame(loop);
})();
