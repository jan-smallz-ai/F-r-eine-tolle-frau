(() => {
  const $ = (id) => document.getElementById(id);

  const actionBtn = $("actionBtn");
  const altBtn = $("altBtn");
  const stepTitle = $("stepTitle");
  const tinyInfo = $("tinyInfo");
  const meterBar = $("meterBar");
  const gift = $("gift");

  const modal = $("modal");
  const codeText = $("codeText");
  const copyBtn = $("copyBtn");
  const closeBtn = $("closeBtn");

  // --- Einstellungen ---
  const TARGET1 = 12; // Klicks für Schritt 1
  const TARGET2 = 8;  // Schneeflocken in Schritt 2
  const SHAKE_THRESHOLD = 18; // Schritt 3: Schüttel-Empfindlichkeit

  let step = 1;
  let progress = 0;

  // Schritt 2: Schneeflocken zum Wegklicken
  const snowClicks = [];

  function setMeter(pct) {
    meterBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  function setStep(newStep) {
    step = newStep;
    progress = 0;
    setMeter(0);

    // Cleanup Schneeflocken
    snowClicks.splice(0).forEach((el) => el.remove());

    if (step === 1) {
      stepTitle.textContent = "Schritt 1/3: Kuh landen lassen 🐄";
      tinyInfo.textContent = "Tippe auf „Landen!“ bis die Anzeige voll ist.";
      actionBtn.textContent = "Landen!";
      gift.classList.remove("wobble");
      actionBtn.disabled = false;
    }

    if (step === 2) {
      stepTitle.textContent = "Schritt 2/3: Schneeflocken wegklicken ❄️";
      tinyInfo.textContent = "Klicke/Tippe schnell die Schneeflocken weg, bis es voll ist.";
      actionBtn.textContent = "Flocken spawnen!";
      gift.classList.remove("wobble");
      actionBtn.disabled = false;
      spawnSnowTargets();
    }

    if (step === 3) {
      stepTitle.textContent = "Schritt 3/3: Geschenk schütteln 🎁";
      tinyInfo.textContent = "Am Handy: schütteln. Oder drücke den Button, wenn du nicht schütteln willst.";
      actionBtn.textContent = "Schütteln (Klick)";
      gift.classList.add("wobble");
      actionBtn.disabled = false;
      // Optional: iOS braucht User-Geste für Motion-Rechte
      requestMotionPermissionIfNeeded();
    }
  }

  function nextStep() {
    if (step < 3) setStep(step + 1);
    else reveal();
  }

  // --- Schritt 1: Klick-Progress ---
  function handleStep1Click() {
    progress += 1;
    setMeter((progress / TARGET1) * 100);
    if (progress >= TARGET1) nextStep();
  }

  // --- Schritt 2: Schneeflocken ---
  function spawnSnowTargets() {
    // Erzeuge klickbare Flocken im Scene-Bereich
    const scene = document.querySelector(".scene");
    const rect = scene.getBoundingClientRect();

    for (let i = 0; i < TARGET2; i++) {
      const flake = document.createElement("button");
      flake.type = "button";
      flake.className = "flake";
      flake.textContent = "❄️";
      flake.style.left = `${8 + Math.random() * (rect.width - 60)}px`;
      flake.style.top  = `${18 + Math.random() * (rect.height - 130)}px`;

      flake.addEventListener("click", () => {
        flake.disabled = true;
        flake.classList.add("pop");
        setTimeout(() => flake.remove(), 180);

        progress += 1;
        setMeter((progress / TARGET2) * 100);
        if (progress >= TARGET2) nextStep();
      });

      scene.appendChild(flake);
      snowClicks.push(flake);
    }
  }

  // Styling für die Flocken per JS-Injection (damit wir keine extra Datei brauchen)
  const style = document.createElement("style");
  style.textContent = `
    .flake{
      position:absolute;
      width: 48px; height: 48px;
      display:grid; place-items:center;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.18);
      background: rgba(255,255,255,.08);
      font-size: 22px;
      cursor:pointer;
      -webkit-tap-highlight-color: transparent;
      user-select:none;
      animation: drift 1.2s ease-in-out infinite;
    }
    @keyframes drift{
      0%{ transform: translateY(0) rotate(-6deg); }
      50%{ transform: translateY(-6px) rotate(6deg); }
      100%{ transform: translateY(0) rotate(-6deg); }
    }
    .flake.pop{ transform: scale(.7); opacity:.2; transition: .18s ease; }
  `;
  document.head.appendChild(style);

  // --- Schritt 3: Shake oder Button ---
  let lastShake = 0;

  function onMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (!a) return;

    const x = a.x || 0, y = a.y || 0, z = a.z || 0;
    const mag = Math.sqrt(x*x + y*y + z*z);

    const now = Date.now();
    if (mag > SHAKE_THRESHOLD && (now - lastShake) > 400) {
      lastShake = now;

      progress += 1;
      setMeter((progress / 6) * 100); // 6 shakes bis voll
      if (progress >= 6) reveal();
    }
  }

  async function requestMotionPermissionIfNeeded() {
    // iOS Safari verlangt Permission nach User-Geste
    try {
      const DME = window.DeviceMotionEvent;
      if (DME && typeof DME.requestPermission === "function") {
        // Wir fragen NICHT sofort beim Laden – erst wenn Schritt 3 aktiv ist (und Nutzer eh schon klickt).
        // Permission kommt beim nächsten Klick auf actionBtn/altBtn
      } else {
        // Android/andere: sofort Listener aktivieren
        window.addEventListener("devicemotion", onMotion, { passive: true });
      }
    } catch (_) {}
  }

  async function ensureMotionPermission() {
    const DME = window.DeviceMotionEvent;
    if (DME && typeof DME.requestPermission === "function") {
      const res = await DME.requestPermission();
      if (res === "granted") {
        window.addEventListener("devicemotion", onMotion, { passive: true });
      }
    }
  }

  // --- Reveal ---
  function reveal() {
    // stop wobble nur als "aufgerissen" Effekt
    gift.classList.remove("wobble");

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  // --- Button-Logik ---
  actionBtn.addEventListener("click", async () => {
    if (step === 1) return handleStep1Click();
    if (step === 2) {
      // In Schritt 2 ist der Button nur „optisch“ – Flocken sind schon da.
      return;
    }
    if (step === 3) {
      // Klick-Alternative zum Schütteln:
      progress += 1;
      setMeter((progress / 10) * 100);
      if (progress >= 10) reveal();
      // iOS: Permission beim Klick holen
      await ensureMotionPermission();
    }
  });

  altBtn.addEventListener("click", async () => {
    // Immer als Hilfe: iOS Motion Permission beim Klick anfragen
    await ensureMotionPermission();
    if (step === 3) {
      // macht nichts extra – zeigt nur „du kannst klicken“
      tinyInfo.textContent = "Alles gut — klick einfach mehrmals auf „Schütteln (Klick)“ 🙂";
    } else {
      tinyInfo.textContent = "Okay 🙂 Wir bleiben beim Klicken.";
    }
  });

  copyBtn.addEventListener("click", async () => {
    const text = codeText.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Kopiert!";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 900);
    } catch {
      // Fallback:
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      copyBtn.textContent = "Kopiert!";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 900);
    }
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Startzustand: Modal muss zu sein
  closeModal();
  setStep(1);
})();
