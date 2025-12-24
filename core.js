// core.js
(() => {
  // >>> HIER den echten Code einsetzen <<<
  const STEAM_CODE = "HIER-DEIN-STEAM-CODE";

  const el = {
    stageTag: document.getElementById("stageTag"),
    snowLayer: document.getElementById("snowLayer"),
    sleighArea: document.getElementById("sleighArea"),
    crashPoof: document.getElementById("crashPoof"),
    mood: document.getElementById("mood"),
    speechText: document.getElementById("speechText"),
    btnNext: document.getElementById("btnNext"),

    wipeScreen: document.getElementById("wipeScreen"),
    wipeCanvas: document.getElementById("wipeCanvas"),
    meterFill: document.getElementById("meterFill"),
    meterText: document.getElementById("meterText"),
    btnWipeSkip: document.getElementById("btnWipeSkip"),

    finalScreen: document.getElementById("finalScreen"),
    finalTree: document.getElementById("finalTree"),
    finalLine: document.getElementById("finalLine"),
    codeBlur: document.getElementById("codeBlur"),
    btnReveal: document.getElementById("btnReveal"),
    btnReplay: document.getElementById("btnReplay"),
    confetti: document.getElementById("confetti"),
  };

  // --- Setup visuals ---
  FX.spawnSnow(el.snowLayer, 46);
  el.sleighArea.innerHTML = SceneArt.svgSleighScene();

  const sleighSvg = el.sleighArea.querySelector("svg");
  FX.animateSleigh(sleighSvg);

  let tapGame = null;
  let wipeGame = null;

  // --- Story state machine ---
  const Stages = Object.freeze({
    INTRO_HELP: "INTRO_HELP",
    TAP_3: "TAP_3",
    CRASH: "CRASH",
    WIPE: "WIPE",
    THANKS: "THANKS",
    DANCE: "DANCE",
    FINALE: "FINALE"
  });

  let stage = Stages.INTRO_HELP;
  let busy = false;

  function setTag(txt){ el.stageTag.textContent = txt; }

  async function say(text, mood="🙂", nextLabel="Weiter"){
    el.mood.textContent = mood;
    el.btnNext.textContent = nextLabel;
    await FX.typewriter(el.speechText, text, {speed:20, jitter:18});
  }

  function lockNext(locked){
    el.btnNext.disabled = locked;
    el.btnNext.style.opacity = locked ? ".55" : "1";
    el.btnNext.style.pointerEvents = locked ? "none" : "auto";
  }

  async function runIntro(){
    setTag("Szene 1");
    stage = Stages.INTRO_HELP;
    lockNext(true);
    await say("Hiiilfe! Meine Kühe sind außer Kontrolle… 🐄💨\nTippe dreimal auf den Schlitten oder die Kühe, damit ich sie bremsen kann!", "😰", "Okay!");
    lockNext(false);
  }

  function runTapGame(){
    setTag("3x Tippen");
    stage = Stages.TAP_3;

    tapGame?.destroy();
    tapGame = MiniTap.createTapGame({
      tapTargetEl: el.sleighArea,
      needed: 3,
      onProgress: (t, n)=>{
        el.stageTag.textContent = `Bremsen: ${t}/${n}`;
      },
      onDone: async ()=>{
        await doCrash();
      }
    });
  }

  async function doCrash(){
    if(busy) return;
    busy = true;
    tapGame?.destroy();

    setTag("Oh oh…");
    lockNext(true);

    // more intense shake
    await FX.shake(el.sleighArea, 600, 10);
    el.crashPoof.classList.add("show");

    await say("Aaaah! Zu spät—! 😵‍💫", "😵‍💫", "Oh nein");
    lockNext(false);

    // whiteout to wipe screen
    setTimeout(()=> openWipeScreen(), 250);
    busy = false;
  }

  function openWipeScreen(){
    setTag("Schnee");
    stage = Stages.WIPE;
    el.wipeScreen.classList.remove("hidden");

    // Setup wipe minigame
    wipeGame?.destroy();
    wipeGame = MiniSnowWipe.setupSnowWipe({
      canvas: el.wipeCanvas,
      required: 0.985,
      onProgress: (ratio)=>{
        const pct = Math.floor(ratio*100);
        el.meterFill.style.width = `${pct}%`;
        el.meterText.textContent = `${pct}%`;
      },
      onComplete: ()=>{
        // Ensure meter reads 100%
        el.meterFill.style.width = `100%`;
        el.meterText.textContent = `100%`;
        setTimeout(()=> closeWipeAndThanks(), 350);
      }
    });

    // Notfall (falls Touch irgendwas blockiert)
    el.btnWipeSkip.onclick = ()=>{
      closeWipeAndThanks(true);
    };
  }

  async function closeWipeAndThanks(skipped=false){
    wipeGame?.destroy();
    el.wipeScreen.classList.add("hidden");

    setTag("Gerettet!");
    stage = Stages.THANKS;
    lockNext(true);

    if(skipped){
      await say("Puh… okay! Notfall-Teleport aus dem Schnee! 😅\n(Beim nächsten Mal wischen wir’s richtig weg.)", "😅", "Weiter");
    }else{
      await say("Oh! Danke Michelle… du hast Weihnachten gerettet! ❄️✨", "🥹", "Awww!");
    }

    lockNext(false);

    // then dance
    await doDance();
  }

  async function doDance(){
    if(busy) return;
    busy = true;

    setTag("Tanz!");
    stage = Stages.DANCE;
    lockNext(true);

    await say("Jetzt wird gefeiert. 10 Sekunden Weihnachts-Tanzmodus! 🕺🎅", "😄", "Los!");

    // add a “dance” effect by scaling/rotating the whole SVG slightly for 10 sec
    const svg = el.sleighArea.querySelector("svg");
    const original = svg.style.transform;
    const start = performance.now();

    const danceLoop = (t)=>{
      const dt = (t-start)/1000;
      if(dt >= 10){
        svg.style.transform = original;
        busy = false;
        lockNext(false);
        return openFinale();
      }
      const r = Math.sin(dt*7)*2.2;
      const s = 1 + 0.015*Math.sin(dt*9);
      svg.style.transform = `rotate(${r}deg) scale(${s})`;
      requestAnimationFrame(danceLoop);
    };

    requestAnimationFrame(danceLoop);
  }

  function openFinale(){
    setTag("Finale");
    stage = Stages.FINALE;

    el.finalScreen.classList.remove("hidden");

    el.finalTree.innerHTML = SceneArt.svgTreeFinal();
    const treeSvg = el.finalTree.querySelector("svg");
    FX.blinkTree(treeSvg);

    el.finalLine.textContent =
      "Der Weihnachtsmann ist glücklich, der Baum funkelt – und jetzt bekommst du dein Geschenk 🎁";

    el.codeBlur.textContent = STEAM_CODE || "HIER-DEIN-STEAM-CODE";
    el.codeBlur.classList.remove("revealed");

    el.btnReveal.onclick = ()=>{
      el.codeBlur.classList.add("revealed");
      FX.confettiBurst(el.confetti, 34);
      el.finalLine.textContent = "Woooow! 🎉 Frohe Weihnachten, Michelle! ⭐";
    };

    el.btnReplay.onclick = ()=>{
      // reset everything to start
      el.finalScreen.classList.add("hidden");
      el.crashPoof.classList.remove("show");
      el.speechText.textContent = "";
      el.stageTag.textContent = "Start";
      runIntro().then(()=> runTapGame());
    };
  }

  // Button next - mostly story pacing
  el.btnNext.addEventListener("click", async ()=>{
    if(busy) return;

    // Intro button -> start tap minigame
    if(stage === Stages.INTRO_HELP){
      runTapGame();
      await say("Okay, Michelle! Schnell: dreimal tippen! Die Kühe drehen durch! 🐄💨", "😰", "Ich tippe!");
      return;
    }

    // If crash dialog is showing, just let it progress
    if(stage === Stages.CRASH){
      return;
    }

    // THANKS stage handled automatically into dance, no manual needed
  });

  // Start
  runIntro().then(()=> runTapGame());
})();
