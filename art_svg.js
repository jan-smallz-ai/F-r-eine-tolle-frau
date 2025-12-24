(function(){
  function svgWrap(inner, w=980, h=520){
    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img">
        <defs>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(0,0,0,.45)"/>
          </filter>
          <linearGradient id="sledRed" x1="0" x2="1">
            <stop offset="0" stop-color="#b11622"/>
            <stop offset="1" stop-color="#ff3a42"/>
          </linearGradient>
          <linearGradient id="wood" x1="0" x2="1">
            <stop offset="0" stop-color="#7b4b2a"/>
            <stop offset="1" stop-color="#a86a3a"/>
          </linearGradient>
          <linearGradient id="metal" x1="0" x2="1">
            <stop offset="0" stop-color="rgba(255,255,255,.75)"/>
            <stop offset="1" stop-color="rgba(255,255,255,.25)"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="60%">
            <stop offset="0" stop-color="rgba(255,255,255,.35)"/>
            <stop offset="1" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        ${inner}
      </svg>
    `;
  }

  function sledSceneSVG(){
    // Mehr Details: Gesicht, Bart, Fellrand, Sack, Geschirr, Hufe, Hörner, Schlittenkufen etc.
    const inner = `
      <rect x="0" y="0" width="980" height="520" fill="rgba(0,0,0,0)"/>
      <g opacity=".85">
        <ellipse cx="820" cy="90" rx="220" ry="120" fill="rgba(255,255,255,.06)"/>
        <ellipse cx="120" cy="120" rx="260" ry="140" fill="rgba(255,255,255,.05)"/>
      </g>

      <!-- Boden-Schnee -->
      <g>
        <path d="M0,420 C140,385 260,450 420,420 C560,395 700,455 980,420 L980,520 L0,520 Z"
              fill="rgba(255,255,255,.10)"/>
        <path d="M0,438 C160,410 310,480 460,442 C610,405 740,475 980,440 L980,520 L0,520 Z"
              fill="rgba(255,255,255,.08)"/>
      </g>

      <!-- Kühe (3) -->
      <g id="cows" filter="url(#softShadow)" cursor="pointer">
        ${cow(140, 310, 1)}
        ${cow(280, 300, 1.03)}
        ${cow(420, 308, 0.98)}
      </g>

      <!-- Geschirr/Seile -->
      <g opacity=".9" stroke="rgba(255,255,255,.25)" stroke-width="4" fill="none">
        <path d="M210,330 C320,315 380,320 510,330" />
        <path d="M350,320 C470,300 560,300 660,310" />
      </g>

      <!-- Schlitten -->
      <g id="sled" filter="url(#softShadow)" cursor="pointer">
        <!-- Kufen -->
        <path d="M600,390 C650,425 760,430 880,410" stroke="url(#metal)" stroke-width="10" fill="none" />
        <path d="M590,402 C650,450 770,455 900,432" stroke="rgba(255,255,255,.18)" stroke-width="6" fill="none" />
        <!-- Körper -->
        <path d="M570,250 C610,225 720,220 850,250 C900,265 915,330 880,360
                 C835,400 650,410 590,350 C555,315 540,270 570,250 Z"
              fill="url(#sledRed)" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
        <!-- Holzleisten -->
        <g opacity=".95">
          <rect x="610" y="292" width="250" height="16" rx="8" fill="url(#wood)" opacity=".85"/>
          <rect x="600" y="322" width="260" height="16" rx="8" fill="url(#wood)" opacity=".80"/>
          <rect x="615" y="352" width="235" height="16" rx="8" fill="url(#wood)" opacity=".78"/>
        </g>

        <!-- Sack -->
        <g transform="translate(705 200)">
          <path d="M0,90 C-30,55 -22,10 22,0 C68,10 92,55 70,90
                   C58,110 20,125 0,90 Z"
                fill="rgba(167,94,38,.95)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
          <path d="M8,26 C26,16 44,18 56,30" stroke="rgba(0,0,0,.22)" stroke-width="4" fill="none" opacity=".55"/>
          <path d="M-5,55 C10,40 55,42 70,58" stroke="rgba(0,0,0,.20)" stroke-width="4" fill="none" opacity=".5"/>
          <rect x="18" y="6" width="38" height="12" rx="6" fill="rgba(0,0,0,.25)" opacity=".45"/>
        </g>

        <!-- Weihnachtsmann -->
        ${santa(635, 170, 1)}
      </g>

      <!-- Glitzer-Punkte -->
      <g opacity=".55">
        ${sparkles(48)}
      </g>
    `;
    return svgWrap(inner);
  }

  function cow(x,y, s=1){
    return `
      <g class="cow" transform="translate(${x} ${y}) scale(${s})">
        <!-- Körper -->
        <ellipse cx="70" cy="48" rx="62" ry="34" fill="rgba(255,255,255,.92)" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
        <!-- Flecken -->
        <path d="M32,54 C24,40 40,26 56,30 C70,35 62,58 48,62 C40,64 36,60 32,54 Z"
              fill="rgba(30,30,30,.78)"/>
        <path d="M88,40 C80,30 92,18 108,22 C122,26 118,44 106,48 C98,52 92,46 88,40 Z"
              fill="rgba(30,30,30,.72)"/>
        <!-- Kopf -->
        <g transform="translate(118 34)">
          <ellipse cx="20" cy="18" rx="22" ry="18" fill="rgba(255,255,255,.92)" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
          <!-- Schnauze -->
          <ellipse cx="24" cy="24" rx="16" ry="12" fill="rgba(245,200,210,.95)" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
          <circle cx="18" cy="24" r="2.4" fill="rgba(0,0,0,.65)"/>
          <circle cx="30" cy="24" r="2.4" fill="rgba(0,0,0,.65)"/>
          <!-- Augen -->
          <circle cx="14" cy="14" r="3.3" fill="rgba(0,0,0,.75)"/>
          <circle cx="28" cy="14" r="3.3" fill="rgba(0,0,0,.75)"/>
          <circle cx="13" cy="13" r="1.1" fill="rgba(255,255,255,.85)"/>
          <circle cx="27" cy="13" r="1.1" fill="rgba(255,255,255,.85)"/>
          <!-- Hörner -->
          <path d="M6,6 C-2,2 -6,10 2,14" stroke="rgba(210,170,120,.9)" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M34,6 C42,2 46,10 38,14" stroke="rgba(210,170,120,.9)" stroke-width="4" fill="none" stroke-linecap="round"/>
          <!-- Ohr -->
          <ellipse cx="2" cy="18" rx="6" ry="10" fill="rgba(255,255,255,.88)" stroke="rgba(0,0,0,.20)" stroke-width="2"/>
        </g>

        <!-- Beine -->
        ${leg(30,70)}${leg(54,72)}${leg(84,70)}${leg(106,72)}
        <!-- Hufe -->
        ${hoof(26,96)}${hoof(50,98)}${hoof(80,96)}${hoof(102,98)}

        <!-- Schweif -->
        <path d="M14,50 C-2,58 4,80 18,88" stroke="rgba(255,255,255,.78)" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="18" cy="90" r="6" fill="rgba(30,30,30,.72)"/>
        <!-- Geschirr -->
        <path d="M28,52 C48,70 102,70 118,52" stroke="rgba(200,40,50,.75)" stroke-width="6" fill="none" stroke-linecap="round"/>
      </g>
    `;
  }
  function leg(x,y){
    return `<rect x="${x}" y="${y}" width="12" height="28" rx="6" fill="rgba(255,255,255,.86)" stroke="rgba(0,0,0,.22)" stroke-width="2"/>`;
  }
  function hoof(x,y){
    return `<rect x="${x}" y="${y}" width="18" height="10" rx="5" fill="rgba(30,30,30,.78)"/>`;
  }

  function santa(x,y, s=1){
    return `
      <g class="santa" transform="translate(${x} ${y}) scale(${s})">
        <!-- Körper -->
        <path d="M40,160 C20,132 22,94 44,70 C60,52 96,48 116,66
                 C140,88 144,126 122,156 C112,170 92,180 72,178
                 C58,176 48,170 40,160 Z"
              fill="rgba(200,30,40,.95)" stroke="rgba(255,255,255,.20)" stroke-width="2"/>
        <!-- Fellrand -->
        <path d="M44,78 C66,58 96,58 118,78" stroke="rgba(255,255,255,.88)" stroke-width="10" stroke-linecap="round"/>
        <!-- Gürtel -->
        <rect x="48" y="122" width="78" height="18" rx="9" fill="rgba(30,30,30,.75)"/>
        <rect x="82" y="124" width="20" height="14" rx="4" fill="rgba(215,180,60,.95)"/>
        <rect x="86" y="127" width="12" height="8" rx="2" fill="rgba(30,30,30,.65)"/>

        <!-- Kopf -->
        <g transform="translate(58 18)">
          <ellipse cx="40" cy="46" rx="34" ry="30" fill="rgba(255,220,190,.98)" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
          <!-- Bart -->
          <path d="M12,54 C18,86 62,96 80,62 C86,84 66,108 44,104
                   C20,100 6,78 12,54 Z"
                fill="rgba(255,255,255,.92)" stroke="rgba(0,0,0,.10)" stroke-width="2"/>
          <!-- Schnurrbart -->
          <path d="M24,56 C32,48 40,48 48,56" stroke="rgba(255,255,255,.95)" stroke-width="10" stroke-linecap="round"/>
          <path d="M48,56 C56,48 64,48 72,56" stroke="rgba(255,255,255,.95)" stroke-width="10" stroke-linecap="round"/>
          <!-- Nase -->
          <circle cx="48" cy="52" r="6" fill="rgba(255,170,160,.95)" opacity=".95"/>
          <!-- Augen -->
          <circle cx="34" cy="42" r="3.2" fill="rgba(0,0,0,.70)"/>
          <circle cx="56" cy="42" r="3.2" fill="rgba(0,0,0,.70)"/>
          <circle cx="33" cy="41" r="1.1" fill="rgba(255,255,255,.85)"/>
          <circle cx="55" cy="41" r="1.1" fill="rgba(255,255,255,.85)"/>

          <!-- Mütze -->
          <path d="M14,34 C20,10 56,2 74,18 C86,28 88,46 80,56
                   C72,66 56,62 50,56 C42,50 32,52 24,50
                   C16,48 12,42 14,34 Z"
                fill="rgba(200,30,40,.95)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
          <path d="M18,34 C34,26 56,26 74,38" stroke="rgba(255,255,255,.92)" stroke-width="10" stroke-linecap="round"/>
          <circle cx="82" cy="56" r="10" fill="rgba(255,255,255,.92)" stroke="rgba(0,0,0,.08)" stroke-width="2"/>
        </g>

        <!-- Arm winkt -->
        <g class="santa-arm" transform="translate(120 92)">
          <path d="M0,16 C18,8 34,20 40,38 C46,56 28,72 12,64
                   C-2,56 -6,26 0,16 Z"
                fill="rgba(200,30,40,.92)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
          <circle cx="14" cy="62" r="12" fill="rgba(255,255,255,.90)" stroke="rgba(0,0,0,.10)" stroke-width="2"/>
        </g>
      </g>
    `;
  }

  function treeSVG(){
    const inner = `
      <rect x="0" y="0" width="980" height="520" fill="rgba(0,0,0,0)"/>
      <g transform="translate(0 0)">
        <ellipse cx="490" cy="440" rx="330" ry="90" fill="rgba(255,255,255,.06)"/>
        <g filter="url(#softShadow)">
          <!-- Stamm -->
          <rect x="455" y="360" width="70" height="85" rx="16" fill="url(#wood)" opacity=".95"/>
          <rect x="462" y="368" width="56" height="70" rx="14" fill="rgba(0,0,0,.18)" opacity=".25"/>

          <!-- Baum-Layer (mehrere Etagen für klaren Baum-Look) -->
          ${treeLayer(490, 120, 380, 150)}
          ${treeLayer(490, 170, 420, 170)}
          ${treeLayer(490, 230, 460, 190)}
          ${treeLayer(490, 300, 520, 210)}

          <!-- Lichterkette -->
          <path d="M290,200 C370,230 420,210 490,240 C560,270 610,250 700,290"
                stroke="rgba(255,220,120,.75)" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M260,270 C360,300 420,280 490,310 C560,340 630,320 740,355"
                stroke="rgba(255,220,120,.65)" stroke-width="5" fill="none" stroke-linecap="round"/>

          <!-- Kugeln -->
          ${orn(360,230)}${orn(620,260)}${orn(420,320)}${orn(560,345)}${orn(490,220)}
          ${orn(330,315)}${orn(650,330)}${orn(470,285)}

          <!-- Stern -->
          <g transform="translate(490 78)">
            <circle r="38" fill="url(#glow)"/>
            <path d="M0,-28 L8,-6 L28,-6 L12,6 L18,26 L0,14 L-18,26 L-12,6 L-28,-6 L-8,-6 Z"
                  fill="rgba(255,230,120,.95)" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
          </g>
        </g>

        <!-- Funkeln -->
        <g id="tree-sparkles" opacity=".7">
          ${sparkles(60)}
        </g>
      </g>
    `;
    return svgWrap(inner);
  }

  function treeLayer(cx, y, w, h){
    const x1 = cx - w/2;
    const x2 = cx + w/2;
    return `
      <path d="M${cx},${y} L${x1},${y+h} Q${cx},${y+h-22} ${x2},${y+h} Z"
            fill="rgba(20,130,70,.92)" stroke="rgba(255,255,255,.10)" stroke-width="2"/>
      <path d="M${cx},${y+10} L${x1+26},${y+h-10} Q${cx},${y+h-28} ${x2-26},${y+h-10} Z"
            fill="rgba(10,95,55,.35)"/>
    `;
  }

  function orn(x,y){
    return `
      <g transform="translate(${x} ${y})">
        <circle r="12" fill="rgba(255,80,110,.88)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
        <circle cx="-4" cy="-4" r="3" fill="rgba(255,255,255,.70)"/>
        <path d="M0,-16 L0,-22" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>
      </g>
    `;
  }

  function sparkles(n){
    let s = '';
    for(let i=0;i<n;i++){
      const x = Math.random()*980;
      const y = Math.random()*520;
      const r = 0.8 + Math.random()*2.2;
      const o = 0.25 + Math.random()*0.55;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="rgba(255,255,255,${o.toFixed(2)})"/>`;
      if(Math.random()<0.25){
        s += `<path d="M${(x-6).toFixed(1)},${y.toFixed(1)} L${(x+6).toFixed(1)},${y.toFixed(1)}"
                   stroke="rgba(255,255,255,${(o*0.75).toFixed(2)})" stroke-width="1.2" stroke-linecap="round"/>`;
      }
    }
    return s;
  }

  function santaSoloSVG(){
    const inner = `
      <rect x="0" y="0" width="980" height="520" fill="rgba(0,0,0,0)"/>
      <g transform="translate(260 70)">
        ${santa(140, 0, 1.35)}
        <!-- kleine Schnee-Wolke unten -->
        <g opacity=".9">
          <ellipse cx="220" cy="420" rx="260" ry="70" fill="rgba(255,255,255,.10)"/>
          <ellipse cx="200" cy="440" rx="280" ry="80" fill="rgba(255,255,255,.06)"/>
        </g>
      </g>
    `;
    return svgWrap(inner);
  }

  window.ART = {
    sledSceneSVG,
    treeSVG,
    santaSoloSVG
  };
})();
