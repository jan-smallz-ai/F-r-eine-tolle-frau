/* Geschenk 4 – Michelle (2.0)
   Fokus: Mobile klickbar, Schnee, Santa-auf-Kuh-Anflug, 3-Schritte-Minigame, Code am Ende kopierbar
*/
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  function ensureEl(tag, opts = {}, parent = document.body) {
    let el = opts.id ? document.getElementById(opts.id) : null;
    if (!el) {
      el = document.createElement(tag);
      if (opts.id) el.id = opts.id;
      if (opts.className) el.className = opts.className;
      parent.appendChild(el);
    }
    return el;
  }

  function setInline(el, cssText) {
    el.style.cssText += ";" + cssText;
  }

  function safeText(el, txt) {
    el.textContent = txt;
  }

  function supportsMotion() {
    return "DeviceMotionEvent" in window;
  }

  function requestMotionPermissionIfNeeded() {
    // iOS braucht Permission über Nutzer-Geste
    const DME = window.DeviceMotionEvent;
    if (DME && typeof DME.requestPermission === "function") {
      return DME.requestPermission().then((state) => state === "granted").catch(() => false);
    }
    return Promise.resolve(true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ---------- 0) Klick-Blocker verhindern (wichtig!) ----------
    // Alles "Deko" bekommt pointer-events: none; Nur Buttons/Interaktion pointer-events: auto.
    // Damit kann auf Mobile garantiert geklickt werden.

    // ---------- 1) Grund-Container ----------
    const main = $("#app") || ensureEl("main", { id: "app" }, document.body);
    main.setAttribute("role", "main");
    setInline(main, `
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      display: grid;
      place-items: center;
      padding: 24px 16px;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    `);

    // ---------- 2) Schnee (Canvas) ----------
    const snow = ensureEl("canvas", { id: "snow" }, main);
    setInline(snow, `
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none; /* extrem wichtig */
      z-index: 1;
      opacity: 0.9;
    `);

    // ---------- 3) “Santa auf Kuh” (Anflug oben) ----------
    const fly = ensureEl("div", { id: "flyer" }, main);
    setInline(fly, `
      position: absolute;
      top: 10px; left: -220px;
      width: 220px; height: 110px;
      z-index: 2;
      pointer-events: none; /* wichtig */
      transform: rotate(-2deg);
      filter: drop-shadow(0 10px 16px rgba(0,0,0,.25));
      animation: flyIn 8s linear infinite;
    `);

    // Kleine “Cartoon”-SVG (harmlos, wackelt lustig)
    fly.innerHTML = `
      <svg viewBox="0 0 220 110" width="220" height="110" aria-hidden="true">
        <!-- Wolke -->
        <ellipse cx="60" cy="76" rx="44" ry="18" fill="rgba(255,255,255,.22)"/>
        <ellipse cx="88" cy="72" rx="50" ry="22" fill="rgba(255,255,255,.18)"/>
        <!-- Kuh -->
        <g id="cow" transform="translate(20,36)">
          <ellipse cx="72" cy="36" rx="56" ry="26" fill="#f5f5f5"/>
          <ellipse cx="60" cy="36" rx="10" ry="8" fill="#333" opacity=".9"/>
          <ellipse cx="88" cy="42" rx="12" ry="9" fill="#333" opacity=".9"/>
          <rect x="34" y="54" width="10" height="20" rx="4" fill="#eaeaea"/>
          <rect x="60" y="56" width="10" height="20" rx="4" fill="#eaeaea"/>
          <rect x="88" y="54" width="10" height="20" rx="4" fill="#eaeaea"/>
          <rect x="112" y="52" width="10" height="20" rx="4" fill="#eaeaea"/>
          <!-- Euter (harmlos, nur wackelnd) -->
          <g id="udder" transform="translate(66,48)">
            <ellipse cx="0" cy="10" rx="12" ry="9" fill="#ffb7c8" opacity=".95"/>
            <circle cx="-6" cy="16" r="2.2" fill="#ff94ad"/>
            <circle cx="6" cy="16" r="2.2" fill="#ff94ad"/>
          </g>
          <!-- Kopf -->
          <g transform="translate(120,26)">
            <ellipse cx="18" cy="18" rx="18" ry="16" fill="#f5f5f5"/>
            <ellipse cx="10" cy="16" rx="3" ry="3" fill="#222"/>
            <ellipse cx="24" cy="16" rx="3" ry="3" fill="#222"/>
            <ellipse cx="18" cy="24" rx="8" ry="6" fill="#ffd3a7"/>
            <circle cx="14" cy="24" r="1.6" fill="#c67b5a"/>
            <circle cx="22" cy="24" r="1.6" fill="#c67b5a"/>
          </g>
        </g>

        <!-- Weihnachtsmann -->
        <g id="santa" transform="translate(70,6)">
          <g id="hat">
            <path d="M44 22 C40 6, 24 4, 18 18 C28 10, 38 16, 44 22Z" fill="#d73a3a"/>
            <circle cx="44" cy="22" r="6" fill="#fff"/>
            <rect x="14" y="18" width="30" height="6" rx="3" fill="#fff"/>
          </g>
          <g id="head">
            <circle cx="28" cy="34" r="14" fill="#ffd3a7"/>
            <ellipse cx="24" cy="34" rx="2" ry="2" fill="#222"/>
            <ellipse cx="33" cy="34" rx="2" ry="2" fill="#222"/>
            <path d="M23 40 Q28 44 33 40" stroke="#c67b5a" stroke-width="2" fill="none" stroke-linecap="round"/>
          </g>
          <g id="beard">
            <path d="M16 40 Q28 58 40 40 Q38 62 28 64 Q18 62 16 40Z" fill="#fff"/>
          </g>
          <g id="body">
            <ellipse cx="28" cy="76" rx="22" ry="18" fill="#d73a3a"/>
            <rect x="12" y="72" width="32" height="10" rx="5" fill="#2b2b2b"/>
            <circle cx="28" cy="76" r="3" fill="#ffd700"/>
          </g>
        </g>
      </svg>
    `;

    // ---------- 4) Content Card (Text + Gift + Button) ----------
    const card = $("#card") || ensureEl("section", { id: "card" }, main);
    setInline(card, `
      position: relative;
      z-index: 3;
      width: min(560px, 92vw);
      background: rgba(10, 14, 40, 0.78);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 22px;
      padding: 22px 18px;
      box-shadow: 0 16px 40px rgba(0,0,0,.35);
      backdrop-filter: blur(10px);
      text-align: center;
    `);

    // Titel / Text (falls noch nicht in HTML vorhanden)
    const h1 = $("#title") || ensureEl("h1", { id: "title" }, card);
    setInline(h1, `margin: 0 0 10px; font-size: clamp(28px, 6vw, 46px); line-height: 1.05; color: #fff;`);
    h1.innerHTML = `Frohe Weihnachten,<br><span style="color:#ffd36b">Michelle ✨</span>`;

    const p = $("#subtitle") || ensureEl("p", { id: "subtitle" }, card);
    setInline(p, `margin: 0 auto 18px; max-width: 46ch; color: rgba(255,255,255,.85); font-size: 18px;`);
    safeText(p, `Du Weihnachtswunder… der Weihnachtsmann ist schon unterwegs – auf einer Kuh. 🐄🎅`);

    // Gift “Stage”
    const stage = $("#stage") || ensureEl("div", { id: "stage" }, card);
    setInline(stage, `
      display: grid;
      place-items: center;
      margin: 14px 0 14px;
      padding: 10px 0;
    `);

    const gift = $("#gift") || ensureEl("div", { id: "gift" }, stage);
    setInline(gift, `
      width: 170px; height: 170px;
      border-radius: 28px;
      background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.35), rgba(255,255,255,0) 55%),
                  linear-gradient(180deg, #d83b3b, #b41f1f);
      position: relative;
      box-shadow: 0 16px 24px rgba(0,0,0,.35);
      transform: rotate(0deg);
      will-change: transform;
      cursor: default;
    `);

    // Bänder
    const ribbonV = ensureEl("div", { id: "ribbonV" }, gift);
    setInline(ribbonV, `position:absolute; inset: 0; width: 26px; left: 50%; transform: translateX(-50%); background: #ffd36b; border-radius: 14px; opacity:.95;`);
    const ribbonH = ensureEl("div", { id: "ribbonH" }, gift);
    setInline(ribbonH, `position:absolute; inset: 0; height: 26px; top: 50%; transform: translateY(-50%); background: #ffd36b; border-radius: 14px; opacity:.95;`);

    // Schleife
    const bow = ensureEl("div", { id: "bow" }, gift);
    setInline(bow, `
      position:absolute; top:-16px; left:50%;
      transform: translateX(-50%);
      width: 84px; height: 48px;
      pointer-events: none;
    `);
    bow.innerHTML = `
      <svg viewBox="0 0 84 48" width="84" height="48" aria-hidden="true">
        <path d="M10 24 C2 12, 18 4, 28 14 C34 20, 28 28, 10 24Z" fill="#ffd36b"/>
        <path d="M74 24 C82 12, 66 4, 56 14 C50 20, 56 28, 74 24Z" fill="#ffd36b"/>
        <circle cx="42" cy="24" r="9" fill="#ffefb0"/>
      </svg>
    `;

    const hint = $("#hint") || ensureEl("div", { id: "hint" }, card);
    setInline(hint, `margin: 8px 0 12px; color: rgba(255,255,255,.8); font-size: 16px;`);
    safeText(hint, `Schüttel das Geschenk, um es zu öffnen 👀`);

    // Button (klickbar!)
    const btn = $("#shakeBtn") || ensureEl("button", { id: "shakeBtn" }, card);
    btn.type = "button";
    setInline(btn, `
      width: min(360px, 92%);
      padding: 14px 18px;
      border-radius: 999px;
      border: 2px solid rgba(0,0,0,.25);
      background: #ffefb0;
      font-weight: 800;
      font-size: 18px;
      cursor: pointer;
      pointer-events: auto; /* wichtig */
      touch-action: manipulation; /* wichtig */
      box-shadow: 0 10px 22px rgba(0,0,0,.25);
    `);
    safeText(btn, "Geschenk schütteln");

    // Bereich für Reveal / Code
    const reveal = $("#reveal") || ensureEl("div", { id: "reveal" }, card);
    setInline(reveal, `display:none; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,.15);`);

    // ---------- 5) Animation CSS (nur falls noch nicht vorhanden) ----------
    const style = ensureEl("style", { id: "app-inline-style" }, document.head);
    style.textContent = `
      @keyframes flyIn {
        0% { transform: translateX(-260px) translateY(0px) rotate(-2deg); }
        40% { transform: translateX(calc(100vw + 260px)) translateY(12px) rotate(2deg); }
        100% { transform: translateX(calc(100vw + 260px)) translateY(12px) rotate(2deg); }
      }
      @keyframes wobble {
        0% { transform: rotate(0deg) translateX(0); }
        25% { transform: rotate(-6deg) translateX(-2px); }
        50% { transform: rotate(7deg) translateX(2px); }
        75% { transform: rotate(-5deg) translateX(-1px); }
        100% { transform: rotate(0deg) translateX(0); }
      }
      @keyframes pop {
        0% { transform: scale(1); }
        65% { transform: scale(1.06); }
        100% { transform: scale(1); }
      }
      #flyer svg #udder { transform-origin: 66px 62px; animation: udderWiggle 0.8s ease-in-out infinite; }
      @keyframes udderWiggle { 0%,100%{ transform: translate(66px,48px) rotate(0deg) } 50%{ transform: translate(66px,48px) rotate(6deg) } }
      #flyer svg #beard { transform-origin: 28px 44px; animation: beard 0.7s ease-in-out infinite; }
      @keyframes beard { 0%,100%{ transform: translate(0,0) } 50%{ transform: translate(0,1.5px) } }
      #flyer svg #body { transform-origin: 28px 76px; animation: belly 0.9s ease-in-out infinite; }
      @keyframes belly { 0%,100%{ transform: translate(0,0) } 50%{ transform: translate(0,1.2px) } }
    `;

    // ---------- 6) Mini-Game Logic ----------
    let shakes = 0;
    const goal = 10; // Anzahl “Schüttel”-Aktionen

    function animateGift() {
      gift.style.animation = "none";
      // reflow
      void gift.offsetWidth;
      gift.style.animation = "wobble .32s ease-in-out";
    }

    function setProgressText() {
      const left = Math.max(0, goal - shakes);
      if (left > 0) {
        safeText(hint, `Noch ${left}x schütteln… 😄`);
      } else {
        safeText(hint, `Auf geht’s… 🎁✨`);
      }
    }

    function showReveal() {
      btn.disabled = true;
      btn.style.opacity = "0.7";
      gift.style.animation = "pop .6s ease-in-out";

      reveal.style.display = "block";
      reveal.innerHTML = `
        <div style="color: rgba(255,255,255,.92); font-size: 18px; margin-bottom: 10px;">
          Michelle, du Weihnachtswunder… 🎄✨<br>
          <span style="opacity:.9">Mission erfüllt: Kuh-Airline ist gelandet 🐄🎅</span>
        </div>

        <div style="
          display: grid;
          gap: 10px;
          justify-items: center;
        ">
          <div style="
            background: rgba(255,255,255,.10);
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 16px;
            padding: 12px 12px;
            width: min(420px, 92%);
          ">
            <div style="opacity:.85; margin-bottom: 8px;">Dein Steam-Code:</div>
            <div id="codeBox" style="
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
              font-weight: 800;
              letter-spacing: 1px;
              font-size: 18px;
              padding: 10px 12px;
              border-radius: 12px;
              background: rgba(0,0,0,.25);
              border: 1px dashed rgba(255,255,255,.25);
              color: #ffefb0;
              user-select: text;
              word-break: break-all;
            ">STEAM-CODE HIER EINFÜGEN</div>
          </div>

          <button id="copyBtn" type="button" style="
            width: min(360px, 92%);
            padding: 12px 16px;
            border-radius: 999px;
            border: 2px solid rgba(0,0,0,.25);
            background: #b8ffcf;
            font-weight: 900;
            font-size: 16px;
            cursor: pointer;
            touch-action: manipulation;
            box-shadow: 0 10px 22px rgba(0,0,0,.25);
          ">Code kopieren</button>

          <div id="copyMsg" style="min-height: 20px; color: rgba(255,255,255,.85);"></div>
        </div>
      `;

      const copyBtn = $("#copyBtn", reveal);
      const codeBox = $("#codeBox", reveal);
      const msg = $("#copyMsg", reveal);

      copyBtn.addEventListener("click", async () => {
        const code = (codeBox.textContent || "").trim();
        try {
          await navigator.clipboard.writeText(code);
          safeText(msg, "Kopiert ✅ Jetzt bei Steam einlösen!");
        } catch {
          // Fallback: markieren
          const range = document.createRange();
          range.selectNodeContents(codeBox);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          safeText(msg, "Ich konnte nicht automatisch kopieren — aber der Code ist markiert. Jetzt „Kopieren“ drücken ✅");
        }
      }, { passive: true });

      safeText(hint, "🎉 Geschafft! Geschenk geöffnet.");
    }

    function doShake() {
      shakes++;
      animateGift();
      setProgressText();
      if (shakes >= goal) showReveal();
    }

    // Button klickbar machen (und garantiert nicht von Overlay blocken)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      doShake();
    }, { passive: false });

    // Optional: echte Handy-Schüttel-Erkennung (wenn verfügbar)
    let motionOn = false;
    let last = 0;
    let coolDown = 0;

    function startMotion() {
      if (!supportsMotion() || motionOn) return;
      motionOn = true;

      window.addEventListener("devicemotion", (ev) => {
        const a = ev.accelerationIncludingGravity;
        if (!a) return;
        const now = Date.now();
        const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);

        // einfacher Shake-Detector
        if (mag > 28 && (now - last) > 260 && coolDown <= 0) {
          last = now;
          coolDown = 2;
          doShake();
        }
        if (coolDown > 0) coolDown -= 0.2;
      }, { passive: true });
    }

    // Erst wenn Nutzer interagiert (Button), fragen wir ggf. Motion-Permission an:
    btn.addEventListener("click", () => {
      requestMotionPermissionIfNeeded().then((ok) => {
        if (ok) startMotion();
      });
    }, { passive: true });

    // ---------- 7) Schnee-Engine ----------
    const ctx = snow.getContext("2d");
    const flakes = [];
    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      snow.width = Math.floor(main.clientWidth * dpr);
      snow.height = Math.floor(main.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    function initSnow() {
      flakes.length = 0;
      const n = 80;
      for (let i = 0; i < n; i++) {
        flakes.push({
          x: Math.random() * main.clientWidth,
          y: Math.random() * main.clientHeight,
          r: 1 + Math.random() * 2.6,
          s: 0.6 + Math.random() * 1.6,
          w: -0.6 + Math.random() * 1.2,
        });
      }
    }
    initSnow();

    function tick() {
      ctx.clearRect(0, 0, main.clientWidth, main.clientHeight);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath();
      for (const f of flakes) {
        f.y += f.s;
        f.x += f.w * 0.6 + Math.sin((f.y + f.x) * 0.01) * 0.25;
        if (f.y > main.clientHeight + 8) {
          f.y = -10;
          f.x = Math.random() * main.clientWidth;
        }
        if (f.x < -10) f.x = main.clientWidth + 10;
        if (f.x > main.clientWidth + 10) f.x = -10;
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
      ctx.fill();
      requestAnimationFrame(tick);
    }
    tick();

    // Starttext setzen
    setProgressText();
  });
})();
