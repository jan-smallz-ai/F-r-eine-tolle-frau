(() => {
  const gift = document.getElementById("gift");
  const shakeBtn = document.getElementById("shakeBtn");
  const meterBar = document.getElementById("meterBar");

  const modal = document.getElementById("modal");
  const copyBtn = document.getElementById("copyBtn");
  const closeBtn = document.getElementById("closeBtn");
  const codeText = document.getElementById("codeText");

  const snow = document.getElementById("snow");

  let progress = 0;
  let opened = false;

  // --- Snow generator (lightweight) ---
  const flakes = 36;
  for (let i = 0; i < flakes; i++) {
    const s = document.createElement("span");
    s.className = "snowflake";
    s.textContent = Math.random() > 0.25 ? "❄️" : "✨";
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = (6 + Math.random() * 8).toFixed(2) + "s";
    s.style.animationDelay = (Math.random() * 6).toFixed(2) + "s";
    s.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);
    s.style.transform = `translateX(${(Math.random() * 40 - 20).toFixed(0)}px)`;
    snow.appendChild(s);
  }

  function bumpProgress(amount) {
    if (opened) return;
    progress = Math.min(100, progress + amount);
    meterBar.style.width = progress + "%";

    gift.classList.remove("shake");
    // force reflow so animation always retriggers
    void gift.offsetWidth;
    gift.classList.add("shake");

    if (progress >= 100) {
      openReveal();
    }
  }

  function openReveal() {
    opened = true;
    modal.hidden = false;

    // little confetti-ish text burst
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("div");
      p.textContent = Math.random() > 0.5 ? "✨" : "🎉";
      p.style.position = "fixed";
      p.style.left = (10 + Math.random() * 80) + "vw";
      p.style.top = (20 + Math.random() * 40) + "vh";
      p.style.fontSize = (16 + Math.random() * 26) + "px";
      p.style.zIndex = 60;
      p.style.pointerEvents = "none";
      p.style.opacity = "0.95";
      p.style.transition = "transform 900ms ease, opacity 900ms ease";
      document.body.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translateY(${80 + Math.random() * 160}px) rotate(${(Math.random() * 140 - 70)}deg)`;
        p.style.opacity = "0";
      });

      setTimeout(() => p.remove(), 950);
    }
  }

  function closeReveal() {
    modal.hidden = true;
  }

  // Click/tap interactions
  shakeBtn.addEventListener("click", () => bumpProgress(18));
  gift.addEventListener("click", () => bumpProgress(14));

  closeBtn.addEventListener("click", closeReveal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeReveal();
  });

  // Copy button
  copyBtn.addEventListener("click", async () => {
    const text = codeText.textContent.trim();

    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    } catch {
      // Fallback: select text
      const range = document.createRange();
      range.selectNodeContents(codeText);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyBtn.textContent = "Markiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    }
  });

  // --- Optional: real "shake" on mobile (DeviceMotion) ---
  let last = 0;
  function onMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (!a) return;

    const now = Date.now();
    if (now - last < 220) return;

    const x = Math.abs(a.x || 0);
    const y = Math.abs(a.y || 0);
    const z = Math.abs(a.z || 0);
    const strength = x + y + z;

    // threshold tuned for most phones
    if (strength > 26) {
      last = now;
      bumpProgress(10);
    }
  }

  function enableMotion() {
    // iOS asks permission only after user gesture
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("devicemotion", onMotion, { passive: true });
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener("devicemotion", onMotion, { passive: true });
    }
  }

  // enable motion after first user interaction (button or gift)
  const oneTime = () => {
    enableMotion();
    document.removeEventListener("click", oneTime);
    document.removeEventListener("touchstart", oneTime);
  };
  document.addEventListener("click", oneTime, { once: true });
  document.addEventListener("touchstart", oneTime, { once: true });

})();
