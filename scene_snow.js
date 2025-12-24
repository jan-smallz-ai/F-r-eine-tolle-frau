(function(){
  const SceneSnow = {
    scratchApi: null,
    bind(){
      const under = document.getElementById('under-snow');
      under.innerHTML = `
        <div style="max-width:720px;">
          <div style="font-size:22px; font-weight:950;">🎅 *plumps* …</div>
          <div style="margin-top:10px; font-size:16px; opacity:.92;">
            Der Weihnachtsmann steckt im Schnee fest.<br/>
            Wisch alles frei, damit er wieder raus kann!
          </div>
        </div>
      `;

      const canvas = document.getElementById('scratch');
      const status = document.getElementById('snow-status');
      const reset = document.getElementById('reset-snow');

      // Attach scratch: streng
      this.scratchApi = window.SCRATCH.attachScratch(canvas, {
        brushRadius: 30,
        onProgress: (p, done)=>{
          // KEIN Prozent im Bild, nur kleine Status-Logik:
          if(done){
            status.textContent = "✅ Komplett frei! (100%)";
          } else {
            status.textContent = "Noch nicht ganz… wisch wirklich ALLES frei.";
          }
        },
        onDone: ()=>{
          window.FX.flash();
          setTimeout(()=> window.APP.go('finale'), 420);
        }
      });

      reset.addEventListener('click', ()=>{
        this.scratchApi.reset();
        window.FX.hint("Okay — Schnee wieder komplett da. ❄️");
      });
    }
  };

  window.SCENE_SNOW = SceneSnow;
})();
