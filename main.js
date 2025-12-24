(() => {
  const sleighBtn = document.getElementById("sleighBtn");
  const bubbleText = document.getElementById("bubbleText");
  const scene = document.getElementById("scene");

  const crashArea = document.getElementById("crashArea");
  const wipeCanvas = document.getElementById("wipeCanvas");
  const toGiftBtn = document.getElementById("toGiftBtn");

  const giftArea = document.getElementById("giftArea");
  const shakeBtn = document.getElementById("shakeBtn");
  const modal = document.getElementById("modal");
  const copyBtn = document.getElementById("copyBtn");
  const closeBtn = document.getElementById("closeBtn");
  const codeText = document.getElementById("codeText");

  // ---------------------------
  // Stage state
  // ---------------------------
  let taps = 0;
  let stage = 1; // 1 fly, 2 wipe, 3 gift

  // ---------------------------
  // Flying animation (NO timer limit)
  // ---------------------------
  // We fly LEFT -> RIGHT and the cows/santa in the SVG are drawn facing RIGHT.
  let x = -560;
  let y = 120;
  let vx = 2.6;     // speed
  let wobbleT = 0;
  let rafId = null;

  function tick() {
    if (stage !== 1) return;

    wobbleT += 0.04;
    x += vx;

    // bounce in a smooth funny way
    const wobbleY = Math.sin(wobbleT) * 10;
    const wobbleRot = Math.sin(wobbleT * 1.6) * 1.2;

    const sceneW = scene.clientWidth;
    const offRight = sceneW + 560;

    // wrap around (keep it going forever)
    if (x > offRight) x = -620;

    sleighBtn.style.transform = `translate(${x}px, ${y + wobbleY}px) rotate(${wobbleRot}deg)`;

    rafId = requestAnimationFrame(tick);
  }

  function startFlying() {
    stage = 1;
    taps = 0;
    bubbleText.innerHTML = `Michelle! Hilfe! Tippe <b>3×</b> auf mich, damit ich landen kann!`;
    sleighBtn.classList.remove("hidden");
    crashArea.classList.add("hidden");
    giftArea.classList.add("hidden");
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  // ---------------------------
  // Tap logic
  // ---------------------------
  sleighBtn.addEventListener("click", () => {
    if (stage !== 1) return;
    taps += 1;

    if (taps < 3) {
      bubbleText.innerHTML = `Aua! Noch <b>${3 - taps}×</b> tippen… die Kühe driften! 🐮💨`;
      // tiny feedback
      sleighBtn.animate(
        [{ transform: sleighBtn.style.transform + " scale(1)" }, { transform: sleighBtn.style.transform + " scale(1.02)" }, { transform: sleighBtn.style.transform + " scale(1)" }],
        { duration: 220, easing: "ease-out" }
      );
      return;
    }

    // success → crash stage
    bubbleText.innerHTML = `Uff… wir landen… irgendwie… 😬`;
    stage = 2;
    cancelAnimationFrame(rafId);

    // quick "drop" animation then show wipe
    sleighBtn.animate(
      [
        { transform: sleighBtn.style.transform, offset: 0 },
        { transform: `translate(${x}px, ${y + 160}px) rotate(6deg)`, offset: 1 }
      ],
      { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" }
    ).onfinish = () => {
      sleighBtn.classList.add("hidden");
      crashArea.classList.remove("hidden");
      bubbleText.innerHTML = `Oh nein! Santa steckt im Schnee! <b>Wisch</b> ihn frei! ❄️`;
      initWipe();
    };
  });

  // ---------------------------
  // Snow wipe canvas
  // ---------------------------
  let ctx, isDown = false;
  let clearedUnlocked = false;

  function resizeCanvasToCSS() {
    // keep internal canvas size in sync with CSS width for good touch accuracy
    const rect = wipeCanvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    wipeCanvas.width = Math.floor(rect.width * scale);
    wipeCanvas.height = Math.floor(rect.height * scale);
    ctx = wipeCanvas.getContext("2d");
    ctx.scale(scale, scale);
  }

  function paintSnow() {
    const rect = wipeCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // snowy layer
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,.92)");
    grad.addColorStop(1, "rgba(210,230,255,.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // snow blobs
    ctx.fillStyle = "rgba(255,255,255,.65)";
    for (let i = 0; i < 90; i++) {
      const r = 10 + Math.random() * 26;
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // hint text on snow
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.font = "700 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Wisch mich weg! ❄️👉", w / 2, 60);
  }

  function eraseAt(clientX, clientY) {
    const rect = wipeCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  function estimateCleared() {
    // quick downsample-based estimate
    const rect = wipeCanvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    // read small sample grid instead of full pixels (fast on phones)
    const sampleW = 120;
    const sampleH = Math.floor(120 * (h / w));
    const tmp = document.createElement("canvas");
    tmp.width = sampleW;
    tmp.height = sampleH;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(wipeCanvas, 0, 0, sampleW, sampleH);

    const data = tctx.getImageData(0, 0, sampleW, sampleH).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 20) transparent++;
    }
    const ratio = transparent / (data.length / 4);
    return ratio;
  }

  function unlockAfterWipe() {
    if (clearedUnlocked) return;
    clearedUnlocked = true;

    // santa happy wobble (shake the under card a bit)
    const under = document.getElementById("underSanta");
    under.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: "translateY(-4px) rotate(-1deg)" },
        { transform: "translateY(2px) rotate(1deg)" },
        { transform: "translateY(0) rotate(0deg)" }
      ],
      { duration: 700, iterations: 2, easing: "ease-in-out" }
    );

    bubbleText.innerHTML = `Jaaaa! Danke, Michelle! 🎅✨ Kurz wackeln wir – dann gibt’s dein Geschenk!`;
    toGiftBtn.classList.remove("hidden");
  }

  function initWipe() {
    clearedUnlocked = false;
    toGiftBtn.classList.add("hidden");

    // set a consistent canvas size: make it match container width automatically
    // (canvas already has CSS responsive via width:100%)
    resizeCanvasToCSS();
    paintSnow();

    // pointer events (touch + mouse)
    const down = (e) => {
      if (stage !== 2) return;
      isDown = true;
      const p = getPoint(e);
      eraseAt(p.x, p.y);
      e.preventDefault();
    };
    const move = (e) => {
      if (stage !== 2 || !isDown) return;
      const p = getPoint(e);
      eraseAt(p.x, p.y);
      // check wipe progress sometimes
      if (Math.random() < 0.08) {
        const cleared = estimateCleared();
        if (cleared > 0.45) unlockAfterWipe();
      }
      e.preventDefault();
    };
    const up = () => { isDown = false; };

    wipeCanvas.onpointerdown = down;
    wipeCanvas.onpointermove = move;
    window.onpointerup = up;

    // handle resize
    window.addEventListener("resize", () => {
      if (stage !== 2) return;
      resizeCanvasToCSS();
      paintSnow();
    }, { passive: true });
  }

  function getPoint(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  // proceed to gift
  toGiftBtn.addEventListener("click", () => {
    stage = 3;
    crashArea.classList.add("hidden");
    giftArea.classList.remove("hidden");
    bubbleText.innerHTML = `Okay… jetzt aber: Geschenkzeit! 🎁`;
  });

  // ---------------------------
  // Gift reveal (shake or click)
  // ---------------------------
  function openModal() {
    modal.classList.remove("hidden");
  }

  function shakeAnimation() {
    const present = document.getElementById("present");
    present.animate(
      [
        { transform: "translateX(0) rotate(0deg)" },
        { transform: "translateX(-6px) rotate(-2deg)" },
        { transform: "translateX(6px) rotate(2deg)" },
        { transform: "translateX(-5px) rotate(-2deg)" },
        { transform: "translateX(5px) rotate(2deg)" },
        { transform: "translateX(0) rotate(0deg)" }
      ],
      { duration: 520, easing: "ease-in-out" }
    );
  }

  shakeBtn.addEventListener("click", () => {
    if (stage !== 3) return;
    shakeAnimation();
    setTimeout(openModal, 420);
  });

  // Optional device motion (won't break if blocked)
  let lastShake = 0;
  window.addEventListener("devicemotion", (e) => {
    if (stage !== 3) return;
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const strength = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    const now = Date.now();
    if (strength > 28 && now - lastShake > 900) {
      lastShake = now;
      shakeAnimation();
      setTimeout(openModal, 420);
    }
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeText.textContent.trim());
      copyBtn.textContent = "Kopiert!";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 900);
    } catch {
      // fallback: select text
      const r = document.createRange();
      r.selectNodeContents(codeText);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      copyBtn.textContent = "Markiert!";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 900);
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // start
  startFlying();
})();
