(function(){
  const scenes = {
    sled: document.getElementById('scene-sled'),
    snow: document.getElementById('scene-snow'),
    finale: document.getElementById('scene-finale'),
  };

  function setActive(name){
    Object.entries(scenes).forEach(([k,el])=>{
      el.classList.toggle('is-active', k === name);
    });
  }

  // App-API global
  window.APP = {
    current: 'sled',
    go(name){
      this.current = name;
      setActive(name);

      // einmalig binden pro Szene
      if(name === 'sled' && !scenes.sled._bound){
        window.SCENE_SLED.bind();
        scenes.sled._bound = true;
      }
      if(name === 'snow' && !scenes.snow._bound){
        window.SCENE_SNOW.bind();
        scenes.snow._bound = true;
      }
      if(name === 'finale' && !scenes.finale._bound){
        window.SCENE_FINALE.bind();
        scenes.finale._bound = true;
      }
    }
  };

  // Start
  window.APP.go('sled');

  // Optional: Code hier zentral setzen
  // document.getElementById('steam-code').textContent = "XXXX-XXXX-XXXX";
})();
