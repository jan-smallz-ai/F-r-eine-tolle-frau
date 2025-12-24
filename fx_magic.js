// fx_magic.js
(function(){
  function spawnSnow(container, count = 42){
    container.innerHTML = "";
    const rect = container.getBoundingClientRect();
    const w = Math.max(320, rect.width || 900);

    for(let i=0;i<count;i++){
      const d = document.createElement("div");
      d.className = "snow-dot";
      const size = 3 + Math.random()*5;
      d.style.width = `${size}px`;
      d.style.height = `${size}px`;
      d.style.left = `${Math.random()*w}px`;
      d.style.top = `${-40 - Math.random()*120}px`;
      d.style.opacity = (0.55 + Math.random()*0.45).toFixed(2);
      d.style.animationDuration = `${3.2 + Math.random()*3.4}s`;
      d.style.animationDelay = `${Math.random()*2.5}s`;
      container.appendChild(d);
    }
  }

  function typewriter(el, text, {speed=22, jitter=14} = {}){
    el.textContent = "";
    let i = 0;
    return new Promise(resolve=>{
      const tick = ()=>{
        i++;
        el.textContent = text.slice(0,i);
        if(i >= text.length) return resolve();
        const delay = Math.max(8, speed + (Math.random()*jitter - jitter/2));
        setTimeout(tick, delay);
      };
      tick();
    });
  }

  function shake(el, ms=650, intensity=7){
    const start = performance.now();
    return new Promise(resolve=>{
      const step = (t)=>{
        const p = Math.min(1, (t-start)/ms);
        const k = (1-p);
        const dx = (Math.random()*2-1)*intensity*k;
        const dy = (Math.random()*2-1)*intensity*k;
        el.style.transform = `translate(${dx}px,${dy}px)`;
        if(p < 1) requestAnimationFrame(step);
        else {
          el.style.transform = "";
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  function animateSleigh(svgRoot){
    // Adds gentle bobbing to sleigh + cows + wave arm
    const sleigh = svgRoot.querySelector("#sleigh");
    const cows = svgRoot.querySelector("#cows");
    const arm = svgRoot.querySelector("#waveArm");

    let t0 = performance.now();
    const loop = (t)=>{
      const dt = (t - t0) / 1000;
      const b1 = Math.sin(dt*2.2) * 6;
      const b2 = Math.sin(dt*2.0 + 1.7) * 5;
      const r1 = Math.sin(dt*1.8) * 1.8;
      const armR = Math.sin(dt*3.4) * 14;

      if(sleigh) sleigh.setAttribute("transform", `translate(420,160) rotate(${r1} 320 300) translate(0,${b1})`);
      if(cows) cows.setAttribute("transform", `translate(80,240) rotate(${-r1} 240 220) translate(0,${b2})`);
      if(arm) arm.setAttribute("transform", `translate(165,205) rotate(${armR} 0 0)`);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  function blinkTree(treeRoot){
    const bulbs = [...treeRoot.querySelectorAll(".bulb circle:first-child")];
    const sparks = [...treeRoot.querySelectorAll(".spark")];
    let t0 = performance.now();
    const loop = (t)=>{
      const dt = (t-t0)/1000;
      bulbs.forEach((b, idx)=>{
        const pulse = 0.6 + 0.4*Math.sin(dt*3 + idx*0.7);
        b.setAttribute("opacity", String(Math.max(0.35, pulse)));
      });
      sparks.forEach((s, idx)=>{
        const p = 0.35 + 0.65*Math.sin(dt*2.6 + idx*1.1);
        s.setAttribute("opacity", String(Math.max(0.10, p)));
        const sc = 0.9 + 0.15*Math.sin(dt*2.9 + idx);
        s.setAttribute("transform", s.getAttribute("transform").replace(/scale\([^)]+\)/, "") + ` scale(${sc.toFixed(3)})`);
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  function confettiBurst(container, pieces=26){
    container.innerHTML = "";
    const w = container.clientWidth || window.innerWidth;
    for(let i=0;i<pieces;i++){
      const p = document.createElement("i");
      p.style.left = `${Math.random()*(w-20)}px`;
      p.style.top = `${-20 - Math.random()*80}px`;
      p.style.transform = `rotate(${Math.random()*120}deg)`;
      p.style.opacity = "1";
      p.style.animationDelay = `${Math.random()*120}ms`;
      p.style.background = `rgba(255,255,255,.9)`;
      container.appendChild(p);
    }
  }

  window.FX = { spawnSnow, typewriter, shake, animateSleigh, blinkTree, confettiBurst };
})();
