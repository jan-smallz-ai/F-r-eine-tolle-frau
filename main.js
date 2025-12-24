(() => {
  const $ = (s) => document.querySelector(s);

  const stageFly = $("#stageFly");
  const stageSnow = $("#stageSnow");
  const stageGift = $("#stageGift");

  const sleighBtn = $("#sleighBtn");
  const tapCountEl = $("#tapCount");

  const wipeCanvas = $("#wipeCanvas");
  const wipePctEl = $("#wipePct");

  const openGiftBtn = $("#openGiftBtn");
  const speechFinal = $("#speechFinal");

  const modal = $("#modal");
  const copyBtn = $("#copyBtn");
  const closeBtn = $("#closeBtn");
  const codeText = $("#codeText");

  // ----- State -----
  let taps = 0;
  let wiping = false;
  let ctx = null;
  let last = null;

  // ----- Helpers -----
  function show(el){ el.classList.remove("hidden"); }
  function hide(el){ el.classList.add("hidden"); }

  function setModal(open){
    if(open){
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden","false");
    } else {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden","true");
    }
  }

  // ----- Stage 1: 3 taps, no timer -----
  sleighBtn.addEventListener("click", () => {
    taps = Math.min(3, taps + 1);
    tapCountEl.textContent = String(taps);

    // Kleine Rückmeldung
    sleighBtn.animate(
      [{ transform: "translateY(-50%) scale(1)" }, { transform: "translateY(-50%) scale(0.985)" }, { transform:"translateY(-50%) scale(1)"}],
      { duration: 180 }
    );

    if(taps >= 3){
      // Stop flight animation by swapping class-less inline animation
      sleighBtn.style.animation = "none";
      sleighBtn.style.left = "55%";
      sleighBtn.style.top = "60%";
      sleighBtn.style.transform = "translate(-50%,-50%) rotate(8deg)";
      sleighBtn.style.cursor = "default";

      // Kurz "Crash"-Feeling
      setTimeout(() => {
        hide(stageFly);
        show(stageSnow);
        setupWipe();
      }, 450);
    }
  });

  // ----- Stage 2: Wipe snow on canvas -----
  function setupWipe(){
    // canvas to element size
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = wipeCanvas.getBoundingClientRect();
    wipeCanvas.width = Math.floor(rect.width * dpr);
    wipeCanvas.height = Math.floor(rect.height * dpr);

    ctx = wipeCanvas.getContext("2d", { willReadFrequently: true });
    ctx.scale(dpr, dpr);

    // Paint "snow" overlay
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(0,0,rect.width,rect.height);

    // Add some fluffy noise
    for(let i=0;i<120;i++){
      ctx.beginPath();
      const r = 10 + Math.random()*26;
      ctx.fillStyle = `rgba(255,255,255,${0.45 + Math.random()*0.35})`;
      ctx.arc(Math.random()*rect.width, Math.random()*rect.height, r, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-out";
    wiping = true;
    wipePctEl.textContent = "0%";

    const start = (e) => { last = point(e); erase(last.x, last.y); };
    const move  = (e) => { if(!last) return; const p = point(e); line(last, p); last = p; updatePct(rect); };
    const end   = () => { last = null; updatePct(rect); };

    wipeCanvas.addEventListener("pointerdown", start);
    wipeCanvas.addEventListener("pointermove", move);
    wipeCanvas.addEventListener("pointerup", end);
    wipeCanvas.addEventListener("pointercancel", end);

    // prevent page scroll while wiping on mobile
    wipeCanvas.style.touchAction = "none";
  }

  function point(e){
    const r = wipeCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function erase(x,y){
    if(!wiping) return;
    ctx.beginPath();
    ctx.arc(x,y,22,0,Math.PI*2);
    ctx.fill();
  }

  function line(a,b){
    if(!wiping) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 44;
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.lineTo(b.x,b.y);
    ctx.stroke();
  }

  function updatePct(rect){
    if(!ctx || !wiping) return;

    // Sample a grid (fast) instead of full pixel scan
    const step = 18;
    let clear = 0, total = 0;

    const img = ctx.getImageData(0,0,rect.width,rect.height).data;
    for(let y=0; y<rect.height; y+=step){
      for(let x=0; x<rect.width; x+=step){
        total++;
        const i = ((Math.floor(y)*rect.width) + Math.floor(x)) * 4 + 3; // alpha
        const alpha = img[i];
        if(alpha < 40) clear++;
      }
    }

    const pct = Math.round((clear/total)*100);
    wipePctEl.textContent = `${pct}%`;

    if(pct >= 55){
      wiping = false;
      // Weiter
      setTimeout(() => {
        hide(stageSnow);
        show(stageGift);

        // Nach kurzem Tanz: final bubble einblenden
        setTimeout(() => {
          speechFinal.setAttribute("aria-hidden","false");
          speechFinal.classList.remove("hidden");
        }, 1400);
      }, 350);
    }
  }

  // ----- Stage 3: Gift reveal -----
  openGiftBtn.addEventListener("click", () => setModal(true));
  closeBtn.addEventListener("click", () => setModal(false));
  modal.addEventListener("click", (e) => { if(e.target === modal) setModal(false); });

  copyBtn.addEventListener("click", async () => {
    const text = codeText.textContent.trim();
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => (copyBtn.textContent = "Kopieren"), 1200);
    } catch {
      // Fallback: select via prompt
      window.prompt("Kopiere den Code:", text);
    }
  });

  // Safety: modal should not show on load
  setModal(false);

  // Cache-busting hint: if changes don't show, add ?v=123 to URL
})();
