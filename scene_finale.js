(function(){
  const SceneFinale = {
    giftTaps: 0,
    bind(){
      // Santa + Tree Art
      document.getElementById('finale-santa').innerHTML = window.ART.santaSoloSVG();
      document.getElementById('tree-art').innerHTML = window.ART.treeSVG();

      // Baum-Funkeln animieren (CSS + zufällige “Blinker” über JS)
      this.startSparklePulse();

      // “Tanz” 10 Sekunden
      const danceNote = document.getElementById('dance-note');
      danceNote.classList.add('is-on');

      const santaSvg = document.querySelector('#finale-santa svg');
      santaSvg.classList.add('dance');

      // Stop nach 10s
      setTimeout(()=>{
        santaSvg.classList.remove('dance');
        danceNote.classList.remove('is-on');
        document.getElementById('finale-text').textContent =
          "Hier ist dein Geschenk, Michelle! 🎁 Frohe Weihnachten!";
      }, 10000);

      // Geschenkbox: 3× tap bis offen
      const box = document.getElementById('gift-box');
      const card = document.getElementById('code-card');

      const onGiftTap = ()=>{
        this.giftTaps++;
        window.FX.hint(`Geschenk ${this.giftTaps}/3 🎁`);

        box.classList.remove('bump');
        void box.offsetWidth;
        box.classList.add('bump');

        if(this.giftTaps >= 3){
          this.giftTaps = 3;
          box.classList.add('is-open');
          card.hidden = false;
          window.FX.hint("🎉 Tadaaa!");
        }
      };

      box.addEventListener('click', onGiftTap);
      box.addEventListener('touchstart', (e)=>{ e.preventDefault(); onGiftTap(); }, {passive:false});

      // Animation styles (nur wenn noch nicht drin)
      if(!document.getElementById('finale-anim-style')){
        const st = document.createElement('style');
        st.id = 'finale-anim-style';
        st.textContent = `
          #finale-santa svg.dance { animation: santaDance 0.55s ease-in-out infinite; transform-origin: 50% 80%; }
          @keyframes santaDance{
            0%{ transform: translateY(0) rotate(0deg); }
            25%{ transform: translateY(-4px) rotate(-1.5deg); }
            55%{ transform: translateY(2px) rotate(1.8deg); }
            100%{ transform: translateY(0) rotate(0deg); }
          }
          .gift-box.bump{ animation: bump .18s ease; }
          @keyframes bump{ 0%{ transform: scale(1); } 50%{ transform: scale(1.03); } 100%{ transform: scale(1);} }

          /* dezentes Funkeln am Baum */
          #tree-art svg #tree-sparkles { animation: sparkle 1.6s ease-in-out infinite; transform-origin: 50% 50%; }
          @keyframes sparkle { 0%,100%{ opacity:.55; } 50%{ opacity:.95; } }
        `;
        document.head.appendChild(st);
      }
    },

    startSparklePulse(){
      // kleine zufällige glitzernde “Pings” als Effekt, ohne die SVG kaputt zu machen
      const host = document.querySelector('#tree-art');
      if(!host) return;

      // Nur 1x
      if(host._sparkTimer) clearInterval(host._sparkTimer);

      host._sparkTimer = setInterval(()=>{
        const ping = document.createElement('div');
        ping.className = 'spark-ping';
        const x = Math.random()*85 + 7;
        const y = Math.random()*70 + 8;
        ping.style.left = x + '%';
        ping.style.top = y + '%';
        host.appendChild(ping);
        setTimeout(()=> ping.remove(), 900);
      }, 420);

      if(!document.getElementById('spark-ping-style')){
        const st = document.createElement('style');
        st.id = 'spark-ping-style';
        st.textContent = `
          .spark-ping{
            position:absolute;
            width:10px; height:10px;
            border-radius:999px;
            background: rgba(255,255,255,.95);
            box-shadow: 0 0 18px rgba(255,255,255,.55);
            transform: translate(-50%,-50%) scale(.7);
            opacity:0;
            animation: ping .9s ease;
            pointer-events:none;
          }
          @keyframes ping{
            0%{ opacity:0; transform: translate(-50%,-50%) scale(.5); }
            30%{ opacity:1; }
            100%{ opacity:0; transform: translate(-50%,-50%) scale(1.8); }
          }
          #tree-art{ position:relative; }
        `;
        document.head.appendChild(st);
      }
    }
  };

  window.SCENE_FINALE = SceneFinale;
})();
