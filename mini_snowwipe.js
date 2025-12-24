// mini_snowwipe.js
(function(){
  function setupSnowWipe({
    canvas,
    onProgress,
    onComplete,
    brushRadius = 38,
    required = 0.985,   // 98.5% transparent = "wirklich weg"
    sampleEveryMs = 220 // öfter prüfen, aber performant
  }){
    const ctx = canvas.getContext("2d", { willReadFrequently:true });

    let W = 0, H = 0;
    let drawing = false;
    let last = {x:0,y:0};
    let clearedRatio = 0;
    let done = false;
    let timer = null;

    // We render an opaque white layer with subtle noise → user erases to transparent.
    function resize(){
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      W = Math.max(1, Math.floor(cssW * dpr));
      H = Math.max(1, Math.floor(cssH * dpr));
      canvas.width = W;
      canvas.height = H;

      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);

      paintSnowLayer();
      clearedRatio = 0;
      done = false;
      onProgress?.(0);
    }

    function paintSnowLayer(){
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0,0,w,h);

      // subtle snow texture
      for(let i=0;i<900;i++){
        const x = Math.random()*w;
        const y = Math.random()*h;
        const r = 0.6 + Math.random()*1.8;
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = `rgba(0,0,0,${0.02 + Math.random()*0.03})`;
        ctx.fill();
      }

      // soft vignette (still opaque)
      const g = ctx.createRadialGradient(w*0.5,h*0.45, 40, w*0.5,h*0.45, Math.max(w,h)*0.7);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.06)");
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
    }

    function posFromEvent(ev){
      const rect = canvas.getBoundingClientRect();
      const p = ev.touches?.[0] ?? ev;
      const x = (p.clientX - rect.left);
      const y = (p.clientY - rect.top);
      return {x,y};
    }

    function eraseLine(a,b){
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = brushRadius * 2;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // extra dab for smoother erase
      ctx.beginPath();
      ctx.arc(b.x,b.y, brushRadius, 0, Math.PI*2);
      ctx.fill();

      ctx.restore();

      // keep within bounds by not letting transparent bleed outside (not necessary, but safe)
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.rect(0,0,w,h);
      ctx.clip();
    }

    function start(ev){
      if(done) return;
      drawing = true;
      last = posFromEvent(ev);
      ev.preventDefault?.();
    }
    function move(ev){
      if(!drawing || done) return;
      const p = posFromEvent(ev);
      eraseLine(last, p);
      last = p;
      ev.preventDefault?.();
    }
    function end(){
      drawing = false;
    }

    function computeCleared(){
      if(done) return;

      // IMPORTANT: compute on CSS pixel space (scaled already) → sample actual buffer
      const img = ctx.getImageData(0,0, canvas.width, canvas.height).data;

      // Count alpha==0 pixels
      let transparent = 0;
      const total = canvas.width * canvas.height;

      // Alpha channel index 3, step 4
      for(let i=3; i<img.length; i+=4){
        if(img[i] === 0) transparent++;
      }

      clearedRatio = transparent / total;
      onProgress?.(clearedRatio);

      if(clearedRatio >= required){
        done = true;
        onComplete?.();
      }
    }

    function attach(){
      canvas.addEventListener("mousedown", start);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);

      canvas.addEventListener("touchstart", start, {passive:false});
      canvas.addEventListener("touchmove", move, {passive:false});
      canvas.addEventListener("touchend", end);

      window.addEventListener("resize", resize);

      timer = setInterval(computeCleared, sampleEveryMs);
      resize();
    }

    function destroy(){
      canvas.removeEventListener("mousedown", start);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);

      window.removeEventListener("resize", resize);

      if(timer) clearInterval(timer);
      timer = null;
    }

    attach();

    return {
      destroy,
      repaint(){
        paintSnowLayer();
        done = false;
        onProgress?.(0);
      },
      get ratio(){ return clearedRatio; }
    };
  }

  window.MiniSnowWipe = { setupSnowWipe };
})();
