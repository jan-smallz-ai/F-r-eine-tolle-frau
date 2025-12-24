// scene_art.js
// Liefert "klar gezeichnet aber erkennbar" SVG-Artworks + kleine Animations-Hooks.

(function(){
  function svgSleighScene(){
    return `
<svg viewBox="0 0 1200 650" width="100%" height="100%" aria-label="Weihnachtsmann im Schlitten mit Kühen">
  <defs>
    <linearGradient id="sleighRed" x1="0" x2="1">
      <stop offset="0" stop-color="#b11b2b"/>
      <stop offset="1" stop-color="#e63c4d"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" x2="1">
      <stop offset="0" stop-color="#cfe8ff" stop-opacity=".95"/>
      <stop offset=".55" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#9bc6ff" stop-opacity=".85"/>
    </linearGradient>
    <linearGradient id="fur" x1="0" x2="1">
      <stop offset="0" stop-color="#fff7e6"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".35"/>
    </filter>

    <!-- subtle sparkle -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- ground snow -->
  <path d="M0,520 C180,510 260,560 420,540 C540,520 640,560 760,540 C910,515 1010,560 1200,540 L1200,650 L0,650 Z"
        fill="rgba(255,255,255,.78)"/>
  <path d="M0,560 C220,535 340,590 520,565 C700,540 820,595 980,568 C1080,550 1140,585 1200,570"
        fill="rgba(255,255,255,.55)"/>

  <!-- cows harness line -->
  <path id="towLine" d="M520,390 C420,375 300,385 220,410"
        stroke="rgba(255,211,122,.75)" stroke-width="8" fill="none" stroke-linecap="round" filter="url(#glow)"/>

  <!-- cows group -->
  <g id="cows" transform="translate(80,240)" filter="url(#shadow)">
    ${cow(0, 0, 1.05)}
    ${cow(210, 40, 0.95)}
    <!-- little bells -->
    <g opacity=".95">
      <circle cx="130" cy="210" r="10" fill="#ffd37a"/>
      <circle cx="350" cy="250" r="10" fill="#ffd37a"/>
      <path d="M120,220 q10,14 20,0" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3" stroke-linecap="round"/>
      <path d="M340,260 q10,14 20,0" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3" stroke-linecap="round"/>
    </g>
  </g>

  <!-- sleigh group -->
  <g id="sleigh" transform="translate(420,160)" filter="url(#shadow)">
    <!-- sled runners -->
    <path d="M80,420 C120,470 220,480 330,452 C390,438 470,442 520,465"
          fill="none" stroke="url(#metal)" stroke-width="16" stroke-linecap="round"/>
    <path d="M95,415 C140,455 228,460 330,435 C400,418 465,418 520,438"
          fill="none" stroke="rgba(20,30,55,.35)" stroke-width="4" stroke-linecap="round" opacity=".55"/>

    <!-- sleigh body -->
    <path d="M110,220
             C120,170 170,140 230,140
             L410,140
             C470,140 520,170 530,220
             L555,355
             C560,390 535,410 500,410
             L165,410
             C130,410 105,390 110,355 Z"
          fill="url(#sleighRed)" stroke="rgba(255,255,255,.25)" stroke-width="4"/>

    <!-- golden trim -->
    <path d="M142,200 C160,170 190,155 230,155 L410,155 C452,155 482,170 498,200"
          fill="none" stroke="rgba(255,211,122,.85)" stroke-width="8" stroke-linecap="round"/>

    <!-- sack of gifts -->
    <g id="sack" transform="translate(330,130)">
      <path d="M40,70 C10,40 25,10 65,10 C110,10 120,45 95,70
               C120,86 122,130 95,155 C70,178 30,175 14,145
               C-5,110 5,82 40,70 Z"
            fill="#a65b2a" stroke="rgba(0,0,0,.25)" stroke-width="4"/>
      <path d="M42,60 C50,44 72,44 82,60" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="4" stroke-linecap="round"/>
      <circle cx="30" cy="125" r="10" fill="#ffd37a" opacity=".85"/>
      <rect x="82" y="105" width="24" height="18" rx="4" fill="#7ee7ff" opacity=".85"/>
    </g>

    <!-- Santa -->
    <g id="santa" transform="translate(165,90)">
      <!-- hat -->
      <path d="M95,40 C120,10 165,18 175,55 C150,55 130,62 115,78 C110,60 103,50 95,40 Z"
            fill="#c51f2f" stroke="rgba(0,0,0,.25)" stroke-width="4"/>
      <circle cx="178" cy="55" r="14" fill="url(#fur)" stroke="rgba(0,0,0,.18)" stroke-width="3"/>

      <!-- head -->
      <ellipse cx="115" cy="95" rx="44" ry="46" fill="#f2c6a6" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
      <!-- beard -->
      <path d="M78,110 C70,150 90,182 115,188 C140,182 160,150 152,110
               C145,130 132,140 115,140 C98,140 85,130 78,110 Z"
            fill="url(#fur)" stroke="rgba(0,0,0,.14)" stroke-width="4"/>
      <!-- moustache -->
      <path d="M90,125 C100,115 108,114 115,118 C122,114 130,115 140,125"
            fill="none" stroke="rgba(255,255,255,.9)" stroke-width="10" stroke-linecap="round"/>

      <!-- face details -->
      <circle cx="100" cy="92" r="6" fill="#1d2a44"/>
      <circle cx="132" cy="92" r="6" fill="#1d2a44"/>
      <path d="M108,100 q7,6 14,0" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4" stroke-linecap="round"/>
      <path d="M102,108 q13,16 26,0" fill="none" stroke="rgba(180,30,60,.55)" stroke-width="5" stroke-linecap="round"/>

      <!-- body -->
      <path d="M65,205 C70,165 85,145 115,145 C145,145 160,165 165,205
               L170,285 C172,320 152,340 115,342 C78,340 58,320 60,285 Z"
            fill="#c51f2f" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
      <!-- fur trim -->
      <path d="M70,215 L160,215" stroke="rgba(255,255,255,.9)" stroke-width="14" stroke-linecap="round" opacity=".95"/>
      <!-- belt -->
      <rect x="72" y="248" width="86" height="22" rx="10" fill="#1b1b26" opacity=".95"/>
      <rect x="110" y="246" width="26" height="26" rx="6" fill="#ffd37a" opacity=".95"/>
      <rect x="118" y="252" width="10" height="14" rx="4" fill="#1b1b26" opacity=".95"/>

      <!-- arm waving -->
      <g id="waveArm" transform="translate(165,205)">
        <path d="M0,0 C20,-18 40,-18 58,0 C45,15 30,22 12,22 Z"
              fill="#c51f2f" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
        <circle cx="62" cy="6" r="14" fill="#f2c6a6" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
        <path d="M55,0 q10,8 14,0" fill="none" stroke="rgba(0,0,0,.30)" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>

    <!-- front nose / curve -->
    <path d="M530,230 C570,260 585,315 560,360" fill="none" stroke="rgba(255,211,122,.75)" stroke-width="10" stroke-linecap="round"/>
  </g>

  <!-- subtle motion lines -->
  <g opacity=".25">
    <path d="M640,150 q40,20 60,60" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M670,170 q30,16 45,45" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>

</svg>`;
  }

  function cow(x, y, s){
    // Erkennbar Kuh: Körperflecken, Hörner, Schnauze, Beine, Schwanz
    return `
<g class="cow" transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="120" cy="190" rx="108" ry="70" fill="#ffffff" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
  <!-- spots -->
  <path d="M70,170 q30,-35 55,5 q-18,35 -55,15 Z" fill="#2a2a33" opacity=".9"/>
  <path d="M155,205 q28,-22 52,8 q-10,32 -52,18 Z" fill="#2a2a33" opacity=".85"/>

  <!-- head -->
  <g transform="translate(180,148)">
    <ellipse cx="40" cy="45" rx="44" ry="38" fill="#ffffff" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
    <!-- muzzle -->
    <ellipse cx="46" cy="60" rx="36" ry="26" fill="#f2b9c0" stroke="rgba(0,0,0,.12)" stroke-width="4"/>
    <circle cx="34" cy="58" r="4" fill="#1b1b26"/>
    <circle cx="54" cy="58" r="4" fill="#1b1b26"/>

    <!-- eyes -->
    <circle cx="28" cy="40" r="5.2" fill="#1b1b26"/>
    <circle cx="55" cy="40" r="5.2" fill="#1b1b26"/>
    <path d="M24,33 q4,-8 12,-2" stroke="rgba(0,0,0,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M50,33 q4,-8 12,-2" stroke="rgba(0,0,0,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>

    <!-- horns -->
    <path d="M16,26 q-18,-12 -10,-30 q22,6 22,24" fill="#d9d2c4" stroke="rgba(0,0,0,.16)" stroke-width="4"/>
    <path d="M64,26 q18,-12 10,-30 q-22,6 -22,24" fill="#d9d2c4" stroke="rgba(0,0,0,.16)" stroke-width="4"/>

    <!-- ear -->
    <ellipse cx="10" cy="48" rx="16" ry="12" fill="#ffffff" stroke="rgba(0,0,0,.14)" stroke-width="4"/>
  </g>

  <!-- legs -->
  <g fill="#ffffff" stroke="rgba(0,0,0,.18)" stroke-width="4">
    <rect x="52" y="232" width="22" height="56" rx="10"/>
    <rect x="96" y="240" width="22" height="52" rx="10"/>
    <rect x="136" y="240" width="22" height="52" rx="10"/>
    <rect x="176" y="232" width="22" height="56" rx="10"/>
  </g>
  <!-- hooves -->
  <g fill="#2a2a33" opacity=".9">
    <rect x="50" y="282" width="26" height="10" rx="5"/>
    <rect x="94" y="286" width="26" height="10" rx="5"/>
    <rect x="134" y="286" width="26" height="10" rx="5"/>
    <rect x="174" y="282" width="26" height="10" rx="5"/>
  </g>

  <!-- tail -->
  <path d="M20,194 q-24,24 -8,62" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="5" stroke-linecap="round"/>
  <circle cx="14" cy="266" r="9" fill="#2a2a33" opacity=".85"/>

  <!-- harness strap -->
  <path d="M40,210 C80,190 140,185 204,206" fill="none" stroke="rgba(255,211,122,.65)" stroke-width="8" stroke-linecap="round"/>
</g>`;
  }

  function svgTreeFinal(){
    // Erkennbarer Tannenbaum: Stufen/Etagen, Stamm, Kugeln, Lichterkette, Stern, Glitzer
    return `
<svg viewBox="0 0 700 820" width="100%" height="100%" aria-label="Tannenbaum mit Lichtern">
  <defs>
    <linearGradient id="treeG" x1="0" x2="1">
      <stop offset="0" stop-color="#0f5c3a"/>
      <stop offset="1" stop-color="#1a9b62"/>
    </linearGradient>
    <linearGradient id="treeShade" x1="0" x2="1">
      <stop offset="0" stop-color="rgba(0,0,0,.20)"/>
      <stop offset="1" stop-color="rgba(255,255,255,.10)"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="drop">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".35"/>
    </filter>
  </defs>

  <!-- snowy base -->
  <path d="M30,720 C140,690 210,760 350,736 C510,708 560,770 670,736 L670,820 L30,820 Z"
        fill="rgba(255,255,255,.75)"/>
  <path d="M60,748 C160,728 228,790 350,772 C492,750 540,796 640,772"
        fill="rgba(255,255,255,.55)"/>

  <!-- star -->
  <g id="star" transform="translate(350,110)" filter="url(#softGlow)">
    <path d="M0,-68 L18,-20 L68,-18 L28,10 L40,58 L0,32 L-40,58 L-28,10 L-68,-18 L-18,-20 Z"
          fill="#ffd37a" stroke="rgba(255,255,255,.35)" stroke-width="4"/>
    <circle cx="0" cy="0" r="6" fill="rgba(255,255,255,.9)"/>
  </g>

  <!-- trunk -->
  <g filter="url(#drop)">
    <rect x="308" y="600" width="84" height="120" rx="18" fill="#7a4b2b" stroke="rgba(0,0,0,.18)" stroke-width="6"/>
    <path d="M314,610 h72" stroke="rgba(255,255,255,.18)" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- tree layers -->
  <g id="tree" filter="url(#drop)">
    ${layer(350, 560, 520, 170)}
    ${layer(350, 500, 480, 160)}
    ${layer(350, 440, 430, 150)}
    ${layer(350, 380, 380, 140)}
    ${layer(350, 320, 320, 130)}
    ${layer(350, 260, 260, 120)}
    ${layer(350, 205, 210, 110)}
  </g>

  <!-- garland lights path -->
  <path id="garland" d="M160,330 C260,390 440,290 540,360
                        C430,430 250,360 160,430
                        C270,510 440,430 560,510"
        fill="none" stroke="rgba(255,211,122,.55)" stroke-width="10" stroke-linecap="round" filter="url(#softGlow)"/>

  <!-- bulbs -->
  <g id="bulbs" filter="url(#softGlow)">
    ${bulb(230,360,"#ff6b6b")}
    ${bulb(310,330,"#7ee7ff")}
    ${bulb(420,350,"#ffd37a")}
    ${bulb(500,390,"#c7ff9a")}
    ${bulb(220,440,"#ffd37a")}
    ${bulb(340,460,"#ff6b6b")}
    ${bulb(460,470,"#7ee7ff")}
    ${bulb(540,520,"#ffd37a")}
    ${bulb(260,520,"#c7ff9a")}
    ${bulb(380,530,"#ffd37a")}
  </g>

  <!-- ornaments -->
  <g id="ornaments">
    ${orn(265,410,"#ff6b6b")}
    ${orn(470,430,"#ffd37a")}
    ${orn(340,410,"#7ee7ff")}
    ${orn(420,520,"#ff6b6b")}
    ${orn(290,560,"#ffd37a")}
    ${orn(505,560,"#7ee7ff")}
  </g>

  <!-- sparkles -->
  <g id="sparkles" filter="url(#softGlow)" opacity=".9">
    ${spark(170,270)}
    ${spark(520,260)}
    ${spark(590,420)}
    ${spark(120,470)}
    ${spark(470,610)}
    ${spark(240,610)}
  </g>
</svg>`;
  }

  function layer(cx, cy, w, h){
    const x1 = cx - w/2;
    const x2 = cx + w/2;
    const tipY = cy - h;
    return `
<path d="M${cx},${tipY}
         C${cx-40},${tipY+30} ${x1+40},${cy-20} ${x1},${cy}
         C${x1+60},${cy-10} ${x1+80},${cy+35} ${x1+140},${cy+35}
         C${cx-40},${cy+65} ${cx+40},${cy+65} ${x2-140},${cy+35}
         C${x2-80},${cy+35} ${x2-60},${cy-10} ${x2},${cy}
         C${x2-40},${cy-20} ${cx+40},${tipY+30} ${cx},${tipY} Z"
      fill="url(#treeG)" stroke="rgba(255,255,255,.14)" stroke-width="6"/>
<path d="M${cx},${tipY}
         C${cx-40},${tipY+30} ${x1+40},${cy-20} ${x1},${cy}"
      fill="none" stroke="rgba(0,0,0,.18)" stroke-width="10" opacity=".25"/>
<path d="M${cx},${tipY}
         C${cx+40},${tipY+30} ${x2-40},${cy-20} ${x2},${cy}"
      fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10" opacity=".18"/>
`;
  }

  function bulb(x,y,color){
    return `
<g class="bulb" transform="translate(${x},${y})">
  <circle cx="0" cy="0" r="10" fill="${color}" opacity=".95"/>
  <circle cx="-3" cy="-3" r="3.5" fill="rgba(255,255,255,.85)"/>
  <rect x="-5" y="-16" width="10" height="6" rx="2" fill="rgba(0,0,0,.35)"/>
</g>`;
  }
  function orn(x,y,color){
    return `
<g transform="translate(${x},${y})">
  <circle cx="0" cy="0" r="16" fill="${color}" opacity=".92" stroke="rgba(255,255,255,.25)" stroke-width="4"/>
  <circle cx="-5" cy="-6" r="5" fill="rgba(255,255,255,.65)"/>
  <path d="M0,-18 v-14" stroke="rgba(255,211,122,.75)" stroke-width="5" stroke-linecap="round"/>
</g>`;
  }
  function spark(x,y){
    return `
<g class="spark" transform="translate(${x},${y})">
  <path d="M0,-14 L3,-3 L14,0 L3,3 L0,14 L-3,3 L-14,0 L-3,-3 Z"
        fill="rgba(255,255,255,.9)" opacity=".9"/>
</g>`;
  }

  window.SceneArt = {
    svgSleighScene,
    svgTreeFinal
  };
})();
