(function(){
  function fitCanvasToCSS(canvas){
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
  }

  function drawSnow(ctx, w, h){
    // komplette weiße Fläche mit leichtem Schneerauschen
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,w,h);

    // Schneestruktur
    for(let i=0;i<1800;i++){
      const x = Math.random()*w;
      const y = Math.random()*h;
      const r = Math.random()*1.6 + 0.2;
      const a = Math.random()*0.12;
      ctx.fillStyle = `rgba(180,210,230,${a})`;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }

    // leichte Kanten-Vignette
    const g = ctx.createRadialGradient(w*0.5,h*0.45,Math.min(w,h)*0.18, w*0.5,h*0.45,Math.max(w,h)*0.7);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(220,235,245,0.20)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
  }

  function percentCleared(ctx, w, h){
    // Wir zählen ALLE Pixel, die vollständig transparent sind.
    // Das ist streng – dadurch passiert garantiert nichts bei 26%.
    const img = ctx.getImageData(0,0,w,h).data;
    let transparent = 0;
    const total = w*h;
    for(let i=3;i<img.length;i+=4){
      if(img[i] === 0) transparent++;
    }
    return (transparent / total) * 100;
  }

  function scratchErase(ctx, x, y, r){
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function attachScratch(canvas, opts){
    const state = {
      ctx: null,
      w: 0,
      h: 0,
      isDown: false,
      last: null,
      cleared: 0,
      done: false,
    };

    function rebuild(){
      state.ctx = fitCanvasToCSS(canvas);
      state.w = canvas.getBoundingClientRect().width;
      state.h = canvas.getBoundingClientRect().height;
      drawSnow(state.ctx, state.w, state.h);
      state.done = false;
      state.cleared = 0;
      if(opts.onProgress) opts.onProgress(0, false);
    }

    function posFromEvent(ev){
      const rect = canvas.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function move(ev){
      if(!state.isDown || state.done) return;
      ev.preventDefault();

      const {x,y} = posFromEvent(ev);
      const r = opts.brushRadius || 26;

      // weiche Linie: mehrere Kreise zwischen last und current
      const last = state.last || {x,y};
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx,dy);
      const steps = Math.max(1, Math.floor(dist / (r*0.35)));

      for(let i=0;i<=steps;i++){
        const t = i/steps;
        const px = last.x + dx*t;
        const py = last.y + dy*t;
        scratchErase(state.ctx, px, py, r);
      }

      state.last = {x,y};

      // Progress nicht permanent, sondern gedrosselt prüfen
      if(!state._progT){
        state._progT = setTimeout(()=>{
          state._progT = null;
          const p = percentCleared(state.ctx, state.w, state.h);
          state.cleared = p;

          // STRENG: erst bei 100.00% (mit minimaler numerischer Toleranz)
          const done = p >= 99.995;
          if(done && !state.done){
            state.done = true;
          }
          if(opts.onProgress) opts.onProgress(p, state.done);
          if(state.done && opts.onDone) opts.onDone();
        }, 140);
      }
    }

    function down(ev){
      if(state.done) return;
      state.isDown = true;
      state.last = null;
      move(ev);
    }
    function up(){
      state.isDown = false;
      state.last = null;
    }

    window.addEventListener('resize', rebuild);

    canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    canvas.addEventListener('touchstart', down, {passive:false});
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('touchend', up);

    rebuild();

    return {
      reset: rebuild,
      getCleared: ()=>state.cleared,
      destroy: ()=>{
        window.removeEventListener('resize', rebuild);
      }
    };
  }

  window.SCRATCH = { attachScratch };
})();
