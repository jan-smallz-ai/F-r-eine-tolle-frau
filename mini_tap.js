// mini_tap.js
(function(){
  function createTapGame({tapTargetEl, onProgress, onDone, needed=3}){
    let taps = 0;
    let locked = false;

    const hit = async ()=>{
      if(locked) return;
      taps++;
      onProgress?.(taps, needed);
      if(taps >= needed){
        locked = true;
        onDone?.();
      }
    };

    const onClick = (e)=>{ e.preventDefault(); hit(); };
    const onKey = (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        hit();
      }
    };

    tapTargetEl.addEventListener("click", onClick);
    tapTargetEl.addEventListener("keydown", onKey);

    return {
      destroy(){
        tapTargetEl.removeEventListener("click", onClick);
        tapTargetEl.removeEventListener("keydown", onKey);
      },
      reset(){
        taps = 0;
        locked = false;
        onProgress?.(taps, needed);
      }
    };
  }

  window.MiniTap = { createTapGame };
})();
