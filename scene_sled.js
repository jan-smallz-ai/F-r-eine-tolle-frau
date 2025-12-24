(function(){
  const SceneSled = {
    taps: 0,
    bind(){
      const artHost = document.getElementById('sled-art');
      artHost.innerHTML = window.ART.sledSceneSVG();

      // Tap-Ziel: Kühe oder Schlitten oder Fallback-Button
      const svg = artHost.querySelector('svg');
      const cows = svg.querySelector('#cows');
      const sled = svg.querySelector('#sled');
      const btn = document.getElementById('tap-target-btn');

      const onTap = ()=>{
        this.taps++;
        window.FX.hint(`Tap ${this.taps}/3 ✅`);

        // kleine Wackel-Animation
        svg.classList.remove('wiggle');
        void svg.offsetWidth;
        svg.classList.add('wiggle');

        if(this.taps >= 3){
          this.taps = 3;
          window.FX.hint("Oh oh… zu spät — CRASH! ❄️", 1300);
          this.crashToSnow();
        }
      };

      [cows, sled].forEach(el=>{
        el.addEventListener('click', onTap);
        el.addEventListener('touchstart', (e)=>{ e.preventDefault(); onTap(); }, {passive:false});
      });
      btn.addEventListener('click', onTap);

      // Style für wiggle (direkt hier als kleine Ergänzung)
      if(!document.getElementById('wiggle-style')){
        const st = document.createElement('style');
        st.id = 'wiggle-style';
        st.textContent = `
          .wiggle { animation: wiggle .45s ease; transform-origin: 50% 60%; }
          @keyframes wiggle {
            0%{ transform: translateY(0) rotate(0deg); }
            25%{ transform: translateY(2px) rotate(-1.4deg); }
            55%{ transform: translateY(-2px) rotate(1.7deg); }
            100%{ transform: translateY(0) rotate(0deg); }
          }
        `;
        document.head.appendChild(st);
      }
    },

    crashToSnow(){
      // kurze Sequenz: flash + Übergang
      window.FX.flash();
      setTimeout(()=>{
        window.APP.go('snow');
      }, 420);
    }
  };

  window.SCENE_SLED = SceneSled;
})();
