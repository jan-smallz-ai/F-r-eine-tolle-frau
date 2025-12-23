(() => {
  "use strict";

  // ====== CONFIG ======
  const REQUIRED_SHAKES = 14;

  // ====== HELPERS ======
  const $ = (sel) => document.querySelector(sel);

  const safeClipboardCopy = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    // Fallback: selection copy
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      document.body.removeChild(ta);
      return false;
    }
  };

  // ====== STATE ======
  let shakes = 0;
  let unlocked = false;

  // ====== ELEMENTS ======
  const shakeBtn = $("#shakeBtn");
  const progressBar = $("#progressBar");
  const progressText = $("#progressText");
  const scene = $("#scene");
  const reveal = $("#reveal");
  const codeBox = $("#codeBox");
  const copyBtn = $("#copyBtn");
  const toast = $("#toast");

  // Safety: if something is missing, don't crash
  if (!shakeBtn || !progressBar || !progressText || !scene || !reveal || !codeBox || !copyBtn || !toast) {
    console.warn("Missing required elements in HTML.");
    return;
  }

  // Ensure the button is always clickable (prevents overlay bugs)
  shakeBtn.style.pointerEvents = "auto";

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  };

  const setProgress = () => {
    const pct = Math.min(100, Math.round((shakes / REQUIRED_SHAKES) * 100));
    progressBar.style.width = pct + "%";
    progressText.textContent = `Schüttel-Fortschritt: ${pct}%`;
  };

  const doShake = (amount = 1) => {
    if (unlocked) return;
    shakes += amount;

    // Tiny micro-animations (CSS classes)
    scene.classList.remove("bop");
    // force reflow for re-trigger
    void scene.offsetWidth;
    scene.classList.add("bop");

    setProgress();

    if (shakes >= REQUIRED_SHAKES) unlock();
  };

  const unlock = () => {
    if (unlocked) return;
    unlocked = true;

    scene.classList.add("arrival");       // Santa-on-cow arrives (CSS handles)
    shakeBtn.disabled = true;
    shakeBtn.classList.add("disabled");

    setTimeout(() => {
      reveal.classList.add("show");
      showToast("🎁 Geschenk freigeschaltet!");
    }, 900);
  };

  // ====== CLICK / TAP ======
  shakeBtn.addEventListener("click", () => doShake(1), { passive: true });
  shakeBtn.addEventListener("touchend", () => doShake(1), { passive: true });

  // ====== DEVICE SHAKE (optional) ======
  // We use a gentle accelerometer check; if permission is needed, we fall back to button only.
  let last = { x: null, y: null, z: null, t: 0 };

  const handleMotion = (e) => {
    if (unlocked) return;
    const a = e.accelerationIncludingGravity;
    if (!a) return;

    const now = Date.now();
    // throttle
    if (now - last.t < 120) return;

    const x = a.x ?? 0;
    const y = a.y ?? 0;
    const z = a.z ?? 0;

    if (last.x !== null) {
      const dx = Math.abs(x - last.x);
      const dy = Math.abs(y - last.y);
      const dz = Math.abs(z - last.z);
      const delta = dx + dy + dz;

      // threshold tuned for phones
      if (delta > 16) doShake(2);
      else if (delta > 12) doShake(1);
    }

    last = { x, y, z, t: now };
  };

  const tryEnableMotion = async () => {
    try {
      // iOS may require permission
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        // We don't auto-popup; user can just use the button.
        // If you later want, we can add a "Bewegung erlauben" button.
        return;
      }
      window.addEventListener("devicemotion", handleMotion, { passive: true });
    } catch (_) {
      // ignore; button still works
    }
  };

  // ====== COPY CODE ======
  copyBtn.addEventListener("click", async () => {
    const code = codeBox.textContent.trim();
    if (!code || code.includes("STEAM-CODE-HIER-EINFÜGEN")) {
      showToast("⚠️ Bitte erst den Steam-Code einfügen.");
      return;
    }
    const ok = await safeClipboardCopy(code);
    showToast(ok ? "✅ Code kopiert!" : "❌ Kopieren ging nicht.");
  });

  // ====== INIT ======
  setProgress();
  tryEnableMotion();
})();
