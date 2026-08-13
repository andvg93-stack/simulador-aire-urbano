(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const ratio = (value, min, max) => clamp((value - min) / (max - min), 0, 1);
  const fmt = (value, digits = 0) => Number(value).toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  const toneFor = value => value < 0.38 ? "good" : value < 0.68 ? "warn" : "bad";
  const categoryFor = (value, labels = ["Bajo", "Intermedio", "Alto"]) => value < 0.38 ? labels[0] : value < 0.68 ? labels[1] : labels[2];

  const palette = {
    ink: "#17202a",
    muted: "#5f6f7a",
    green: "#1b8a5a",
    greenLight: "#8fd0a9",
    blue: "#2563a8",
    sky: "#dceef4",
    teal: "#047a7a",
    yellow: "#f0c75e",
    orange: "#d9822b",
    red: "#be3a34",
    purple: "#7c4d9e",
    road: "#33434c",
    earth: "#8a6a45"
  };

  function svgFrame(label, content, background = "#edf8f2") {
    return `
      <svg viewBox="0 0 720 400" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8eef5"/><stop offset="1" stop-color="#f7fbf9"/></linearGradient>
          <linearGradient id="heat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f0c75e"/><stop offset="1" stop-color="#be3a34"/></linearGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#d9822b"/></marker>
        </defs>
        <rect width="720" height="400" fill="${background}"/>
        ${content}
      </svg>`;
  }

  function deterministicDots(count, options = {}) {
    const { x = 40, y = 40, width = 300, height = 190, color = palette.red, minRadius = 2, maxRadius = 5, opacity = 0.72 } = options;
    let markup = "";
    for (let i = 0; i < count; i += 1) {
      const cx = x + ((i * 73 + 19) % width);
      const cy = y + ((i * 47 + 13) % height);
      const r = minRadius + ((i * 3) % Math.max(1, maxRadius - minRadius + 1));
      markup += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
    }
    return markup;
  }

  function buildings(baseY = 310) {
    const data = [[28, 82, 92], [126, 118, 118], [252, 76, 82], [342, 146, 104], [458, 98, 88], [554, 132, 116]];
    return data.map(([x, h, w], index) => `
      <g>
        <rect x="${x}" y="${baseY - h}" width="${w}" height="${h}" rx="4" fill="${index % 2 ? "#6e8793" : "#849ba5"}"/>
        ${[0, 1, 2].map(row => [0, 1].map(col => `<rect x="${x + 16 + col * 32}" y="${baseY - h + 18 + row * 28}" width="12" height="12" rx="2" fill="#dceef4" opacity=".82"/>`).join("")).join("")}
      </g>`).join("");
  }

  function car(x, y, color = palette.red, scale = 1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="0" y="8" width="58" height="23" rx="6" fill="${color}"/><path d="M11 8 20 0h23l9 8" fill="${color}"/><circle cx="14" cy="32" r="6" fill="#17202a"/><circle cx="46" cy="32" r="6" fill="#17202a"/></g>`;
  }

  function tree(x, y, scale = 1) {
    return `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="-5" y="0" width="10" height="42" rx="4" fill="#7c5c3d"/><circle cx="0" cy="-10" r="28" fill="#3b9b66"/><circle cx="-18" cy="2" r="18" fill="#55ad79"/><circle cx="17" cy="4" r="19" fill="#2f8757"/></g>`;
  }

  function sourceFactory() {
    return `<g transform="translate(50 182)"><rect x="0" y="62" width="128" height="75" rx="5" fill="#728a96"/><rect x="18" y="4" width="28" height="70" rx="3" fill="#506773"/><path d="M67 62v-32l28 18 28-18v32" fill="#879ca5"/><text x="64" y="112" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">FUENTE</text></g>`;
  }

  function pmScene(level, kind) {
    const fine = kind === "pm25";
    const count = Math.round(8 + level * 28);
    const particleColor = fine ? palette.red : palette.orange;
    const particles = deterministicDots(count, { x: 150, y: 70, width: 350, height: 210, color: particleColor, minRadius: fine ? 2 : 5, maxRadius: fine ? 4 : 9, opacity: 0.72 });
    const lungDots = deterministicDots(Math.round(3 + level * 12), { x: 552, y: fine ? 188 : 142, width: 72, height: fine ? 95 : 62, color: particleColor, minRadius: fine ? 2 : 4, maxRadius: fine ? 3 : 7, opacity: 0.82 });
    return {
      svg: svgFrame(`${fine ? "Partículas PM2.5" : "Partículas PM10"} desplazándose desde fuentes urbanas hacia el sistema respiratorio`, `
        <rect width="720" height="286" fill="url(#sky)"/>
        ${sourceFactory()}
        <path d="M160 166 C300 86 430 104 535 165" fill="none" stroke="${particleColor}" stroke-width="3" stroke-dasharray="7 10" opacity=".45"/>
        ${particles}
        <g transform="translate(520 38)">
          <circle cx="85" cy="52" r="42" fill="#e2b39e"/>
          <path d="M56 91c-22 35-34 84-34 157h126c0-74-12-122-35-157" fill="#f2d5c8"/>
          <path d="M85 90v46m0 0-30 28m30-28 30 28" fill="none" stroke="#8b5f61" stroke-width="9" stroke-linecap="round"/>
          <path d="M80 146c-35-18-50 6-49 44 1 47 24 72 53 50z" fill="#f2a7a2" stroke="#a84d50" stroke-width="3"/>
          <path d="M91 146c35-18 50 6 49 44-1 47-24 72-53 50z" fill="#f2a7a2" stroke="#a84d50" stroke-width="3"/>
          ${lungDots}
        </g>
        <rect y="286" width="720" height="114" fill="#fff"/>
        <text x="30" y="321" font-size="13" font-weight="800" fill="${palette.muted}">ESCALA RELATIVA</text>
        <line x1="42" y1="356" x2="676" y2="356" stroke="#d7dee2" stroke-width="3"/>
        <circle cx="118" cy="356" r="26" fill="#b68b63"/><text x="118" y="361" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">70 µm</text>
        <circle cx="358" cy="356" r="${fine ? 8 : 15}" fill="${fine ? palette.orange : particleColor}"/><text x="358" y="389" text-anchor="middle" font-size="12" fill="${palette.ink}">PM10</text>
        <circle cx="600" cy="356" r="5" fill="${palette.red}"/><text x="600" y="389" text-anchor="middle" font-size="12" fill="${palette.ink}">PM2.5</text>
      `),
      legend: [
        { label: fine ? "Partícula fina" : "Partícula gruesa", color: particleColor },
        { label: "Trayectoria respiratoria", color: "#8b5f61" }
      ]
    };
  }

  function ozoneScene(level, nox, cov) {
    const intensity = clamp((level * 0.45) + (nox * 0.28) + (cov * 0.27), 0, 1);
    const cloudOpacity = 0.12 + intensity * 0.48;
    return {
      svg: svgFrame("Reacción entre NOx, COV y radiación solar que produce ozono troposférico", `
        <rect width="720" height="400" fill="url(#sky)"/>
        <circle cx="607" cy="72" r="48" fill="${palette.yellow}"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="607" y1="${12 + i * 10}" x2="${560 - i * 3}" y2="${138 + i * 5}" stroke="${palette.yellow}" stroke-width="3" opacity=".42"/>`).join("")}
        <g transform="translate(42 105)">
          <rect width="148" height="74" rx="18" fill="#e4eff9" stroke="#b7d1e9"/><text x="74" y="35" text-anchor="middle" font-size="22" font-weight="900" fill="${palette.blue}">NOx</text><text x="74" y="57" text-anchor="middle" font-size="12" fill="${palette.muted}">${nox < .5 ? "nivel bajo" : "nivel alto"}</text>
          <text x="178" y="47" font-size="28" font-weight="900" fill="${palette.ink}">+</text>
          <rect x="214" width="148" height="74" rx="18" fill="#eee6f4" stroke="#d5c3e1"/><text x="288" y="35" text-anchor="middle" font-size="22" font-weight="900" fill="${palette.purple}">COV</text><text x="288" y="57" text-anchor="middle" font-size="12" fill="${palette.muted}">${cov < .5 ? "nivel bajo" : "nivel alto"}</text>
          <text x="380" y="47" font-size="28" font-weight="900" fill="${palette.ink}">+</text>
          <rect x="416" width="148" height="74" rx="18" fill="#fff2c9" stroke="#efd88b"/><text x="490" y="35" text-anchor="middle" font-size="21" font-weight="900" fill="#8c6200">SOL</text><text x="490" y="57" text-anchor="middle" font-size="12" fill="${palette.muted}">${Math.round(level * 100)}%</text>
        </g>
        <path d="M190 226h340" stroke="${palette.orange}" stroke-width="5" stroke-linecap="round"/><path d="m530 226-22-14v28z" fill="${palette.orange}"/>
        <g transform="translate(252 255)"><ellipse cx="108" cy="54" rx="108" ry="54" fill="${palette.red}" opacity="${cloudOpacity}"/><text x="108" y="52" text-anchor="middle" font-size="30" font-weight="900" fill="${palette.red}">O₃</text><text x="108" y="76" text-anchor="middle" font-size="13" font-weight="700" fill="${palette.ink}">${categoryFor(intensity, ["formación baja", "formación media", "formación alta"])}</text></g>
      `, "#f7f3e8"),
      legend: [{ label: "Precursores", color: palette.purple }, { label: "Radiación", color: palette.yellow }, { label: "Ozono", color: palette.red }],
      intensity
    };
  }

  function covScene(level, extraction) {
    const effective = clamp(level * (extraction ? 0.38 : 1), 0, 1);
    const vapors = deterministicDots(Math.round(4 + effective * 22), { x: 104, y: 55, width: 485, height: 160, color: palette.purple, minRadius: 8, maxRadius: 18, opacity: 0.28 });
    return {
      svg: svgFrame("Taller con recipientes de solventes y sistema de extracción", `
        <rect width="720" height="400" fill="#efe7f4"/>
        <rect x="38" y="56" width="644" height="286" rx="18" fill="#fff" stroke="#ddcde6"/>
        <rect x="65" y="235" width="590" height="22" rx="8" fill="#7d6452"/>
        ${vapors}
        ${[110, 232, 354, 476].map((x, i) => `<g transform="translate(${x} 172)"><rect width="78" height="82" rx="8" fill="${["#7c4d9e", "#9b6bb8", "#674084", "#8e5ca9"][i]}"/><rect x="15" y="-10" width="48" height="15" rx="4" fill="#d9cfdf"/><text x="39" y="48" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">COV</text></g>`).join("")}
        <g transform="translate(565 70)"><rect width="72" height="52" rx="9" fill="${extraction ? palette.green : "#aeb9bf"}"/><circle cx="36" cy="26" r="17" fill="#fff" opacity=".8"/><path d="M36 11v30M21 26h30" stroke="${extraction ? palette.green : "#6d7c84"}" stroke-width="4"/><text x="36" y="72" text-anchor="middle" font-size="12" font-weight="800" fill="${palette.ink}">${extraction ? "Extracción" : "Sin control"}</text></g>
        <rect y="342" width="720" height="58" fill="#ded5ca"/><path d="M0 372h720" stroke="#c6b9aa" stroke-width="3"/>
      `, "#f4eef7"),
      legend: [{ label: "Vapor de COV", color: palette.purple }, { label: "Control activo", color: palette.green }],
      effective
    };
  }

  function temperatureScene(greenRatio) {
    const trees = Math.round(1 + greenRatio * 6);
    const temperature = 29 - greenRatio * 7;
    return {
      svg: svgFrame("Comparación entre una manzana asfaltada y otra con cobertura verde", `
        <rect width="720" height="300" fill="url(#sky)"/>
        <line x1="360" y1="24" x2="360" y2="374" stroke="#fff" stroke-width="6"/>
        <text x="180" y="38" text-anchor="middle" font-size="15" font-weight="900" fill="${palette.ink}">SUPERFICIE IMPERMEABLE</text>
        <text x="540" y="38" text-anchor="middle" font-size="15" font-weight="900" fill="${palette.ink}">COBERTURA VERDE</text>
        ${buildings(298)}
        <rect y="298" width="360" height="102" fill="#3c4144"/><rect x="360" y="298" width="360" height="102" fill="#88bd78"/>
        ${[80, 162, 244].map((x, i) => `<path d="M${x} 280c-18-46 18-62 0-104" fill="none" stroke="${palette.red}" stroke-width="5" opacity="${0.3 + (1 - greenRatio) * .5}"/>`).join("")}
        ${Array.from({ length: trees }, (_, i) => tree(402 + (i % 4) * 80, 286 - Math.floor(i / 4) * 64, i > 3 ? .65 : .88)).join("")}
        <g transform="translate(22 66)"><rect width="62" height="174" rx="31" fill="#fff" opacity=".9"/><rect x="25" y="35" width="12" height="105" rx="6" fill="url(#heat)"/><circle cx="31" cy="144" r="18" fill="${palette.red}"/><text x="31" y="22" text-anchor="middle" font-size="12" font-weight="900" fill="${palette.ink}">${temperature.toFixed(1)}°</text></g>
      `, "#f8f1ec"),
      legend: [{ label: "Acumulación de calor", color: palette.red }, { label: "Sombra y evapotranspiración", color: palette.green }],
      temperature
    };
  }

  function windScene(windRatio) {
    const plumeLength = 90 + windRatio * 300;
    const plumeHeight = 72 - windRatio * 45;
    const arrows = Array.from({ length: Math.round(3 + windRatio * 5) }, (_, i) => {
      const y = 62 + i * 33;
      const length = 65 + windRatio * 115;
      return `<g opacity="${0.46 + windRatio * .45}"><line x1="${200 + (i % 2) * 42}" y1="${y}" x2="${200 + (i % 2) * 42 + length}" y2="${y}" stroke="${palette.teal}" stroke-width="7" stroke-linecap="round"/><path d="M${200 + (i % 2) * 42 + length} ${y}l-17-11v22z" fill="${palette.teal}"/></g>`;
    }).join("");
    return {
      svg: svgFrame("Viento transportando y diluyendo una pluma de contaminantes sobre la ciudad", `
        <rect width="720" height="310" fill="url(#sky)"/>
        ${sourceFactory()}
        <path d="M92 196 C${180 + plumeLength * .2} ${168 - plumeHeight}, ${210 + plumeLength * .7} ${185 - plumeHeight}, ${92 + plumeLength} ${184 - plumeHeight / 2}" fill="none" stroke="#687b84" stroke-width="${34 - windRatio * 23}" stroke-linecap="round" opacity="${.5 - windRatio * .24}"/>
        ${arrows}
        ${buildings(310)}
        <rect y="310" width="720" height="90" fill="#86aa7a"/>
        <text x="36" y="378" font-size="14" font-weight="900" fill="#fff">La emisión permanece; cambia su concentración local.</text>
      `, "#edf7f8"),
      legend: [{ label: "Flujo de aire", color: palette.teal }, { label: "Pluma contaminante", color: "#687b84" }]
    };
  }

  function mixingScene(mixRatio, windRatio = 0.2, combined = false) {
    const top = 238 - mixRatio * 180;
    const count = 28;
    let particles = "";
    for (let i = 0; i < count; i += 1) {
      const x = 56 + ((i * 83) % 610);
      const y = top + 26 + ((i * 47) % Math.max(32, 278 - top));
      particles += `<circle cx="${x}" cy="${y}" r="4" fill="${palette.red}" opacity="${.62 - mixRatio * .25}"/>`;
    }
    const arrows = combined ? Array.from({ length: 4 }, (_, i) => {
      const len = 45 + windRatio * 130;
      const y = 86 + i * 42;
      return `<line x1="80" y1="${y}" x2="${80 + len}" y2="${y}" stroke="${palette.teal}" stroke-width="6" stroke-linecap="round"/><path d="M${80 + len} ${y}l-15-9v18z" fill="${palette.teal}"/>`;
    }).join("") : "";
    return {
      svg: svgFrame(`${combined ? "Índice de ventilación" : "Altura de mezcla"} sobre una ciudad`, `
        <rect width="720" height="320" fill="url(#sky)"/>
        <rect x="0" y="${top}" width="720" height="${320 - top}" fill="${palette.blue}" opacity=".12"/>
        <line x1="0" y1="${top}" x2="720" y2="${top}" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="14 9"/>
        <rect x="568" y="${top - 18}" width="126" height="34" rx="17" fill="#fff"/><text x="631" y="${top + 5}" text-anchor="middle" font-size="12" font-weight="900" fill="${palette.blue}">${Math.round(70 + mixRatio * 150)} m</text>
        ${particles}${arrows}${buildings(320)}
        <rect y="320" width="720" height="80" fill="#7fa071"/>
        <text x="28" y="372" font-size="13" font-weight="900" fill="#fff">Misma emisión · diferente volumen disponible</text>
      `, "#eef5f6"),
      legend: [{ label: "Capa de mezcla", color: palette.blue }, { label: "Contaminantes", color: palette.red }, ...(combined ? [{ label: "Viento", color: palette.teal }] : [])]
    };
  }

  function stagnationScene(level) {
    const haze = 0.08 + level * .42;
    const top = 78 + level * 82;
    return {
      svg: svgFrame("Contaminación acumulándose bajo una inversión durante un episodio de estancamiento", `
        <rect width="720" height="310" fill="url(#sky)"/>
        <rect y="${top}" width="720" height="${310 - top}" fill="${palette.red}" opacity="${haze}"/>
        ${deterministicDots(Math.round(8 + level * 32), { x: 35, y: top + 22, width: 650, height: Math.max(38, 270 - top), color: palette.red, minRadius: 3, maxRadius: 7, opacity: .42 })}
        <line x1="0" y1="${top}" x2="720" y2="${top}" stroke="${palette.orange}" stroke-width="6"/>
        <rect x="500" y="${top - 40}" width="185" height="32" rx="16" fill="#fff"/><text x="592" y="${top - 18}" text-anchor="middle" font-size="12" font-weight="900" fill="${palette.orange}">Inversión térmica</text>
        ${buildings(310)}
        <rect y="310" width="720" height="90" fill="#fff"/>
        ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${45 + i * 132} 334)"><rect width="100" height="24" rx="12" fill="${i / 4 <= level ? palette.red : "#dfe7e3"}" opacity="${i / 4 <= level ? .35 + i * .1 : 1}"/><text x="50" y="52" text-anchor="middle" font-size="11" fill="${palette.muted}">${i * 6} h</text></g>`).join("")}
      `, "#eef1ee"),
      legend: [{ label: "Capa de inversión", color: palette.orange }, { label: "Acumulación", color: palette.red }]
    };
  }

  function exposureScene(distanceRatio, exposedRatio) {
    const safe = Math.round(8 + distanceRatio * 18);
    const risk = Math.round(30 * exposedRatio);
    const people = [];
    for (let i = 0; i < risk + safe; i += 1) {
      const isRisk = i < risk;
      const side = i % 4;
      const offset = isRisk ? 35 + ((i * 17) % 70) : 125 + distanceRatio * 45 + ((i * 23) % 75);
      const x = side < 2 ? 360 + (side === 0 ? -offset : offset) : 90 + ((i * 71) % 540);
      const y = side < 2 ? 70 + ((i * 49) % 250) : 200 + (side === 2 ? -offset * .45 : offset * .45);
      people.push(`<circle cx="${clamp(x, 28, 692)}" cy="${clamp(y, 28, 372)}" r="7" fill="${isRisk ? palette.red : palette.green}" stroke="#fff" stroke-width="2"/>`);
    }
    return {
      svg: svgFrame("Mapa con vías, franja de influencia y población expuesta", `
        <rect width="720" height="400" fill="#dfe9dc"/>
        <rect x="305" width="110" height="400" fill="${palette.red}" opacity=".09"/>
        <rect y="145" width="720" height="110" fill="${palette.red}" opacity=".09"/>
        <rect x="338" width="44" height="400" fill="${palette.road}"/>
        <rect y="178" width="720" height="44" fill="${palette.road}"/>
        <line x1="360" y1="0" x2="360" y2="400" stroke="#f6df76" stroke-width="3" stroke-dasharray="15 13"/>
        <line x1="0" y1="200" x2="720" y2="200" stroke="#f6df76" stroke-width="3" stroke-dasharray="15 13"/>
        ${[[70, 58], [520, 52], [74, 292], [520, 294]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect width="125" height="76" rx="8" fill="${i % 2 ? "#f1d2a8" : "#f4e0c0"}" stroke="#caa980"/><path d="M-8 4 62-28 133 4" fill="#a8624d"/><rect x="48" y="34" width="28" height="42" fill="#9b684f"/></g>`).join("")}
        ${people.join("")}
        <rect x="18" y="15" width="196" height="39" rx="19" fill="#fff" opacity=".92"/><rect x="34" y="28" width="32" height="13" rx="6" fill="${palette.red}" opacity=".22"/><text x="76" y="40" font-size="12" font-weight="900" fill="${palette.ink}">Franja de mayor influencia</text>
      `, "#f1f5ef"),
      legend: [{ label: "Población expuesta", color: palette.red }, { label: "Fuera de la franja", color: palette.green }]
    };
  }

  const info = {
    pm25: [
      { icon: "🔥", title: "Fuentes", text: "Combustión vehicular, industria, incendios y formación secundaria." },
      { icon: "🫁", title: "Efectos", text: "Puede alcanzar regiones profundas del pulmón y aumentar el riesgo cardiovascular." },
      { icon: "🛡️", title: "Acciones", text: "Electrificación, filtros, menor combustión y reducción de la exposición." }
    ],
    pm10: [
      { icon: "🏗️", title: "Fuentes", text: "Polvo resuspendido, obras, vías sin pavimentar y desgaste mecánico." },
      { icon: "👃", title: "Efectos", text: "Irrita vías respiratorias y puede agravar enfermedades preexistentes." },
      { icon: "💧", title: "Acciones", text: "Humectación, cubrimiento de cargas, limpieza y pavimentación." }
    ]
  };

  const resources = {
    pm25: {
      title: "PM2.5", eyebrow: "Material particulado fino", mark: "2.5", accent: "#be3a34", tint: "#f9efee",
      lead: "Partículas menores a 2,5 micrómetros que pueden penetrar profundamente en los pulmones y alcanzar el torrente sanguíneo.",
      primary: { id: "concentration", label: "Concentración de PM2.5", min: 5, max: 80, step: .1, value: 35, unit: "µg/m³", low: "5", high: "80", digits: 1 },
      compute: s => { const r = ratio(s.concentration, 5, 80); return { value: s.concentration, digits: 1, unit: "µg/m³", category: categoryFor(r), tone: toneFor(r), explanation: r < .38 ? "La densidad de partículas es relativamente baja, pero la exposición debe mantenerse tan reducida como sea posible." : r < .68 ? "La densidad aumenta y los grupos sensibles pueden presentar efectos con mayor facilidad." : "La alta densidad refuerza la prioridad de reducir emisiones y exposición.", scene: pmScene(r, "pm25") }; },
      info: info.pm25, challenge: "Mueve la concentración y observa por qué un tamaño casi invisible puede llegar más profundo que el PM10."
    },
    pm10: {
      title: "PM10", eyebrow: "Material particulado grueso", mark: "10", accent: "#d9822b", tint: "#fff4e7",
      lead: "Partículas menores a 10 micrómetros asociadas con polvo, obras, vías sin pavimentar y procesos mecánicos.",
      primary: { id: "concentration", label: "Concentración de PM10", min: 10, max: 120, step: .1, value: 50, unit: "µg/m³", low: "10", high: "120", digits: 1 },
      compute: s => { const r = ratio(s.concentration, 10, 120); return { value: s.concentration, digits: 1, unit: "µg/m³", category: categoryFor(r), tone: toneFor(r), explanation: r < .38 ? "Hay pocas partículas gruesas visibles en la trayectoria urbana." : r < .68 ? "El polvo resuspendido gana importancia y conviene controlar vías y obras." : "La concentración alta hace prioritario actuar sobre fuentes de polvo y material suelto.", scene: pmScene(r, "pm10") }; },
      info: info.pm10, challenge: "Compara la escala de PM10 y PM2.5 y localiza dónde cambia su penetración respiratoria."
    },
    o3: {
      title: "Ozono troposférico", eyebrow: "Contaminante secundario", mark: "O₃", accent: "#b77800", tint: "#fff7df",
      lead: "No sale directamente de un escape: se forma en el aire cuando reaccionan NOx y COV bajo radiación solar.",
      primary: { id: "sun", label: "Radiación solar y calor", min: 0, max: 100, step: 1, value: 55, unit: "%", low: "Baja", high: "Alta" },
      secondary: [
        { id: "nox", label: "Disponibilidad de NOx", type: "select", value: 0.75, options: [{ value: 0.25, label: "Baja" }, { value: 0.75, label: "Alta" }] },
        { id: "cov", label: "Disponibilidad de COV", type: "select", value: 0.75, options: [{ value: 0.25, label: "Baja" }, { value: 0.75, label: "Alta" }] }
      ],
      fromQuery: value => clamp((value - 10) / 50 * 100, 0, 100),
      compute: s => { const scene = ozoneScene(s.sun / 100, Number(s.nox), Number(s.cov)); return { value: 10 + scene.intensity * 50, digits: 1, unit: "ppb", category: categoryFor(scene.intensity, ["Formación baja", "Formación media", "Formación alta"]), tone: toneFor(scene.intensity), explanation: "El resultado es cualitativo: la respuesta depende de la combinación de precursores y no siempre es lineal.", scene }; },
      info: [{ icon: "🧪", title: "Formación", text: "Necesita precursores químicos y energía solar; no se emite directamente." }, { icon: "🫁", title: "Efectos", text: "Irrita vías respiratorias y puede reducir la función pulmonar." }, { icon: "⚖️", title: "Control", text: "Las estrategias deben considerar conjuntamente NOx, COV y condiciones meteorológicas." }],
      challenge: "Prueba las cuatro combinaciones de NOx y COV con radiación alta. ¿El resultado cambia igual?"
    },
    cov: {
      title: "COV", eyebrow: "Compuestos orgánicos volátiles", mark: "COV", accent: "#7c4d9e", tint: "#f4eef7",
      lead: "Pueden provenir de solventes, pinturas, combustibles, talleres, productos domésticos e industria liviana.",
      primary: { id: "solvents", label: "Uso de solventes sin control", min: 0, max: 100, step: 1, value: 65, unit: "%", low: "Bajo", high: "Alto" },
      secondary: [{ id: "extraction", label: "Medida de control", type: "select", value: 0, options: [{ value: 0, label: "Sin extracción" }, { value: 1, label: "Con extracción" }] }],
      fromQuery: value => clamp((value - 5) / .65, 0, 100),
      compute: s => { const scene = covScene(s.solvents / 100, Number(s.extraction)); const value = 5 + scene.effective * 65; return { value, digits: 1, unit: "µg/m³", category: categoryFor(scene.effective, ["Emisión baja", "Emisión media", "Emisión alta"]), tone: toneFor(scene.effective), explanation: Number(s.extraction) ? "La extracción reduce la cantidad de vapor que permanece en el taller, incluso con el mismo uso de solventes." : "Sin extracción, una mayor actividad produce más vapor disponible para exposición y química atmosférica.", scene }; },
      info: [{ icon: "🎨", title: "Fuentes", text: "Pinturas, solventes, combustibles, adhesivos y productos de limpieza." }, { icon: "🧪", title: "Química", text: "Algunos COV participan en la formación de ozono y partículas secundarias." }, { icon: "🧰", title: "Acciones", text: "Tapar recipientes, sustituir productos y mejorar ventilación y extracción." }],
      challenge: "Mantén el uso de solventes al máximo y activa la extracción: compara la cantidad de vapor."
    },
    temp: {
      title: "Temperatura urbana", eyebrow: "Isla de calor", mark: "°C", accent: "#be3a34", tint: "#f8f1ec",
      lead: "El asfalto y los techos duros almacenan calor; la vegetación aporta sombra y evapotranspiración.",
      primary: { id: "green", label: "Cobertura verde", min: 0, max: 100, step: 1, value: 35, unit: "%", low: "Sin verde", high: "Muy verde" },
      fromQuery: value => clamp((29 - value) / .07, 0, 100),
      compute: s => { const r = s.green / 100; const scene = temperatureScene(r); const heat = 1 - r; return { value: scene.temperature, digits: 1, unit: "°C", category: categoryFor(heat, ["Menor carga térmica", "Carga intermedia", "Mayor carga térmica"]), tone: toneFor(heat), explanation: "La estimación ilustra cómo la sombra y la evapotranspiración pueden moderar la temperatura; no es un pronóstico meteorológico.", scene }; },
      info: [{ icon: "🏙️", title: "Causa", text: "Superficies oscuras, poca sombra y calor liberado por actividades urbanas." }, { icon: "🌡️", title: "Efectos", text: "Mayor estrés térmico y condiciones que pueden favorecer algunos contaminantes." }, { icon: "🌳", title: "Acciones", text: "Árboles adecuados, sombra, superficies reflectivas y corredores verdes." }],
      challenge: "Lleva la cobertura verde a ambos extremos y compara termómetro, sombra y ondas de calor."
    },
    wind: {
      title: "Velocidad del viento", eyebrow: "Transporte atmosférico", mark: "↠", accent: "#047a7a", tint: "#edf7f8",
      lead: "El viento transporta y diluye contaminantes, pero no reemplaza la reducción de emisiones en la fuente.",
      primary: { id: "speed", label: "Velocidad del viento", min: .5, max: 5.5, step: .1, value: 1.8, unit: "m/s", low: "Calma", high: "Ventilado", digits: 1 },
      compute: s => { const r = ratio(s.speed, .5, 5.5); return { value: s.speed, digits: 1, unit: "m/s", category: categoryFor(r, ["Viento débil", "Viento moderado", "Viento fuerte"]), tone: r < .38 ? "warn" : "good", explanation: "La pluma se alarga y pierde densidad local a medida que aumenta el viento, aunque la fuente sigue emitiendo.", scene: windScene(r) }; },
      info: [{ icon: "💨", title: "Dispersión", text: "Transporta contaminantes y reduce su concentración cerca de la fuente." }, { icon: "🧭", title: "Dirección", text: "También determina qué barrios quedan a sotavento de una fuente." }, { icon: "🏭", title: "Límite", text: "Un aire más ventilado no elimina la masa total emitida." }],
      challenge: "Observa la misma fuente con calma y con viento fuerte: ¿qué cambia en la pluma?"
    },
    hmix: {
      title: "Altura de mezcla", eyebrow: "Dispersión vertical", mark: "↕", accent: "#2563a8", tint: "#eef5f6",
      lead: "Es la profundidad de la capa de aire cercana al suelo donde los contaminantes pueden mezclarse verticalmente.",
      primary: { id: "height", label: "Altura de mezcla", min: 70, max: 220, step: 1, value: 102, unit: "m", low: "70 m", high: "220 m" },
      compute: s => { const r = ratio(s.height, 70, 220); return { value: s.height, digits: 0, unit: "m", category: categoryFor(r, ["Capa baja", "Capa intermedia", "Capa alta"]), tone: r < .38 ? "warn" : "good", explanation: r < .38 ? "La misma masa queda confinada en poco volumen y aumenta su concentración cerca del suelo." : "Una capa más profunda ofrece mayor volumen para mezclar la misma cantidad de contaminantes.", scene: mixingScene(r) }; },
      info: [{ icon: "☀️", title: "Energía", text: "La radiación solar puede favorecer movimientos verticales durante el día." }, { icon: "🌡️", title: "Estabilidad", text: "Las inversiones térmicas limitan el crecimiento de la capa de mezcla." }, { icon: "🏙️", title: "Efecto", text: "Una capa baja concentra emisiones sobre la población urbana." }],
      challenge: "Mantén la atención en la cantidad de puntos: cambia el volumen, no la masa emitida."
    },
    vent: {
      title: "Índice de ventilación", eyebrow: "Capacidad de dispersión", mark: "V", accent: "#047a7a", tint: "#edf7f8",
      lead: "Combina la velocidad del viento y la altura de mezcla para representar la capacidad de transportar y diluir contaminantes.",
      primary: { id: "wind", label: "Velocidad del viento", min: .5, max: 5.5, step: .1, value: 1.8, unit: "m/s", low: "0,5", high: "5,5", digits: 1 },
      secondary: [{ id: "height", label: "Altura de mezcla", min: 70, max: 220, step: 1, value: 108, unit: "m", low: "70", high: "220" }],
      fromQuery: value => clamp(.5 + value / 100 * 5, .5, 5.5),
      afterQuery: (state, value) => { state.height = 70 + clamp(value, 0, 100) / 100 * 150; },
      compute: s => { const wr = ratio(s.wind, .5, 5.5); const hr = ratio(s.height, 70, 220); const score = Math.round((wr * .58 + hr * .42) * 100); return { value: score, digits: 0, unit: "/100", category: categoryFor(score / 100, ["Ventilación deficiente", "Ventilación moderada", "Ventilación favorable"]), tone: score < 38 ? "warn" : "good", explanation: "El índice mejora cuando ambos componentes aumentan. Un solo componente favorable no compensa completamente al otro.", scene: mixingScene(hr, wr, true) }; },
      info: [{ icon: "💨", title: "Viento", text: "Aporta transporte horizontal y renovación del aire." }, { icon: "↕️", title: "Mezcla", text: "Aporta el volumen vertical disponible para dilución." }, { icon: "🧮", title: "Índice", text: "La combinación es pedagógica y permite comparar escenarios, no sustituye un cálculo oficial." }],
      challenge: "Prueba viento fuerte con capa baja y luego viento débil con capa alta. ¿Cuál limita el resultado?"
    },
    stagnation: {
      title: "Estancamiento atmosférico", eyebrow: "Persistencia de contaminación", mark: "≋", accent: "#be3a34", tint: "#f9efee",
      lead: "Condiciones de viento débil y mezcla limitada permiten que las emisiones permanezcan sobre la ciudad durante más tiempo.",
      primary: { id: "index", label: "Índice de estancamiento", min: 0, max: 100, step: 1, value: 70, unit: "/100", low: "Renovación", high: "Estancado" },
      compute: s => { const r = s.index / 100; return { value: s.index, digits: 0, unit: "/100", category: categoryFor(r, ["Renovación favorable", "Persistencia moderada", "Estancamiento alto"]), tone: toneFor(r), explanation: r < .38 ? "El aire se renueva y limita la acumulación prolongada." : "La inversión desciende y la contaminación se acumula durante más horas sobre la ciudad.", scene: stagnationScene(r) }; },
      info: [{ icon: "🍃", title: "Se agrava con", text: "Viento débil, poca mezcla e inversiones térmicas persistentes." }, { icon: "⏱️", title: "Efecto", text: "Prolonga episodios y aumenta el tiempo de exposición." }, { icon: "📣", title: "Respuesta", text: "Alertas tempranas y reducción preventiva de emisiones." }],
      challenge: "Recorre las 24 horas de acumulación cambiando el índice de un extremo al otro."
    },
    exposure: {
      title: "Población expuesta", eyebrow: "Proximidad y permanencia", mark: "●", accent: "#be3a34", tint: "#f1f5ef",
      lead: "La exposición depende de cuántas personas permanecen cerca de fuentes contaminantes y durante cuánto tiempo.",
      primary: { id: "distance", label: "Distancia promedio de viviendas a la vía", min: 20, max: 500, step: 1, value: 164, unit: "m", low: "20 m", high: "500 m" },
      fromQuery: value => clamp(20 + ((80000 - value) / 50000) * 480, 20, 500),
      compute: s => { const dr = ratio(s.distance, 20, 500); const exposedRatio = 1 - dr; const value = Math.round(30000 + exposedRatio * 50000); return { value, digits: 0, unit: "habitantes", category: categoryFor(exposedRatio, ["Exposición menor", "Exposición intermedia", "Exposición alta"]), tone: toneFor(exposedRatio), explanation: "Al aumentar la distancia disminuye la proporción de población dentro de la franja de mayor influencia de la vía.", scene: exposureScene(dr, exposedRatio) }; },
      info: [{ icon: "🛣️", title: "Proximidad", text: "Vivir, estudiar o trabajar junto a vías aumenta la influencia de emisiones cercanas." }, { icon: "⏳", title: "Permanencia", text: "La exposición también depende del tiempo y de las actividades realizadas." }, { icon: "🏥", title: "Sensibilidad", text: "Niñez, vejez y enfermedades previas pueden aumentar la vulnerabilidad." }],
      challenge: "Aleja las viviendas de la vía y comprueba cómo cambian los puntos rojos y el resultado estimado."
    }
  };

  const particulateReferences = {
    pm25: { label: "PM2.5", max: 80, min: 5, colombia24: 37, who24: 15, colombiaAnnual: 25, colombia2030: 15, whoAnnual: 5, color: palette.red },
    pm10: { label: "PM10", max: 120, min: 10, colombia24: 75, who24: 45, colombiaAnnual: 50, colombia2030: 30, whoAnnual: 15, color: palette.orange }
  };

  function particulateStatus(type, value) {
    const reference = particulateReferences[type];
    if (value <= reference.who24) return { tone: "good", label: "Dentro de la guía OMS de 24 h" };
    if (value <= reference.colombia24) return { tone: "warn", label: "Supera OMS; dentro del máximo colombiano de 24 h" };
    return { tone: "bad", label: "Supera OMS y el máximo colombiano de 24 h" };
  }

  function cubicPoint(points, t) {
    const mt = 1 - t;
    return {
      x: (mt ** 3 * points[0][0]) + (3 * mt * mt * t * points[1][0]) + (3 * mt * t * t * points[2][0]) + (t ** 3 * points[3][0]),
      y: (mt ** 3 * points[0][1]) + (3 * mt * mt * t * points[1][1]) + (3 * mt * t * t * points[2][1]) + (t ** 3 * points[3][1])
    };
  }

  function particulatePathPoint(type, progress) {
    const fine = type === "pm25";
    const split = fine ? 0.66 : 0.82;
    if (progress <= split) {
      const t = progress / split;
      return cubicPoint([[155, 172], [325, fine ? 62 : 116], [515, fine ? 90 : 132], [605, 121]], t);
    }
    const t = (progress - split) / (1 - split);
    return fine
      ? cubicPoint([[605, 121], [659, 151], [661, 238], [629, 304]], t)
      : cubicPoint([[605, 121], [631, 137], [644, 166], [645, 190]], t);
  }

  function particulateSourceMarkup(source) {
    const traffic = `
      <g aria-label="Fuente de tráfico y combustión">
        <rect x="20" y="294" width="185" height="54" rx="12" fill="#3d4d56"/>
        <line x1="28" y1="326" x2="198" y2="326" stroke="#f6df76" stroke-width="3" stroke-dasharray="18 14"/>
        ${car(42, 279, palette.red, .88)}${car(118, 298, palette.blue, .74)}
        <path d="M93 286c27-23 46-20 68-34" fill="none" stroke="#be3a34" stroke-width="10" stroke-linecap="round" opacity=".2"/>
        <text class="source-own-label" x="112" y="371" text-anchor="middle" font-size="13" font-weight="800" fill="${palette.ink}">TRÁFICO Y COMBUSTIÓN</text>
      </g>`;
    const dust = `
      <g aria-label="Fuente de obras y polvo">
        <path d="M24 335 76 267l52 68z" fill="#b68b63"/><path d="M91 335 142 286l48 49z" fill="#987150"/>
        <rect x="34" y="249" width="16" height="87" fill="#d9822b"/><path d="m29 250 13-27 13 27z" fill="#f0c75e"/>
        <rect x="154" y="252" width="15" height="84" fill="#d9822b"/><path d="m149 253 13-27 13 27z" fill="#f0c75e"/>
        ${deterministicDots(10, { x: 22, y: 205, width: 165, height: 74, color: palette.orange, minRadius: 5, maxRadius: 10, opacity: .25 })}
        <text class="source-own-label" x="108" y="371" text-anchor="middle" font-size="13" font-weight="800" fill="${palette.ink}">OBRAS Y POLVO</text>
      </g>`;
    if (source === "traffic") return traffic;
    if (source === "dust") return dust;
    return `<g class="mixed-source"><g transform="translate(0 18) scale(.72)">${traffic}</g><g transform="translate(82 38) scale(.68)">${dust}</g></g><text x="108" y="371" text-anchor="middle" font-size="13" font-weight="800" fill="${palette.ink}">FUENTE MIXTA</text>`;
  }

  function particulateScene(state, effective) {
    const visibleTypes = state.focus === "compare" ? ["pm10", "pm25"] : [state.focus];
    const particles = [];
    const deposits = [];
    const counts = { pm25: 0, pm10: 0 };
    const deposited = { pm25: 0, pm10: 0 };

    visibleTypes.forEach(type => {
      const reference = particulateReferences[type];
      const level = ratio(effective[type], reference.min, reference.max);
      const count = Math.round(7 + level * 22);
      const depositCount = Math.round(2 + level * 8);
      counts[type] = count;
      deposited[type] = depositCount;
      for (let index = 0; index < count; index += 1) {
        const progress = (state.phase + (index / count) + (type === "pm25" ? .06 : .31)) % 1;
        const point = particulatePathPoint(type, progress);
        const radiusValue = type === "pm25" ? 2.7 : 6.2;
        particles.push(`<circle class="moving-particle ${type}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radiusValue}" fill="${reference.color}" opacity="${type === "pm25" ? .85 : .76}"/>`);
      }
      for (let index = 0; index < depositCount; index += 1) {
        const x = type === "pm25" ? 601 + ((index * 19) % 77) : 630 + ((index * 9) % 31);
        const y = type === "pm25" ? 252 + ((index * 27) % 81) : 148 + ((index * 13) % 53);
        deposits.push(`<circle class="deposited-particle ${type}" cx="${x}" cy="${y}" r="${type === "pm25" ? 2.8 : 5.8}" fill="${reference.color}" opacity=".86"/>`);
      }
    });

    const fineActive = visibleTypes.includes("pm25");
    const coarseActive = visibleTypes.includes("pm10");
    const svg = svgFrame("Comparación animada de PM2.5 y PM10 desde una fuente urbana hasta diferentes zonas del sistema respiratorio", `
      <rect width="720" height="400" fill="url(#sky)"/>
      <rect y="346" width="720" height="54" fill="#e9efe9"/>
      ${particulateSourceMarkup(state.source)}
      <path d="M155 172 C325 62 515 90 605 121 C659 151 661 238 629 304" fill="none" stroke="${palette.red}" stroke-width="3" stroke-dasharray="8 10" opacity="${fineActive ? .38 : .08}"/>
      <path d="M155 172 C325 116 515 132 605 121 C631 137 644 166 645 190" fill="none" stroke="${palette.orange}" stroke-width="4" stroke-dasharray="12 12" opacity="${coarseActive ? .42 : .08}"/>
      ${particles.join("")}
      <g aria-label="Sistema respiratorio">
        <circle cx="637" cy="75" r="43" fill="#e2b39e"/>
        <path d="M602 114c-27 37-38 99-35 222h126c3-123-8-185-36-222" fill="#f2d5c8"/>
        <path d="M605 118c30 3 40 25 40 53v49m0-28-31 28m31-28 31 28" fill="none" stroke="#8b5f61" stroke-width="9" stroke-linecap="round"/>
        <path d="M639 230c-38-21-57 3-57 48 0 48 25 72 58 55z" fill="#f2a7a2" stroke="#a84d50" stroke-width="3"/>
        <path d="M651 230c38-21 57 3 57 48 0 48-25 72-58 55z" fill="#f2a7a2" stroke="#a84d50" stroke-width="3"/>
        ${deposits.join("")}
      </g>
      <g font-size="11" font-weight="800" fill="${palette.ink}">
        <path d="M629 152h-72" stroke="#7f9099"/><text x="552" y="156" text-anchor="end">Nariz y garganta · PM10</text>
        <path d="M620 278h-63" stroke="#7f9099"/><text x="552" y="282" text-anchor="end">Alvéolos · PM2.5</text>
      </g>
    `, "#eef6f3");
    return { svg, counts, deposited };
  }

  function renderParticulateLab(key, root) {
    const params = new URLSearchParams(location.search);
    const validFocus = ["compare", "pm25", "pm10"];
    const focusFromQuery = params.get("focus");
    const initialFocus = validFocus.includes(focusFromQuery) ? focusFromQuery : key;
    const numberParam = name => params.has(name) ? Number(params.get(name)) : Number.NaN;
    const legacyValue = numberParam("value");
    const queryPm25 = numberParam("pm25");
    const queryPm10 = numberParam("pm10");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const initial = {
      pm25: Number.isFinite(queryPm25) ? clamp(queryPm25, 5, 80) : (key === "pm25" && Number.isFinite(legacyValue) ? clamp(legacyValue, 5, 80) : 35),
      pm10: Number.isFinite(queryPm10) ? clamp(queryPm10, 10, 120) : (key === "pm10" && Number.isFinite(legacyValue) ? clamp(legacyValue, 10, 120) : 50)
    };
    const state = {
      focus: initialFocus,
      pm25: initial.pm25,
      pm10: initial.pm10,
      source: initialFocus === "pm25" ? "traffic" : initialFocus === "pm10" ? "dust" : "mixed",
      mitigation: false,
      playing: !reducedMotion,
      phase: 0
    };
    let lastScene = { counts: { pm25: 0, pm10: 0 }, deposited: { pm25: 0, pm10: 0 } };

    document.title = "Laboratorio comparativo: PM2.5 y PM10";
    document.documentElement.style.setProperty("--accent", palette.red);
    document.documentElement.style.setProperty("--scene-tint", "#f8efeb");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell particulate-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="particulate-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio comparativo</span></nav>
      <header class="resource-header particulate-header"><div><p class="eyebrow">Material particulado respirable</p><h1>PM2.5 y PM10</h1><p class="lead">Compara cómo la concentración cambia la cantidad de partículas y cómo el tamaño determina hasta dónde pueden penetrar. Los valores se interpretan como un escenario didáctico equivalente a un promedio de 24 horas.</p></div><div class="header-mark particulate-mark" aria-hidden="true"><span>2.5</span><span>10</span></div></header>
      <section class="particulate-layout" aria-label="Laboratorio comparativo de material particulado">
        <article class="card scene-card particulate-scene-card">
          <div class="card-head"><div><h2>Del ambiente al sistema respiratorio</h2><p>Las rutas son representativas: muestran dónde puede depositarse cada tamaño.</p></div><span class="live-badge" id="animation-badge"></span></div>
          <div class="scene particulate-scene" id="particulate-scene"></div>
          <div class="scene-legend"><span class="legend-item"><i class="legend-dot" style="--dot:${palette.red}"></i>PM2.5 · partícula fina</span><span class="legend-item"><i class="legend-dot" style="--dot:${palette.orange}"></i>PM10 · partícula gruesa</span><span class="legend-item"><i class="legend-line"></i>Trayectoria representativa</span></div>
          <div class="particle-scale" aria-label="Comparación real de diámetros">
            <div class="scale-title"><strong>Escala real de diámetros</strong><span>70 : 10 : 2,5</span></div>
            <div class="scale-row exact-scale"><span class="size-circle hair" aria-label="Cabello humano 70 micrómetros">70</span><span class="size-circle pm10-size" aria-label="PM10 10 micrómetros">10</span><span class="size-circle pm25-size" aria-label="PM2.5 2,5 micrómetros"></span></div>
            <div class="scale-labels"><span>Cabello · 70 µm</span><span>PM10 · 10 µm</span><span>PM2.5 · 2,5 µm</span></div>
            <div class="zoom-scale"><span>Ampliación ×4</span><i class="zoom-pm10"></i><b>PM10</b><i class="zoom-pm25"></i><b>PM2.5</b></div>
          </div>
        </article>
        <aside class="card control-card particulate-controls">
          <div><h2>Experimenta</h2><p class="control-intro">El recurso no agrega políticas al plan; solo demuestra sus efectos.</p></div>
          <div class="mode-tabs" role="tablist" aria-label="Modo de comparación">
            <button type="button" data-focus="compare" role="tab">Comparar</button><button type="button" data-focus="pm25" role="tab">PM2.5</button><button type="button" data-focus="pm10" role="tab">PM10</button>
          </div>
          <div class="particulate-sliders">
            <div class="control-group" data-control-type="pm25"><label class="control-label" for="control-pm25"><span>Concentración de PM2.5</span><span class="control-readout" id="readout-pm25"></span></label><input id="control-pm25" type="range" min="5" max="80" step="0.1"><div class="range-labels"><span>5</span><span>80 µg/m³</span></div></div>
            <div class="control-group" data-control-type="pm10"><label class="control-label" for="control-pm10"><span>Concentración de PM10</span><span class="control-readout pm10-readout" id="readout-pm10"></span></label><input id="control-pm10" type="range" min="10" max="120" step="0.1"><div class="range-labels"><span>10</span><span>120 µg/m³</span></div></div>
          </div>
          <div class="control-group"><label class="control-label" for="control-source"><span>Fuente dominante</span></label><select id="control-source" class="select-control"><option value="traffic">Tráfico y combustión</option><option value="dust">Obras y polvo</option><option value="mixed">Fuente mixta</option></select></div>
          <label class="mitigation-toggle" for="control-mitigation"><input id="control-mitigation" type="checkbox"><span><strong id="mitigation-title"></strong><small id="mitigation-detail"></small></span></label>
          <div class="playback-controls"><button type="button" id="play-toggle"></button><button type="button" id="reset-lab">Restablecer</button></div>
          <div class="particulate-results" id="particulate-results" aria-live="polite"></div>
          <p class="didactic-note">La concentración controla la densidad de puntos. El tamaño y la zona de depósito permanecen propios de PM2.5 o PM10.</p>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves de interpretación">
        <article class="card info-card"><span class="info-icon" aria-hidden="true">↗</span><h2>Fuentes</h2><p><b>PM2.5:</b> combustión vehicular e industrial y formación secundaria. <b>PM10:</b> polvo resuspendido, obras y desgaste.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">◎</span><h2>Depósito</h2><p>PM10 tiende a quedar en vías superiores. PM2.5 puede alcanzar bronquios y alvéolos; la ilustración no representa una dosis clínica.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">✓</span><h2>Acciones</h2><p>P1 reduce especialmente emisiones de combustión. P7 actúa con mayor fuerza sobre PM10 proveniente de obras y polvo.</p></article>
      </section>
      <section class="card standards-card"><div><p class="eyebrow">Referencias con período explícito</p><h2>Colombia y OMS</h2></div><div class="standards-grid"><p><b>Colombia actual · anual:</b> PM2.5 25 y PM10 50 µg/m³.<br><b>Meta Colombia 2030 · anual:</b> PM2.5 15 y PM10 30 µg/m³.</p><p><b>OMS 2021 · anual:</b> PM2.5 5 y PM10 15 µg/m³.<br><b>OMS 2021 · 24 h:</b> PM2.5 15 y PM10 45 µg/m³.</p></div><div class="standards-links"><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf" target="_blank" rel="noopener">Resolución 2254 de 2017</a><a href="https://www.who.int/teams/environment-climate-change-and-health/air-quality-and-health/health-impacts/types-of-pollutants" target="_blank" rel="noopener">Guías OMS 2021</a></div></section>`;

    const elements = {
      scene: document.getElementById("particulate-scene"),
      results: document.getElementById("particulate-results"),
      pm25: document.getElementById("control-pm25"),
      pm10: document.getElementById("control-pm10"),
      source: document.getElementById("control-source"),
      mitigation: document.getElementById("control-mitigation"),
      play: document.getElementById("play-toggle"),
      badge: document.getElementById("animation-badge")
    };
    elements.pm25.value = state.pm25;
    elements.pm10.value = state.pm10;
    elements.source.value = state.source;

    function mitigationForSource() {
      if (!state.mitigation) return { key: "none", label: "Sin medida", pm25: 1, pm10: 1 };
      if (state.source === "traffic") return { key: "p1", label: "P1 · Zona de bajas emisiones", pm25: .82, pm10: .88 };
      if (state.source === "dust") return { key: "p7", label: "P7 · Control de obras y polvo", pm25: .98, pm10: .78 };
      return { key: "p1+p7", label: "P1 + P7 · Control combinado", pm25: .80, pm10: .66 };
    }

    function effectiveValues() {
      const measure = mitigationForSource();
      return { pm25: state.pm25 * measure.pm25, pm10: state.pm10 * measure.pm10 };
    }

    function referenceMarkup(type, effective) {
      const reference = particulateReferences[type];
      const status = particulateStatus(type, effective);
      const original = state[type];
      const reduction = original ? Math.max(0, (1 - effective / original) * 100) : 0;
      const marker = value => clamp(value / reference.max * 100, 0, 100);
      return `<article class="result-panel ${status.tone}"><div class="result-heading"><span>${reference.label}</span><strong>${fmt(effective, 1)} <small>µg/m³</small></strong></div><p>Original: ${fmt(original, 1)} · Reducción: ${fmt(reduction, 0)}%</p><div class="reference-track" aria-label="Comparación de ${reference.label} con referencias de 24 horas"><i class="who-marker" style="left:${marker(reference.who24)}%"><b>OMS ${reference.who24}</b></i><i class="colombia-marker" style="left:${marker(reference.colombia24)}%"><b>COL ${reference.colombia24}</b></i><span class="value-marker" style="left:${marker(effective)}%"></span></div><span class="result-status">${status.label}</span></article>`;
    }

    function renderScene() {
      const effective = effectiveValues();
      lastScene = particulateScene(state, effective);
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const effective = effectiveValues();
      const measure = mitigationForSource();
      document.querySelectorAll("[data-focus]").forEach(button => {
        const active = button.dataset.focus === state.focus;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll("[data-control-type]").forEach(group => {
        group.hidden = state.focus !== "compare" && group.dataset.controlType !== state.focus;
      });
      document.getElementById("readout-pm25").textContent = `${fmt(state.pm25, 1)} µg/m³`;
      document.getElementById("readout-pm10").textContent = `${fmt(state.pm10, 1)} µg/m³`;
      elements.source.value = state.source;
      elements.mitigation.checked = state.mitigation;
      document.getElementById("mitigation-title").textContent = state.source === "traffic" ? "Aplicar P1 · Zona de bajas emisiones" : state.source === "dust" ? "Aplicar P7 · Control de obras y polvo" : "Aplicar P1 + P7";
      document.getElementById("mitigation-detail").textContent = state.source === "traffic" ? "−18% PM2.5 · −12% PM10" : state.source === "dust" ? "−2% PM2.5 · −22% PM10" : "−20% PM2.5 · −34% PM10";
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      const resultTypes = state.focus === "compare" ? ["pm25", "pm10"] : [state.focus];
      elements.results.innerHTML = `<div class="measure-name">${measure.label}</div>${resultTypes.map(type => referenceMarkup(type, effective[type])).join("")}`;
      renderScene();
    }

    document.querySelectorAll("[data-focus]").forEach(button => button.addEventListener("click", () => {
      state.focus = button.dataset.focus;
      state.source = state.focus === "pm25" ? "traffic" : state.focus === "pm10" ? "dust" : "mixed";
      state.mitigation = false;
      render();
    }));
    elements.pm25.addEventListener("input", () => { state.pm25 = Number(elements.pm25.value); render(); });
    elements.pm10.addEventListener("input", () => { state.pm10 = Number(elements.pm10.value); render(); });
    elements.source.addEventListener("change", () => { state.source = elements.source.value; state.mitigation = false; render(); });
    elements.mitigation.addEventListener("change", () => { state.mitigation = elements.mitigation.checked; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("reset-lab").addEventListener("click", () => {
      Object.assign(state, { focus: initialFocus, pm25: initial.pm25, pm10: initial.pm10, source: initialFocus === "pm25" ? "traffic" : initialFocus === "pm10" ? "dust" : "mixed", mitigation: false, playing: !reducedMotion, phase: 0 });
      elements.pm25.value = state.pm25;
      elements.pm10.value = state.pm10;
      render();
    });
    document.getElementById("particulate-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) {
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      } else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
        history.back();
      } else {
        location.href = "index.html";
      }
    });

    function renderResourceToText() {
      const measure = mitigationForSource();
      const effective = effectiveValues();
      return JSON.stringify({
        resource: "particulate-matter",
        focus: state.focus,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        concentrations: { pm25: Number(state.pm25.toFixed(1)), pm10: Number(state.pm10.toFixed(1)) },
        effective: { pm25: Number(effective.pm25.toFixed(2)), pm10: Number(effective.pm10.toFixed(2)) },
        source: state.source,
        mitigation: measure.key,
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        particles: { airborne: lastScene.counts, deposited: lastScene.deposited },
        deposition: { pm10: "nariz, garganta y vías superiores", pm25: "bronquios y alvéolos" },
        standards24h: { pm25: particulateStatus("pm25", effective.pm25).label, pm10: particulateStatus("pm10", effective.pm10).label }
      });
    }

    window.RESOURCE = { kind: "particulate-matter", focus: initialFocus };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };

    let lastFrame = performance.now();
    function animateParticulate(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateParticulate);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateParticulate);
  }

  const co2Measures = {
    none: { code: "none", label: "Sin medida", effect: 0 },
    P1: { code: "P1", label: "P1 · Zona de bajas emisiones", effect: -.10 },
    P2: { code: "P2", label: "P2 · Buses eléctricos", effect: -.15 },
    P3: { code: "P3", label: "P3 · Restricción vehicular", effect: -.05 },
    P4: { code: "P4", label: "P4 · Ciclorrutas y vías peatonales", effect: -.07 },
    P5: { code: "P5", label: "P5 · Arborización urbana", effect: -.03 },
    P9: { code: "P9", label: "P9 · Teletrabajo y horarios", effect: -.05 }
  };
  const co2DisplayScale = { minIndex: 70, maxIndex: 100, minPpm: 431, maxPpm: 496 };

  function co2IndexToPpm(index) {
    const bounded = clamp(Number(index), co2DisplayScale.minIndex, co2DisplayScale.maxIndex);
    const progress = (bounded - co2DisplayScale.minIndex) / (co2DisplayScale.maxIndex - co2DisplayScale.minIndex);
    return co2DisplayScale.minPpm + progress * (co2DisplayScale.maxPpm - co2DisplayScale.minPpm);
  }

  function renderCo2Lab(root) {
    const params = new URLSearchParams(location.search);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const requestedView = params.get("view");
    const initialView = requestedView === "climate" ? "climate" : "sources";
    const currentParam = Number(params.get("current"));
    const legacyParam = Number(params.get("value"));
    const hasCurrent = params.has("current") && Number.isFinite(currentParam);
    const hasLegacy = params.has("value") && Number.isFinite(legacyParam);
    const currentIndex = clamp(hasCurrent ? currentParam : hasLegacy ? legacyParam / 496 * 100 : 100, 0, 200);
    const currentPpm = co2IndexToPpm(currentIndex);
    const state = {
      view: initialView,
      activity: 100,
      source: "mixed",
      measure: "none",
      playing: !reducedMotion,
      phase: 0
    };
    let lastScene = { molecules: 0, emitters: [], energyArrows: 0 };

    const sourceLabels = {
      mobility: "Movilidad: vehículos y transporte urbano.",
      energy: "Edificios y energía: combustión asociada al consumo urbano.",
      mixed: "Mezcla urbana: movilidad, edificios y consumo de energía."
    };

    function experiment() {
      const measure = co2Measures[state.measure];
      const before = state.activity;
      const after = before * (1 + measure.effect);
      const beforePpm = co2IndexToPpm(before);
      const afterPpm = co2IndexToPpm(after);
      const reduction = Math.max(0, -measure.effect * 100);
      let status = "Valor interpolado dentro de la escala 431–496 ppm";
      if (afterPpm <= co2DisplayScale.minPpm + .05) status = "Límite inferior de la escala didáctica · 431 ppm";
      if (afterPpm >= co2DisplayScale.maxPpm - .05) status = "Límite superior de la escala didáctica · 496 ppm";
      return { measure, before, after, beforePpm, afterPpm, reduction, status };
    }

    function moleculeMarkup(count, mode) {
      const molecules = [];
      for (let index = 0; index < count; index += 1) {
        const progress = (state.phase + index / count) % 1;
        let x;
        let y;
        if (mode === "climate") {
          x = 55 + ((index * 79 + progress * 170) % 610);
          y = 80 + ((index * 43) % 128) + Math.sin((progress + index) * Math.PI * 2) * 5;
        } else {
          const mobility = state.source === "mobility" || (state.source === "mixed" && index % 2 === 0);
          const startX = mobility ? 62 + (index % 4) * 76 : 318 + (index % 4) * 78;
          const startY = mobility ? 324 : 254 + (index % 2) * 18;
          const eased = 1 - ((1 - progress) ** 2);
          x = startX + (438 - startX) * eased + Math.sin((progress + index) * Math.PI * 2) * 12;
          y = startY + (72 - startY) * eased;
        }
        molecules.push(`<g class="co2-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="9" fill="#506773" opacity=".9"/><text x="0" y="3.5" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">CO₂</text></g>`);
      }
      return molecules.join("");
    }

    function urbanScene(result) {
      const count = Math.round(8 + ratio(state.activity, 70, 100) * 18);
      const mobilityActive = state.source === "mobility" || state.source === "mixed";
      const energyActive = state.source === "energy" || state.source === "mixed";
      const emitters = [mobilityActive ? "movilidad" : null, energyActive ? "edificios y energía" : null].filter(Boolean);
      const carsMarkup = [52, 132, 212].map((x, index) => car(x, 321, index % 2 ? palette.blue : palette.red, .68)).join("");
      const svg = svgFrame("Fuentes urbanas emitiendo dióxido de carbono que se mezcla con la atmósfera", `
        <rect width="720" height="330" fill="url(#sky)"/>
        <rect width="720" height="102" fill="#bddae5" opacity=".55"/>
        <path d="M0 98 C170 76 320 116 482 88 C585 70 652 84 720 72" fill="none" stroke="#6b8795" stroke-width="2" stroke-dasharray="8 9" opacity=".55"/>
        <text x="28" y="34" font-size="12" font-weight="900" fill="#45616e">MEZCLA ATMOSFÉRICA</text>
        ${buildings(320)}
        <g opacity="${energyActive ? 1 : .28}">
          <rect x="500" y="219" width="142" height="101" rx="6" fill="#657d89"/>
          <rect x="530" y="156" width="28" height="85" rx="3" fill="#506773"/>
          <path d="M576 220v-38l34 20 30-20v38" fill="#8197a1"/>
          <text x="571" y="286" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">ENERGÍA</text>
        </g>
        <rect y="320" width="720" height="80" fill="${palette.road}"/>
        <line x1="0" y1="361" x2="720" y2="361" stroke="#f6df76" stroke-width="4" stroke-dasharray="28 22"/>
        <g opacity="${mobilityActive ? 1 : .28}">${carsMarkup}</g>
        ${moleculeMarkup(count, "sources")}
        <g transform="translate(478 24)"><rect width="214" height="58" rx="14" fill="#fff" opacity=".94"/><text x="16" y="22" font-size="11" font-weight="800" fill="#60737d">CO₂ EQUIVALENTE</text><text x="16" y="47" font-size="25" font-weight="900" fill="#17202a">${fmt(result.afterPpm, 0)}</text><text x="83" y="47" font-size="10" font-weight="800" fill="#60737d">ppm · escala didáctica</text></g>
      `, "#edf3f7");
      return { svg, molecules: count, emitters, energyArrows: 0 };
    }

    function climateScene() {
      const count = Math.round(13 + ratio(state.activity, 70, 100) * 9);
      const pulse = 4 + Math.sin(state.phase * Math.PI * 2) * 3;
      const svg = svgFrame("Representación didáctica del dióxido de carbono atmosférico y el flujo de energía del efecto invernadero", `
        <defs><linearGradient id="climate-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#274f67"/><stop offset="1" stop-color="#b9dce7"/></linearGradient></defs>
        <rect width="720" height="400" fill="url(#climate-sky)"/>
        <circle cx="83" cy="62" r="38" fill="#f4cc63"/>
        <g stroke="#f4cc63" stroke-width="7" stroke-linecap="round" opacity=".92"><path d="M118 86 238 224"/><path d="M151 52 306 205"/></g>
        <path d="M34 322 Q360 174 686 322 L720 400 H0z" fill="#287c70"/>
        <path d="M96 320 Q360 214 624 320" fill="none" stroke="#d7edf1" stroke-width="5" opacity=".62"/>
        ${moleculeMarkup(count, "climate")}
        <g fill="none" stroke="#ef8b55" stroke-width="8" stroke-linecap="round">
          <path d="M286 302 C274 245 286 205 270 ${126 + pulse}"/>
          <path d="M376 292 C390 236 382 197 406 ${115 + pulse}"/>
          <path d="M485 306 C500 247 496 207 522 ${146 + pulse}"/>
        </g>
        <g fill="#ef8b55"><path d="m270 ${112 + pulse}-12 22h24z"/><path d="m406 ${101 + pulse}-12 22h24z"/><path d="m522 ${132 + pulse}-12 22h24z"/></g>
        <path d="M429 125 C464 166 447 215 412 248" fill="none" stroke="#d45850" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 9"/>
        <path d="m412 259-4-25 24 9z" fill="#d45850"/>
        <g transform="translate(27 104)"><rect width="235" height="82" rx="15" fill="#fff" opacity=".94"/><text x="18" y="23" font-size="11" font-weight="900" fill="#60737d">REFERENCIA ATMOSFÉRICA</text><text x="18" y="52" font-size="28" font-weight="900" fill="#17202a">431 ppm</text><text x="18" y="70" font-size="10" font-weight="800" fill="#60737d">junio de 2026 · no es un límite</text></g>
        <g transform="translate(444 336)"><rect width="247" height="42" rx="13" fill="#fff" opacity=".94"/><text x="123.5" y="17" text-anchor="middle" font-size="10" font-weight="900" fill="#36515e">SIMPLIFICACIÓN DIDÁCTICA</text><text x="123.5" y="32" text-anchor="middle" font-size="9" fill="#60737d">El control urbano no modifica esta cifra.</text></g>
      `, "#dceef4");
      return { svg, molecules: count, emitters: ["atmósfera global"], energyArrows: 5 };
    }

    document.title = "Laboratorio de emisiones y CO₂ atmosférico";
    document.documentElement.style.setProperty("--accent", "#506773");
    document.documentElement.style.setProperty("--scene-tint", "#edf3f7");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell co2-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="co2-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio de carbono</span></nav>
      <header class="resource-header co2-header"><div><p class="eyebrow">Emisiones urbanas y clima</p><h1>CO₂: flujo y concentración</h1><p class="lead">Explora por qué reducir emisiones urbanas cambia un flujo, mientras la concentración atmosférica en ppm responde a acumulación, mezcla y procesos globales.</p></div><div class="header-mark co2-mark" aria-hidden="true">CO₂</div></header>
      <section class="co2-layout" aria-label="Laboratorio de emisiones urbanas de dióxido de carbono">
        <article class="card scene-card co2-scene-card">
          <div class="card-head"><div><h2 id="co2-scene-title">De las fuentes a la atmósfera</h2><p id="co2-scene-note">La cantidad de moléculas representa un flujo relativo, no una medición local.</p></div><span class="live-badge" id="co2-animation-badge"></span></div>
          <div class="co2-view-tabs" role="tablist" aria-label="Vista del fenómeno"><button type="button" data-view="sources" role="tab">Fuentes urbanas</button><button type="button" data-view="climate" role="tab">Atmósfera y clima</button></div>
          <div class="scene co2-scene" id="co2-scene"></div>
          <div class="scene-legend" id="co2-legend"></div>
          <div class="co2-context-grid">
            <article><span>CO₂ actual del simulador</span><strong id="co2-current-index">${fmt(currentPpm, 0)} <small>ppm</small></strong><small>Equivalencia didáctica del índice interno ${fmt(currentIndex, 1)}.</small></article>
            <article><span>Atmósfera · junio de 2026</span><strong>431 <small>ppm</small></strong><small>Referencia global; no es un límite normativo.</small></article>
          </div>
        </article>
        <aside class="card control-card co2-controls">
          <div><h2>Experimenta</h2><p class="control-intro">El experimento recorre la escala 70–100 y no modifica tu plan.</p></div>
          <div class="control-group"><label class="control-label" for="co2-activity"><span>Actividad relativa</span><span class="control-readout" id="co2-activity-readout">100 %</span></label><input id="co2-activity" type="range" min="70" max="100" step="1" value="100"><div class="range-labels"><span>70 %</span><span>100 %</span></div></div>
          <div class="control-group"><label class="control-label" for="co2-source"><span>Fuente destacada</span></label><select id="co2-source" class="select-control"><option value="mobility">Movilidad</option><option value="energy">Edificios y energía</option><option value="mixed" selected>Fuente mixta</option></select><small class="co2-source-note" id="co2-source-note"></small></div>
          <div class="control-group"><label class="control-label" for="co2-measure"><span>Aplicar medida</span></label><select id="co2-measure" class="select-control">${Object.values(co2Measures).map(item => `<option value="${item.code}">${item.label}${item.effect ? ` · ${fmt(item.effect * 100, 0)}%` : ""}</option>`).join("")}</select></div>
          <div class="playback-controls"><button type="button" id="co2-play"></button><button type="button" id="co2-reset">Restablecer</button></div>
          <div class="co2-results" aria-live="polite">
            <div class="co2-result-pair"><article><span>Antes</span><strong id="co2-before"></strong></article><i aria-hidden="true">→</i><article><span>Después</span><strong id="co2-after"></strong></article></div>
            <p id="co2-reduction"></p><strong class="co2-status" id="co2-status"></strong>
          </div>
          <p class="didactic-note">Las ppm mostradas son una equivalencia visual: índice 70 = 431 ppm e índice 100 = 496 ppm. Se interpolan entre esos límites; no representan una medición ni un cálculo atmosférico.</p>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves de interpretación del dióxido de carbono">
        <article class="card info-card"><span class="info-icon" aria-hidden="true">↗</span><h2>Flujo y acumulación</h2><p>Las emisiones agregan CO₂ a la atmósfera. La concentración resulta del balance acumulado entre fuentes, mezcla y sumideros.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">≠</span><h2>CO₂ no es CO</h2><p>CO₂ es un gas de efecto invernadero. No es el monóxido de carbono ni se clasifica aquí con un semáforo sanitario local.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">☀</span><h2>Efecto climático</h2><p>Una mayor concentración de gases de efecto invernadero ralentiza la pérdida de energía hacia el espacio.</p></article>
      </section>
      <section class="card co2-reference-card">
        <div><p class="eyebrow">Contexto atmosférico independiente</p><h2>Tendencia global de CO₂</h2><p>Serie ilustrativa con valores redondeados a partir de observaciones globales. La referencia de 431 ppm corresponde a junio de 2026, sirve como límite inferior de la escala didáctica y no es un máximo colombiano de calidad del aire.</p></div>
        <svg class="co2-history" viewBox="0 0 520 150" role="img" aria-label="Tendencia creciente del dióxido de carbono atmosférico desde 1980 hasta 2026"><line x1="35" y1="122" x2="500" y2="122" stroke="#b6c4ca"/><line x1="35" y1="20" x2="35" y2="122" stroke="#b6c4ca"/><path d="M35 112 L134 97 L235 78 L336 58 L437 34 L500 20" fill="none" stroke="#506773" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 112 L134 97 L235 78 L336 58 L437 34 L500 20 L500 122 L35 122z" fill="#a9c5d1" opacity=".28"/><g fill="#506773">${[[35,112],[134,97],[235,78],[336,58],[437,34],[500,20]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g><text x="35" y="143" font-size="11" fill="#5f6f7a">1980 · ~339 ppm</text><text x="500" y="143" text-anchor="end" font-size="11" fill="#5f6f7a">jun. 2026 · 431 ppm</text></svg>
        <div class="standards-links"><a href="https://gml.noaa.gov/ccgg/trends/gl_full.html" target="_blank" rel="noopener">Serie global NOAA</a><a href="https://science.nasa.gov/earth/explore/earth-indicators/carbon-dioxide/" target="_blank" rel="noopener">Indicador de CO₂ de NASA</a><a href="https://science.nasa.gov/climate-change/causes/" target="_blank" rel="noopener">Efecto invernadero · NASA</a><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf" target="_blank" rel="noopener">Resolución 2254 de 2017</a></div>
      </section>`;

    const elements = {
      scene: document.getElementById("co2-scene"),
      badge: document.getElementById("co2-animation-badge"),
      activity: document.getElementById("co2-activity"),
      source: document.getElementById("co2-source"),
      measure: document.getElementById("co2-measure"),
      play: document.getElementById("co2-play")
    };

    function renderScene() {
      const result = experiment();
      lastScene = state.view === "sources" ? urbanScene(result) : climateScene();
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const result = experiment();
      document.querySelectorAll("[data-view]").forEach(button => {
        const active = button.dataset.view === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      document.getElementById("co2-scene-title").textContent = state.view === "sources" ? "De las fuentes a la atmósfera" : "Atmósfera y efecto invernadero";
      document.getElementById("co2-scene-note").textContent = state.view === "sources" ? "La cantidad de moléculas representa un flujo relativo, no una medición local." : "La energía se representa de forma cualitativa; no es un modelo climático numérico.";
      document.getElementById("co2-activity-readout").textContent = `${fmt(state.activity, 0)} %`;
      document.getElementById("co2-source-note").textContent = sourceLabels[state.source];
      elements.activity.value = state.activity;
      elements.source.value = state.source;
      elements.measure.value = state.measure;
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      document.getElementById("co2-before").textContent = `${fmt(result.beforePpm, 0)} ppm`;
      document.getElementById("co2-after").textContent = `${fmt(result.afterPpm, 0)} ppm`;
      document.getElementById("co2-reduction").textContent = result.reduction ? `${result.measure.code}: efecto relativo de −${fmt(result.reduction, 0)}% aplicado antes de convertir a ppm.` : "Sin medida: el valor recorre directamente la escala didáctica.";
      document.getElementById("co2-status").textContent = result.status;
      document.getElementById("co2-legend").innerHTML = state.view === "sources"
        ? `<span class="legend-item"><i class="legend-dot" style="--dot:#506773"></i>Flujo relativo de CO₂</span><span class="legend-item"><i class="legend-dot" style="--dot:#be3a34"></i>Movilidad</span><span class="legend-item"><i class="legend-dot" style="--dot:#8097a1"></i>Edificios y energía</span>`
        : `<span class="legend-item"><i class="legend-dot" style="--dot:#506773"></i>CO₂ atmosférico</span><span class="legend-item"><i class="legend-dot" style="--dot:#f4cc63"></i>Energía solar</span><span class="legend-item"><i class="legend-dot" style="--dot:#ef8b55"></i>Energía infrarroja</span>`;
      renderScene();
    }

    document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
    elements.activity.addEventListener("input", () => { state.activity = Number(elements.activity.value); render(); });
    elements.source.addEventListener("change", () => { state.source = elements.source.value; render(); });
    elements.measure.addEventListener("change", () => { state.measure = elements.measure.value; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("co2-reset").addEventListener("click", () => {
      Object.assign(state, { view: initialView, activity: 100, source: "mixed", measure: "none", playing: !reducedMotion, phase: 0 });
      render();
    });
    document.getElementById("co2-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) {
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      } else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
        history.back();
      } else {
        location.href = "index.html";
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "co2",
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        indices: { current: Number(currentIndex.toFixed(2)), before: Number(result.before.toFixed(2)), after: Number(result.after.toFixed(2)), base: 100 },
        displayPpm: { current: Number(currentPpm.toFixed(1)), before: Number(result.beforePpm.toFixed(1)), after: Number(result.afterPpm.toFixed(1)), anchors: { index70: 431, index100: 496 } },
        atmosphericReference: { value: 431, unit: "ppm", date: "junio de 2026", regulatoryLimit: false },
        activity: state.activity,
        source: state.source,
        measure: { code: result.measure.code, effectPercent: Number((result.measure.effect * 100).toFixed(1)) },
        reductionPercent: Number(result.reduction.toFixed(1)),
        status: result.status,
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        visible: { molecules: lastScene.molecules, emitters: lastScene.emitters, energyArrows: lastScene.energyArrows }
      });
    }

    window.RESOURCE = { kind: "co2-emissions-and-climate" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };

    let lastFrame = performance.now();
    function animateCo2(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateCo2);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateCo2);
  }

  function renderNoxLab(root) {
    const model = window.NoxModel;
    if (!model) throw new Error("NoxModel no está disponible");

    const params = new URLSearchParams(location.search);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const currentParam = Number(params.get("current"));
    const legacyParam = Number(params.get("value"));
    const hasCurrent = params.has("current") && Number.isFinite(currentParam);
    const hasLegacy = params.has("value") && Number.isFinite(legacyParam);
    const currentPpb = clamp(hasCurrent ? currentParam : hasLegacy ? legacyParam : model.baseline.nox, 0, 200);
    const initialExperiment = hasCurrent ? model.baseline.nox : hasLegacy ? clamp(legacyParam, 10, 120) : model.baseline.nox;
    const requestedView = params.get("view");
    const initialView = requestedView === "chemistry" ? "chemistry" : "sources";
    const colombiaLimit = model.colombiaOneHourUgM3;
    const colombiaLimitPpb = model.no2UgM3ToNoxPpb(colombiaLimit);
    const state = {
      view: initialView,
      concentration: initialExperiment,
      source: "mixed",
      measure: "none",
      covControl: false,
      playing: !reducedMotion,
      phase: 0
    };
    let lastScene = { noxMolecules: 0, covMolecules: 0, ozoneMolecules: 0, emitters: [], windArrows: 0 };

    const measureLabels = {
      none: "Sin medida",
      P1: "P1 · Zona de bajas emisiones",
      P2: "P2 · Buses eléctricos",
      P3: "P3 · Restricción vehicular",
      P4: "P4 · Ciclorrutas y vías peatonales",
      P6: "P6 · Corredores de ventilación",
      P9: "P9 · Teletrabajo y horarios"
    };
    const sourceLabels = {
      light: "Tráfico liviano: automóviles y viajes urbanos de combustión.",
      heavy: "Buses y carga: motores de mayor tamaño y operación intensiva.",
      stationary: "Combustión estacionaria: calderas, industria y generación térmica.",
      mixed: "Mezcla urbana: tráfico liviano, buses, carga y fuentes estacionarias."
    };

    function experiment() {
      const result = model.evaluateExperiment({
        noxPpb: state.concentration,
        measure: state.measure,
        covControl: state.covControl
      });
      const withinLimit = result.no2EquivalentAfter <= colombiaLimit + 1e-7;
      return {
        ...result,
        withinLimit,
        status: withinLimit ? "Dentro del máximo colombiano de 1 hora" : "Supera el máximo colombiano de 1 hora"
      };
    }

    function sourceFlags() {
      return {
        light: state.source === "light" || state.source === "mixed",
        heavy: state.source === "heavy" || state.source === "mixed",
        stationary: state.source === "stationary" || state.source === "mixed"
      };
    }

    function noxMoleculeMarkup(count, mode) {
      return Array.from({ length: count }, (_, index) => {
        const progress = (state.phase + index / count) % 1;
        let x;
        let y;
        if (mode === "chemistry") {
          x = 72 + ((index * 47 + progress * 190) % 284);
          y = 112 + ((index * 39) % 148) + Math.sin((progress + index) * Math.PI * 2) * 6;
        } else {
          const starts = [[78, 318], [240, 318], [432, 246]];
          const start = starts[index % starts.length];
          const eased = 1 - ((1 - progress) ** 2);
          x = start[0] + (584 - start[0]) * eased;
          y = start[1] + (116 - start[1]) * eased + Math.sin((progress + index) * Math.PI * 2) * 7;
        }
        return `<g class="nox-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="#2563a8" opacity=".9"/><text y="3.2" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">NOx</text></g>`;
      }).join("");
    }

    function covMoleculeMarkup(count) {
      return Array.from({ length: count }, (_, index) => {
        const progress = (state.phase * .82 + index / count) % 1;
        const x = 254 + ((index * 53 + progress * 175) % 286);
        const y = 126 + ((index * 31) % 142) + Math.cos((progress + index) * Math.PI * 2) * 6;
        return `<g class="cov-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="#7c4d9e" opacity=".88"/><text y="3.2" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">COV</text></g>`;
      }).join("");
    }

    function ozoneMoleculeMarkup(count) {
      return Array.from({ length: count }, (_, index) => {
        const progress = (state.phase * .66 + index / count) % 1;
        const x = 476 + ((index * 37 + progress * 92) % 168);
        const y = 112 + ((index * 43) % 168) + Math.sin((progress + index) * Math.PI * 2) * 5;
        return `<g class="ozone-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="10" fill="#d9822b" opacity=".9"/><text y="4" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">O₃</text></g>`;
      }).join("");
    }

    function sourcesScene(result) {
      const flags = sourceFlags();
      const noxCount = Math.round(7 + ratio(result.values.nox, 10, 120) * 21);
      const emitters = [flags.light ? "tráfico liviano" : null, flags.heavy ? "buses y carga" : null, flags.stationary ? "combustión estacionaria" : null].filter(Boolean);
      const carMarkup = [40, 112].map((x, index) => car(x, 324, index ? palette.blue : palette.red, .7)).join("");
      const busMarkup = `<g transform="translate(204 304)" opacity="${flags.heavy ? 1 : .22}"><rect width="118" height="43" rx="8" fill="#315f79"/><rect x="12" y="9" width="72" height="15" rx="3" fill="#c8e2eb"/><circle cx="24" cy="43" r="10" fill="#26343b"/><circle cx="94" cy="43" r="10" fill="#26343b"/><text x="93" y="22" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">BUS</text></g>`;
      const windArrows = state.measure === "P6" ? 4 : 0;
      const windMarkup = Array.from({ length: windArrows }, (_, index) => `<path d="M${44 + index * 118} ${75 + index % 2 * 28}h82" stroke="#319b9b" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)" opacity=".72"/>`).join("");
      const svg = svgFrame("Fuentes urbanas de NOx, mezcla atmosférica y punto de monitoreo de NO₂ equivalente", `
        <rect width="720" height="304" fill="url(#sky)"/>
        <rect width="720" height="118" fill="#cbe3ec" opacity=".48"/>
        ${buildings(304)}
        ${windMarkup}
        <g opacity="${flags.stationary ? 1 : .22}"><rect x="388" y="220" width="130" height="84" rx="5" fill="#6e8490"/><rect x="420" y="164" width="25" height="76" rx="3" fill="#526b77"/><path d="M469 220v-32l28 17 23-17v32" fill="#8297a0"/><text x="454" y="275" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">COMBUSTIÓN</text></g>
        <rect y="304" width="720" height="96" fill="${palette.road}"/>
        <line x1="0" y1="360" x2="720" y2="360" stroke="#f6df76" stroke-width="4" stroke-dasharray="28 22"/>
        <g opacity="${flags.light ? 1 : .22}">${carMarkup}</g>${busMarkup}
        ${noxMoleculeMarkup(noxCount, "sources")}
        <g transform="translate(558 45)"><rect width="142" height="112" rx="16" fill="#fff" stroke="#b9ced8"/><text x="71" y="23" text-anchor="middle" font-size="10" font-weight="900" fill="#5d7180">PUNTO DE MONITOREO</text><text x="71" y="58" text-anchor="middle" font-size="27" font-weight="900" fill="#17202a">${fmt(result.values.nox, 1)}</text><text x="71" y="76" text-anchor="middle" font-size="10" font-weight="800" fill="#5d7180">ppb NOx</text><text x="71" y="98" text-anchor="middle" font-size="11" font-weight="900" fill="#2563a8">≈ ${fmt(result.no2EquivalentAfter, 1)} µg/m³ NO₂</text></g>
        <g transform="translate(22 20)"><rect width="238" height="42" rx="14" fill="#fff" opacity=".94"/><circle cx="23" cy="21" r="7" fill="#2563a8"/><text x="39" y="18" font-size="10" font-weight="900" fill="#243740">NOx: familia precursora</text><text x="39" y="31" font-size="9" fill="#60737d">NO₂ equivalente: contexto de exposición</text></g>
      `, "#edf4f8");
      return { svg, noxMolecules: noxCount, covMolecules: 0, ozoneMolecules: 0, emitters, windArrows };
    }

    function chemistryScene(result) {
      const noxCount = Math.round(7 + ratio(result.values.nox, 10, 120) * 10);
      const covCount = Math.round(5 + ratio(result.values.cov, 10, model.baseline.cov) * 7);
      const ozoneCount = Math.round(6 + ratio(result.ozoneAfter, 15, 23) * 9);
      const windArrows = state.measure === "P6" ? 5 : 2;
      const windMarkup = Array.from({ length: windArrows }, (_, index) => `<path d="M${50 + index * 118} ${325 + index % 2 * 23}h78" stroke="#319b9b" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)" opacity="${state.measure === "P6" ? .85 : .4}"/>`).join("");
      const pulse = 5 + Math.sin(state.phase * Math.PI * 2) * 3;
      const svg = svgFrame("Química didáctica entre NOx, COV, radiación, ventilación y ozono troposférico", `
        <defs><linearGradient id="chem-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dceff6"/><stop offset="1" stop-color="#fff3cf"/></linearGradient></defs>
        <rect width="720" height="400" fill="url(#chem-sky)"/>
        <circle cx="626" cy="62" r="38" fill="#f4c64f"/><g stroke="#f4c64f" stroke-width="3" opacity=".7"><path d="M626 9v-9"/><path d="M676 24l18-13"/><path d="M680 75l25 5"/><path d="M575 25l-17-14"/></g>
        <path d="M357 80v230" stroke="#a9bcc5" stroke-width="2" stroke-dasharray="7 8"/>
        <text x="54" y="55" font-size="12" font-weight="900" fill="#2563a8">PRECURSORES</text><text x="474" y="55" font-size="12" font-weight="900" fill="#a35b10">OZONO RESULTANTE</text>
        ${noxMoleculeMarkup(noxCount, "chemistry")}${covMoleculeMarkup(covCount)}
        <path d="M330 202 C390 ${180 - pulse} 410 ${180 + pulse} 458 202" fill="none" stroke="#d9822b" stroke-width="6" stroke-linecap="round" marker-end="url(#arrow)"/>
        ${ozoneMoleculeMarkup(ozoneCount)}${windMarkup}
        <g transform="translate(28 278)"><rect width="294" height="39" rx="12" fill="#fff" opacity=".92"/><text x="147" y="16" text-anchor="middle" font-size="10" font-weight="900" fill="#425d69">NOx ${fmt(result.values.nox, 1)} ppb · COV ${fmt(result.values.cov, 1)} µg/m³</text><text x="147" y="30" text-anchor="middle" font-size="9" fill="#60737d">Balance químico simplificado del simulador</text></g>
        <g transform="translate(448 275)"><rect width="244" height="52" rx="13" fill="#fff" opacity=".94"/><text x="122" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#6b4a1c">O₃ ${fmt(result.ozoneBefore, 1)} → ${fmt(result.ozoneAfter, 1)} ppb</text><text x="122" y="38" text-anchor="middle" font-size="11" font-weight="900" fill="${result.ozoneChangePercent > 0 ? "#b6342f" : result.ozoneChangePercent < 0 ? "#16714a" : "#536773"}">${result.ozoneChangePercent > 0 ? "+" : ""}${fmt(result.ozoneChangePercent, 0)}%</text></g>
      `, "#edf4f8");
      return { svg, noxMolecules: noxCount, covMolecules: covCount, ozoneMolecules: ozoneCount, emitters: ["NOx", "COV", "radiación solar"], windArrows };
    }

    document.title = "Laboratorio de NOx, NO₂ y ozono";
    document.documentElement.style.setProperty("--accent", "#2563a8");
    document.documentElement.style.setProperty("--scene-tint", "#edf4f8");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell nox-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="nox-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio de química urbana</span></nav>
      <header class="resource-header nox-header"><div><p class="eyebrow">Combustión, exposición y química atmosférica</p><h1>NOx, NO₂ y formación de ozono</h1><p class="lead">Distingue la familia precursora NOx de la referencia de exposición a NO₂ y explora por qué el ozono responde al balance entre NOx, COV y ventilación.</p></div><div class="header-mark nox-mark" aria-hidden="true">NOx</div></header>
      <section class="nox-layout" aria-label="Laboratorio de óxidos de nitrógeno y ozono">
        <article class="card scene-card nox-scene-card">
          <div class="card-head"><div><h2 id="nox-scene-title"></h2><p id="nox-scene-note"></p></div><span class="live-badge" id="nox-animation-badge"></span></div>
          <div class="nox-view-tabs" role="tablist" aria-label="Vista del fenómeno"><button type="button" data-nox-view="sources" role="tab">Fuentes y exposición</button><button type="button" data-nox-view="chemistry" role="tab">Química del ozono</button></div>
          <div class="scene nox-scene" id="nox-scene"></div>
          <div class="scene-legend" id="nox-legend"></div>
          <div class="nox-context-grid"><article><span>NOx actual del simulador</span><strong>${fmt(currentPpb, 1)} <small>ppb</small></strong><small>Valor transferido; no se vuelve a reducir dentro del experimento.</small></article><article><span>NO₂ equivalente actual</span><strong>≈ ${fmt(model.noxPpbToNo2UgM3(currentPpb), 1)} <small>µg/m³</small></strong><small>Aproximación a 25 °C y 1 atm; no es una medición de especiación.</small></article></div>
        </article>
        <aside class="card control-card nox-controls">
          <div><h2>Experimenta</h2><p class="control-intro">Las medidas son demostrativas y no modifican tu plan.</p></div>
          <div class="control-group"><label class="control-label" for="nox-concentration"><span>Concentración experimental</span><span class="control-readout" id="nox-concentration-readout"></span></label><input id="nox-concentration" type="range" min="10" max="120" step="1"><div class="range-labels"><span>10 ppb</span><span>120 ppb</span></div></div>
          <div class="control-group"><label class="control-label" for="nox-source"><span>Fuente destacada</span></label><select id="nox-source" class="select-control"><option value="light">Tráfico liviano</option><option value="heavy">Buses y carga</option><option value="stationary">Combustión estacionaria</option><option value="mixed">Fuente mixta</option></select><small class="nox-source-note" id="nox-source-note"></small></div>
          <div class="control-group"><label class="control-label" for="nox-measure"><span>Medida sobre NOx</span></label><select id="nox-measure" class="select-control">${Object.entries(measureLabels).map(([code, label]) => { const effect = model.policyEffects(code).nox; return `<option value="${code}">${label}${effect ? ` · ${fmt(effect * 100, 0)}%` : ""}</option>`; }).join("")}</select></div>
          <label class="mitigation-toggle"><input id="nox-cov-control" type="checkbox"><span><strong>Aplicar P8 · Control de COV</strong><small>Reduce COV 35 % y permite observar la respuesta combinada de O₃.</small></span></label>
          <div class="playback-controls"><button type="button" id="nox-play"></button><button type="button" id="nox-reset">Restablecer</button></div>
          <section class="nox-results" aria-live="polite">
            <span class="measure-name" id="nox-measure-name"></span>
            <div class="nox-result-pair"><article><span>Antes</span><strong id="nox-before"></strong><small id="nox-before-no2"></small></article><i aria-hidden="true">→</i><article><span>Después</span><strong id="nox-after"></strong><small id="nox-after-no2"></small></article></div>
            <strong class="nox-reduction" id="nox-reduction"></strong>
            <div class="nox-reference"><div class="reference-track"><i id="nox-colombia-marker"><b>Colombia 1 h · 200</b></i><span class="value-marker" id="nox-value-marker"></span></div><strong id="nox-status"></strong></div>
            <div class="nox-ozone-result"><span>Respuesta de O₃</span><strong id="nox-ozone"></strong><small id="nox-ozone-note"></small></div>
          </section>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves de interpretación de NOx y NO₂"><article class="card info-card"><span class="info-icon" aria-hidden="true">NOx</span><h2>Familia precursora</h2><p>NOx representa óxidos de nitrógeno asociados principalmente con combustión y química atmosférica.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">NO₂</span><h2>Indicador de exposición</h2><p>NO₂ es una especie de NOx utilizada como indicador por su relación con efectos respiratorios.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">O₃</span><h2>Respuesta no lineal</h2><p>El ozono depende de NOx, COV, radiación y meteorología; controlar un precursor aislado puede producir respuestas distintas.</p></article></section>
      <section class="card nox-standards-card"><div><p class="eyebrow">Referencias con períodos distintos</p><h2>NO₂: exposición y calidad del aire</h2><p>Solo el máximo colombiano de una hora se compara con este escenario didáctico. Los valores anuales y de 24 horas son contexto y no reciben un estado.</p></div><div class="nox-standards-grid"><article><strong>Colombia</strong><span>200 µg/m³ · 1 hora</span><span>60 µg/m³ · anual</span><span>40 µg/m³ · anual desde 2030</span></article><article><strong>OMS 2021</strong><span>25 µg/m³ · 24 horas</span><span>10 µg/m³ · anual</span></article></div><div class="standards-links"><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf" target="_blank" rel="noopener">Resolución 2254 de 2017</a><a href="https://www.who.int/teams/environment-climate-change-and-health/air-quality-and-health/health-impacts/types-of-pollutants" target="_blank" rel="noopener">Guías OMS 2021</a><a href="https://www.epa.gov/no2-pollution/basic-information-about-no2" target="_blank" rel="noopener">NO₂ y NOx · EPA</a></div></section>`;

    const elements = {
      scene: document.getElementById("nox-scene"),
      badge: document.getElementById("nox-animation-badge"),
      concentration: document.getElementById("nox-concentration"),
      source: document.getElementById("nox-source"),
      measure: document.getElementById("nox-measure"),
      covControl: document.getElementById("nox-cov-control"),
      play: document.getElementById("nox-play")
    };

    function renderScene() {
      const result = experiment();
      lastScene = state.view === "sources" ? sourcesScene(result) : chemistryScene(result);
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const result = experiment();
      document.querySelectorAll("[data-nox-view]").forEach(button => {
        const active = button.dataset.noxView === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      document.getElementById("nox-scene-title").textContent = state.view === "sources" ? "De las fuentes al punto de monitoreo" : "Balance de precursores y ozono";
      document.getElementById("nox-scene-note").textContent = state.view === "sources" ? "La pluma representa la concentración efectiva después de la medida." : "La reacción es una simplificación determinista de las reglas del simulador.";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.concentration.value = state.concentration;
      elements.source.value = state.source;
      elements.measure.value = state.measure;
      elements.covControl.checked = state.covControl;
      document.getElementById("nox-concentration-readout").textContent = `${fmt(state.concentration, 0)} ppb`;
      document.getElementById("nox-source-note").textContent = sourceLabels[state.source];
      document.getElementById("nox-measure-name").textContent = `${measureLabels[state.measure]}${state.covControl ? " + P8" : ""}`;
      document.getElementById("nox-before").textContent = `${fmt(result.reference.nox, 1)} ppb`;
      document.getElementById("nox-after").textContent = `${fmt(result.values.nox, 1)} ppb`;
      document.getElementById("nox-before-no2").textContent = `≈ ${fmt(result.no2EquivalentBefore, 1)} µg/m³ NO₂`;
      document.getElementById("nox-after-no2").textContent = `≈ ${fmt(result.no2EquivalentAfter, 1)} µg/m³ NO₂`;
      document.getElementById("nox-reduction").textContent = result.reductionPercent ? `Reducción de NOx: ${fmt(result.reductionPercent, 0)} %` : "Sin cambio de NOx frente al escenario experimental";
      document.getElementById("nox-status").textContent = result.status;
      document.getElementById("nox-status").className = result.withinLimit ? "within" : "exceeds";
      const referenceMax = model.noxPpbToNo2UgM3(120);
      document.getElementById("nox-colombia-marker").style.left = `${clamp(colombiaLimit / referenceMax * 100, 0, 100)}%`;
      document.getElementById("nox-value-marker").style.left = `${clamp(result.no2EquivalentAfter / referenceMax * 100, 0, 100)}%`;
      const ozoneSign = result.ozoneChangePercent > 0 ? "+" : "";
      document.getElementById("nox-ozone").textContent = `${fmt(result.ozoneBefore, 1)} → ${fmt(result.ozoneAfter, 1)} ppb (${ozoneSign}${fmt(result.ozoneChangePercent, 0)} %)`;
      document.getElementById("nox-ozone").className = result.ozoneChangePercent > 0 ? "increase" : result.ozoneChangePercent < 0 ? "decrease" : "stable";
      document.getElementById("nox-ozone-note").textContent = result.ozoneChangePercent > 0 ? "La reducción aislada de NOx entra en el régimen simplificado que incrementa O₃." : result.ozoneChangePercent < 0 ? "El balance de COV o la ventilación reduce el O₃ en el modelo." : "La combinación no activa un cambio de O₃ en las reglas actuales.";
      document.getElementById("nox-legend").innerHTML = state.view === "sources" ? `<span class="legend-item"><i class="legend-dot" style="--dot:#2563a8"></i>NOx en la pluma</span><span class="legend-item"><i class="legend-dot" style="--dot:#319b9b"></i>Ventilación</span><span class="legend-item"><i class="legend-dot" style="--dot:#17202a"></i>NO₂ equivalente</span>` : `<span class="legend-item"><i class="legend-dot" style="--dot:#2563a8"></i>NOx</span><span class="legend-item"><i class="legend-dot" style="--dot:#7c4d9e"></i>COV</span><span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>O₃</span>`;
      renderScene();
    }

    const viewButtons = [...document.querySelectorAll("[data-nox-view]")];
    viewButtons.forEach((button, index) => {
      button.addEventListener("click", () => { state.view = button.dataset.noxView; render(); });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = viewButtons[(index + direction + viewButtons.length) % viewButtons.length];
        state.view = next.dataset.noxView;
        render();
        next.focus();
      });
    });
    elements.concentration.addEventListener("input", () => { state.concentration = Number(elements.concentration.value); render(); });
    elements.source.addEventListener("change", () => { state.source = elements.source.value; render(); });
    elements.measure.addEventListener("change", () => { state.measure = elements.measure.value; render(); });
    elements.covControl.addEventListener("change", () => { state.covControl = elements.covControl.checked; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("nox-reset").addEventListener("click", () => { Object.assign(state, { view: "sources", concentration: model.baseline.nox, source: "mixed", measure: "none", covControl: false, playing: !reducedMotion, phase: 0 }); render(); });
    document.getElementById("nox-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
      else location.href = "index.html";
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && embedded && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "nox",
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        current: { noxPpb: Number(currentPpb.toFixed(2)), no2EquivalentUgM3: Number(model.noxPpbToNo2UgM3(currentPpb).toFixed(2)) },
        experiment: { beforeNoxPpb: Number(result.reference.nox.toFixed(2)), afterNoxPpb: Number(result.values.nox.toFixed(2)), beforeNo2EquivalentUgM3: Number(result.no2EquivalentBefore.toFixed(2)), afterNo2EquivalentUgM3: Number(result.no2EquivalentAfter.toFixed(2)), reductionPercent: Number(result.reductionPercent.toFixed(1)), status: result.status },
        source: state.source,
        measures: { nox: state.measure, cov: state.covControl ? "P8" : "none" },
        chemistry: { covBeforeUgM3: Number(result.reference.cov.toFixed(2)), covAfterUgM3: Number(result.values.cov.toFixed(2)), windBeforeMs: Number(result.reference.wind.toFixed(2)), windAfterMs: Number(result.values.wind.toFixed(2)), ozoneBeforePpb: Number(result.ozoneBefore.toFixed(2)), ozoneAfterPpb: Number(result.ozoneAfter.toFixed(2)), ozoneChangePercent: Number(result.ozoneChangePercent.toFixed(1)), factors: Object.fromEntries(Object.entries(result.ozoneFactors).map(([key, value]) => [key, Number((value * 100).toFixed(1))])) },
        references: { colombiaOneHourUgM3: colombiaLimit, colombiaOneHourApproxPpb: Number(colombiaLimitPpb.toFixed(2)), contextualOnly: { colombiaAnnual: 60, colombiaAnnual2030: 40, whoAnnual: 10, who24h: 25 } },
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        visible: { noxMolecules: lastScene.noxMolecules, covMolecules: lastScene.covMolecules, ozoneMolecules: lastScene.ozoneMolecules, emitters: lastScene.emitters, windArrows: lastScene.windArrows }
      });
    }

    window.RESOURCE = { kind: "nox-no2-ozone" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };

    let lastFrame = performance.now();
    function animateNox(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateNox);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateNox);
  }

  function renderOzoneLab(root) {
    const model = window.NoxModel;
    if (!model) throw new Error("NoxModel no está disponible");

    const params = new URLSearchParams(location.search);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const currentParam = Number(params.get("current"));
    const legacyParam = Number(params.get("value"));
    const hasCurrent = params.has("current") && Number.isFinite(currentParam);
    const hasLegacy = params.has("value") && Number.isFinite(legacyParam);
    const currentPpb = clamp(hasCurrent ? currentParam : hasLegacy ? legacyParam : model.baseline.o3, 0, 100);
    const initialExperiment = hasCurrent ? model.baseline.o3 : hasLegacy ? clamp(legacyParam, 10, 60) : model.baseline.o3;
    const state = {
      view: params.get("view") === "exposure" ? "exposure" : "formation",
      concentration: initialExperiment,
      zone: "downwind",
      measure: "none",
      covControl: false,
      playing: !reducedMotion,
      phase: 0
    };
    const eightHourLimit = model.ozoneEightHourUgM3;
    const eightHourLimitPpb = model.o3UgM3ToPpb(eightHourLimit);
    const peakSeasonPpb = model.o3UgM3ToPpb(model.ozonePeakSeasonUgM3);
    let lastScene = { noxMolecules: 0, covMolecules: 0, ozoneMolecules: 0, windArrows: 0, receiver: state.zone, visibleEntities: [] };

    const measureLabels = {
      none: "Sin medida",
      P1: "P1 · Zona de bajas emisiones",
      P2: "P2 · Buses eléctricos",
      P3: "P3 · Restricción vehicular",
      P4: "P4 · Ciclorrutas y vías peatonales",
      P6: "P6 · Corredores de ventilación",
      P9: "P9 · Teletrabajo y horarios"
    };
    const zoneLabels = {
      near: "Cerca de las fuentes: predominan emisiones precursoras y la reacción aún está evolucionando.",
      background: "Fondo urbano: la mezcla integra aportes de varias fuentes y masas de aire.",
      downwind: "A sotavento: el tiempo de reacción y el transporte pueden separar el O₃ de sus fuentes precursoras."
    };

    function experiment() {
      const result = model.evaluateOzoneExperiment({ o3Ppb: state.concentration, measure: state.measure, covControl: state.covControl });
      const withinLimit = result.ozoneAfterUgM3 <= eightHourLimit + 1e-7;
      return {
        ...result,
        withinLimit,
        status: withinLimit ? "Dentro del máximo colombiano y de la guía OMS de 8 horas" : "Supera el máximo colombiano y la guía OMS de 8 horas"
      };
    }

    function precursorMarkup(result) {
      const noxCount = Math.round(5 + ratio(result.values.nox, 55, model.baseline.nox) * 7);
      const covCount = Math.round(4 + ratio(result.values.cov, 18, model.baseline.cov) * 6);
      const nox = Array.from({ length: noxCount }, (_, index) => {
        const progress = (state.phase * .88 + index / noxCount) % 1;
        const x = 82 + progress * 284;
        const y = 135 + (index % 4) * 28 + Math.sin((progress + index) * Math.PI * 2) * 6;
        return `<g class="o3-precursor" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="#2563a8" opacity=".9"/><text y="3" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">NOx</text></g>`;
      }).join("");
      const cov = Array.from({ length: covCount }, (_, index) => {
        const progress = (state.phase * .72 + index / covCount) % 1;
        const x = 105 + progress * 270;
        const y = 153 + (index % 4) * 27 + Math.cos((progress + index) * Math.PI * 2) * 5;
        return `<g class="o3-precursor" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="#7c4d9e" opacity=".88"/><text y="3" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">COV</text></g>`;
      }).join("");
      return { markup: nox + cov, noxCount, covCount };
    }

    function ozoneMarkup(result, mode) {
      const count = Math.round(7 + ratio(result.ozoneAfter, 10, 60) * 19);
      const markup = Array.from({ length: count }, (_, index) => {
        const progress = (state.phase * .64 + index / count) % 1;
        const x = mode === "formation" ? 338 + progress * 336 : 48 + ((index * 79 + progress * 210) % 620);
        const y = mode === "formation" ? 118 + (index % 6) * 30 + Math.sin((progress + index) * Math.PI * 2) * 6 : 78 + ((index * 43) % 210) + Math.sin((progress + index) * Math.PI * 2) * 5;
        return `<g class="o3-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="9" fill="#d9822b" opacity=".88"/><text y="3.5" text-anchor="middle" font-size="7.5" font-weight="900" fill="#fff">O₃</text></g>`;
      }).join("");
      return { markup, count };
    }

    function receiverMarkup() {
      const positions = { near: 190, background: 430, downwind: 620 };
      const labels = { near: "CERCA DE FUENTES", background: "FONDO URBANO", downwind: "A SOTAVENTO" };
      return Object.entries(positions).map(([zone, x]) => {
        const active = zone === state.zone;
        return `<g transform="translate(${x} 306)" opacity="${active ? 1 : .38}"><circle r="${active ? 15 : 10}" fill="${active ? "#d9822b" : "#71838c"}"/><path d="M0 15v28" stroke="#33434c" stroke-width="5"/><rect x="-20" y="43" width="40" height="24" rx="5" fill="#fff" stroke="#a8b8bf"/><text y="83" text-anchor="middle" font-size="8" font-weight="900" fill="#425660">${labels[zone]}</text></g>`;
      }).join("");
    }

    function formationScene(result) {
      const precursors = precursorMarkup(result);
      const ozone = ozoneMarkup(result, "formation");
      const windArrows = state.measure === "P6" ? 5 : 3;
      const windShift = state.phase * 26;
      const wind = Array.from({ length: windArrows }, (_, index) => `<path d="M${245 + index * 91 + windShift % 28} ${68 + index % 2 * 26}h58" stroke="#319b9b" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)" opacity="${state.measure === "P6" ? .88 : .5}"/>`).join("");
      const sunPulse = 35 + Math.sin(state.phase * Math.PI * 2) * 3;
      const svg = svgFrame("Formación secundaria y transporte de ozono desde fuentes precursoras hasta receptores urbanos", `
        <defs><linearGradient id="ozone-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dceef5"/><stop offset="1" stop-color="#fff1ce"/></linearGradient></defs>
        <rect width="720" height="400" fill="url(#ozone-sky)"/>
        <circle cx="642" cy="54" r="${sunPulse.toFixed(1)}" fill="#f0c75e"/><g stroke="#f0c75e" stroke-width="3" opacity=".65"><path d="M642 7V0"/><path d="M688 25l18-10"/><path d="M594 24l-16-10"/></g>
        <path d="M82 224 C224 108 382 102 675 176" fill="none" stroke="#d9822b" stroke-width="34" opacity=".08" stroke-linecap="round"/>
        ${wind}
        <g transform="translate(28 238)"><rect width="122" height="66" rx="5" fill="#728a96"/><rect x="17" y="-42" width="25" height="49" rx="3" fill="#506773"/><path d="M61 0v-26l27 15 24-15V0" fill="#879ca5"/><text x="61" y="40" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">FUENTES</text></g>
        ${car(145, 276, palette.red, .62)}${car(205, 280, palette.blue, .55)}
        <path d="M58 222 C190 112 298 122 376 175" fill="none" stroke="#7c4d9e" stroke-width="3" stroke-dasharray="8 9" opacity=".45"/>
        <path d="M354 178 C445 112 556 118 682 168" fill="none" stroke="#d9822b" stroke-width="5" stroke-linecap="round" marker-end="url(#arrow)" opacity=".75"/>
        ${precursors.markup}${ozone.markup}
        <g transform="translate(270 22)"><rect width="258" height="42" rx="14" fill="#fff" opacity=".94"/><text x="129" y="17" text-anchor="middle" font-size="10" font-weight="900" fill="#536773">NOx + COV + radiación solar</text><text x="129" y="31" text-anchor="middle" font-size="9" fill="#687a84">Formación secundaria · representación didáctica</text></g>
        <rect y="304" width="720" height="96" fill="#e7e2d4"/>${receiverMarkup()}
      `, "#f7f3e8");
      return { svg, noxMolecules: precursors.noxCount, covMolecules: precursors.covCount, ozoneMolecules: ozone.count, windArrows, receiver: state.zone, visibleEntities: ["fuentes precursoras", "radiación solar", "parcela de aire", "tres receptores"] };
    }

    function exposureScene(result) {
      const ozone = ozoneMarkup(result, "exposure");
      const markerX = 75 + clamp(result.ozoneAfterUgM3 / model.o3PpbToUgM3(60), 0, 1) * 570;
      const referenceX = 75 + clamp(eightHourLimit / model.o3PpbToUgM3(60), 0, 1) * 570;
      const svg = svgFrame("Exposición urbana y de vegetación a una concentración equivalente de ozono de ocho horas", `
        <rect width="720" height="278" fill="url(#sky)"/>${ozone.markup}
        <g transform="translate(48 132)"><rect width="176" height="119" rx="17" fill="#fff" stroke="#c5d3d8"/><text x="88" y="24" text-anchor="middle" font-size="9" font-weight="900" fill="#637780">PROMEDIO DIDÁCTICO · 8 H</text><text x="88" y="61" text-anchor="middle" font-size="29" font-weight="900" fill="#d16f1d">${fmt(result.ozoneAfter, 1)}</text><text x="88" y="80" text-anchor="middle" font-size="10" font-weight="800" fill="#637780">ppb O₃</text><text x="88" y="102" text-anchor="middle" font-size="12" font-weight="900" fill="#7a5625">≈ ${fmt(result.ozoneAfterUgM3, 1)} µg/m³</text></g>
        <g transform="translate(330 161)"><circle cx="0" cy="-30" r="17" fill="#d6a98f"/><path d="M0-13v62m0-34-28 25m28-25 27 22m-27 12-23 45m23-45 26 45" fill="none" stroke="#3c5968" stroke-width="9" stroke-linecap="round"/><text x="0" y="110" text-anchor="middle" font-size="9" font-weight="900" fill="#536773">PERSONAS</text></g>
        ${tree(484, 201, .85)}${tree(581, 209, .72)}
        <rect y="278" width="720" height="122" fill="#fff"/>
        <text x="42" y="309" font-size="10" font-weight="900" fill="#536773">REFERENCIA DE 8 HORAS · µg/m³</text>
        <line x1="75" y1="350" x2="645" y2="350" stroke="#d7dee2" stroke-width="13" stroke-linecap="round"/><line x1="75" y1="350" x2="${referenceX.toFixed(1)}" y2="350" stroke="#69b891" stroke-width="13" stroke-linecap="round"/><line x1="${referenceX.toFixed(1)}" y1="350" x2="645" y2="350" stroke="#d45850" stroke-width="13" stroke-linecap="round"/>
        <path d="M${referenceX.toFixed(1)} 329v39" stroke="#7b3e36" stroke-width="2"/><text x="${(referenceX - 5).toFixed(1)}" y="324" text-anchor="end" font-size="9" font-weight="900" fill="#7b3e36">100 · Colombia y OMS</text>
        <circle cx="${markerX.toFixed(1)}" cy="350" r="10" fill="#17202a" stroke="#fff" stroke-width="3"/><text x="${markerX.toFixed(1)}" y="384" text-anchor="middle" font-size="10" font-weight="900" fill="#17202a">${fmt(result.ozoneAfterUgM3, 1)}</text>
      `, "#edf4f5");
      return { svg, noxMolecules: 0, covMolecules: 0, ozoneMolecules: ozone.count, windArrows: 0, receiver: state.zone, visibleEntities: ["monitor de 8 horas", "personas", "vegetación", "barra Colombia y OMS"] };
    }

    document.title = "Laboratorio de ozono troposférico";
    document.documentElement.style.setProperty("--accent", "#d16f1d");
    document.documentElement.style.setProperty("--scene-tint", "#f7f3e8");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell o3-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="o3-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio de química y transporte</span></nav>
      <header class="resource-header o3-header"><div><p class="eyebrow">Contaminante secundario y exposición urbana</p><h1>Ozono troposférico: formación, transporte y exposición</h1><p class="lead">Observa cómo los precursores reaccionan bajo la luz solar, cómo el O₃ puede desplazarse a sotavento y cómo responden las concentraciones de 8 horas a las medidas del simulador.</p></div><div class="header-mark o3-mark" aria-hidden="true">O₃</div></header>
      <section class="o3-layout" aria-label="Laboratorio de ozono troposférico">
        <article class="card scene-card o3-scene-card">
          <div class="card-head"><div><h2 id="o3-scene-title"></h2><p id="o3-scene-note"></p></div><span class="live-badge" id="o3-animation-badge"></span></div>
          <div class="o3-view-tabs" role="tablist" aria-label="Vista del fenómeno"><button type="button" data-o3-view="formation" role="tab">Formación y transporte</button><button type="button" data-o3-view="exposure" role="tab">Exposición y referencias</button></div>
          <div class="scene o3-scene" id="o3-scene"></div>
          <div class="scene-legend" id="o3-legend"></div>
          <div class="o3-context-grid"><article><span>O₃ actual del simulador</span><strong>${fmt(currentPpb, 1)} <small>ppb</small></strong><small>Estado transferido; el experimento inicia en su propia base.</small></article><article><span>Conversión aproximada</span><strong>≈ ${fmt(model.o3PpbToUgM3(currentPpb), 1)} <small>µg/m³</small></strong><small>A 25 °C y 1 atm; es una conversión de unidades, no otra respuesta química.</small></article></div>
        </article>
        <aside class="card control-card o3-controls">
          <div><h2>Experimenta</h2><p class="control-intro">Las medidas son demostrativas y no modifican tu plan.</p></div>
          <div class="control-group"><label class="control-label" for="o3-concentration"><span>Concentración experimental</span><span class="control-readout" id="o3-concentration-readout"></span></label><input id="o3-concentration" type="range" min="10" max="60" step="0.1"><div class="range-labels"><span>10 ppb</span><span>60 ppb</span></div></div>
          <div class="control-group"><label class="control-label" for="o3-zone"><span>Zona observada</span></label><select id="o3-zone" class="select-control"><option value="near">Cerca de las fuentes</option><option value="background">Fondo urbano</option><option value="downwind">A sotavento</option></select><small class="o3-zone-note" id="o3-zone-note"></small></div>
          <div class="control-group"><label class="control-label" for="o3-measure"><span>Medida sobre NOx</span></label><select id="o3-measure" class="select-control">${Object.entries(measureLabels).map(([code, label]) => `<option value="${code}">${label}</option>`).join("")}</select></div>
          <label class="mitigation-toggle"><input id="o3-cov-control" type="checkbox"><span><strong>Aplicar P8 · Control de COV</strong><small>Reduce COV 35 % y permite explorar la respuesta combinada.</small></span></label>
          <div class="playback-controls"><button type="button" id="o3-play"></button><button type="button" id="o3-reset">Restablecer</button></div>
          <section class="o3-results" aria-live="polite">
            <span class="measure-name" id="o3-measure-name"></span>
            <div class="o3-result-pair"><article><span>Antes</span><strong id="o3-before"></strong><small id="o3-before-ug"></small></article><i aria-hidden="true">→</i><article><span>Después</span><strong id="o3-after"></strong><small id="o3-after-ug"></small></article></div>
            <strong class="o3-change" id="o3-change"></strong>
            <div class="o3-reference"><div class="reference-track"><i id="o3-limit-marker"><b>8 h · 100 µg/m³</b></i><span class="value-marker" id="o3-value-marker"></span></div><strong id="o3-status"></strong></div>
            <p class="o3-result-note" id="o3-result-note"></p>
          </section>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves de interpretación del ozono"><article class="card info-card"><span class="info-icon" aria-hidden="true">NOx+COV</span><h2>No se emite directamente</h2><p>El O₃ troposférico se forma mediante reacciones entre precursores en presencia de radiación solar.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">→</span><h2>Puede viajar</h2><p>La mezcla y el tiempo de reacción pueden desplazar las concentraciones hacia comunidades a sotavento.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">8 h</span><h2>Período comparable</h2><p>El resultado se interpreta como un promedio didáctico equivalente de 8 horas, no como una lectura instantánea.</p></article></section>
      <section class="card o3-standards-card"><div><p class="eyebrow">Referencias comparables</p><h2>O₃: calidad del aire y exposición</h2><p>Colombia y la OMS establecen 100 µg/m³ para 8 horas. La guía OMS de 60 µg/m³ para temporada pico se muestra solo como contexto.</p></div><div class="o3-standards-grid"><article><strong>Colombia</strong><span>100 µg/m³ · 8 horas</span><span>≈ ${fmt(eightHourLimitPpb, 1)} ppb a 25 °C y 1 atm</span></article><article><strong>OMS 2021</strong><span>100 µg/m³ · 8 horas</span><span>60 µg/m³ · temporada pico · ≈ ${fmt(peakSeasonPpb, 1)} ppb</span></article></div><p class="o3-stratosphere-note"><strong>Dos ubicaciones, dos funciones:</strong> aquí se estudia el ozono troposférico perjudicial. El ozono estratosférico ayuda a filtrar parte de la radiación ultravioleta.</p><div class="standards-links"><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf" target="_blank" rel="noopener">Resolución 2254 de 2017</a><a href="https://www.who.int/news-room/questions-and-answers/item/who-global-air-quality-guidelines" target="_blank" rel="noopener">Guías OMS 2021</a><a href="https://www.epa.gov/ground-level-ozone-pollution/ground-level-ozone-basics" target="_blank" rel="noopener">Ozono troposférico · EPA</a></div></section>`;

    const elements = {
      scene: document.getElementById("o3-scene"), badge: document.getElementById("o3-animation-badge"), concentration: document.getElementById("o3-concentration"), zone: document.getElementById("o3-zone"), measure: document.getElementById("o3-measure"), covControl: document.getElementById("o3-cov-control"), play: document.getElementById("o3-play")
    };

    function renderScene() {
      const result = experiment();
      lastScene = state.view === "formation" ? formationScene(result) : exposureScene(result);
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const result = experiment();
      document.querySelectorAll("[data-o3-view]").forEach(button => {
        const active = button.dataset.o3View === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      document.getElementById("o3-scene-title").textContent = state.view === "formation" ? "De los precursores al receptor" : "Concentración y referencia de 8 horas";
      document.getElementById("o3-scene-note").textContent = state.view === "formation" ? "La radiación es una condición necesaria; la química y la ventilación usan las reglas compartidas del simulador." : "La escena representa exposición ambiental y no una dosis fisiológica exacta.";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.concentration.value = state.concentration;
      elements.zone.value = state.zone;
      elements.measure.value = state.measure;
      elements.covControl.checked = state.covControl;
      document.getElementById("o3-concentration-readout").textContent = `${fmt(state.concentration, 1)} ppb`;
      document.getElementById("o3-zone-note").textContent = zoneLabels[state.zone];
      document.getElementById("o3-measure-name").textContent = `${measureLabels[state.measure]}${state.covControl ? " + P8" : ""}`;
      document.getElementById("o3-before").textContent = `${fmt(result.ozoneBefore, 1)} ppb`;
      document.getElementById("o3-after").textContent = `${fmt(result.ozoneAfter, 1)} ppb`;
      document.getElementById("o3-before-ug").textContent = `≈ ${fmt(result.ozoneBeforeUgM3, 1)} µg/m³`;
      document.getElementById("o3-after-ug").textContent = `≈ ${fmt(result.ozoneAfterUgM3, 1)} µg/m³`;
      const sign = result.ozoneChangePercent > 0 ? "+" : "";
      document.getElementById("o3-change").textContent = result.ozoneChangePercent ? `Cambio frente al escenario base: ${sign}${fmt(result.ozoneChangePercent, 0)} %` : "Sin cambio frente al escenario base";
      document.getElementById("o3-change").className = `o3-change ${result.ozoneChangePercent > 0 ? "increase" : result.ozoneChangePercent < 0 ? "decrease" : "stable"}`;
      document.getElementById("o3-status").textContent = `${result.status} · ${fmt(result.ozoneAfterUgM3, 1)} µg/m³`;
      document.getElementById("o3-status").className = result.withinLimit ? "within" : "exceeds";
      const referenceMax = model.o3PpbToUgM3(60);
      document.getElementById("o3-limit-marker").style.left = `${clamp(eightHourLimit / referenceMax * 100, 0, 100)}%`;
      document.getElementById("o3-value-marker").style.left = `${clamp(result.ozoneAfterUgM3 / referenceMax * 100, 0, 100)}%`;
      document.getElementById("o3-result-note").textContent = result.ozoneChangePercent > 0 ? "La reducción aislada de NOx activa el régimen simplificado que puede aumentar O₃." : result.ozoneChangePercent < 0 ? "El control suficiente de COV o la ventilación disminuye O₃ en el modelo." : "La combinación seleccionada no activa un cambio de O₃ en las reglas actuales.";
      document.getElementById("o3-legend").innerHTML = state.view === "formation" ? `<span class="legend-item"><i class="legend-dot" style="--dot:#2563a8"></i>NOx</span><span class="legend-item"><i class="legend-dot" style="--dot:#7c4d9e"></i>COV</span><span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>O₃</span><span class="legend-item"><i class="legend-dot" style="--dot:#319b9b"></i>Transporte</span>` : `<span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>O₃ ambiental</span><span class="legend-item"><i class="legend-dot" style="--dot:#69b891"></i>Dentro de 100 µg/m³</span><span class="legend-item"><i class="legend-dot" style="--dot:#d45850"></i>Supera 100 µg/m³</span>`;
      renderScene();
    }

    const viewButtons = [...document.querySelectorAll("[data-o3-view]")];
    viewButtons.forEach((button, index) => {
      button.addEventListener("click", () => { state.view = button.dataset.o3View; render(); });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = viewButtons[(index + direction + viewButtons.length) % viewButtons.length];
        state.view = next.dataset.o3View;
        render();
        next.focus();
      });
    });
    elements.concentration.addEventListener("input", () => { state.concentration = Number(elements.concentration.value); render(); });
    elements.zone.addEventListener("change", () => { state.zone = elements.zone.value; render(); });
    elements.measure.addEventListener("change", () => { state.measure = elements.measure.value; render(); });
    elements.covControl.addEventListener("change", () => { state.covControl = elements.covControl.checked; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("o3-reset").addEventListener("click", () => { Object.assign(state, { view: "formation", concentration: model.baseline.o3, zone: "downwind", measure: "none", covControl: false, playing: !reducedMotion, phase: 0 }); render(); });
    document.getElementById("o3-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
      else location.href = "index.html";
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && embedded && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "o3",
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        current: { ozonePpb: Number(currentPpb.toFixed(2)), ozoneUgM3: Number(model.o3PpbToUgM3(currentPpb).toFixed(2)) },
        experiment: { beforeOzonePpb: Number(result.ozoneBefore.toFixed(3)), afterOzonePpb: Number(result.ozoneAfter.toFixed(3)), beforeOzoneUgM3: Number(result.ozoneBeforeUgM3.toFixed(3)), afterOzoneUgM3: Number(result.ozoneAfterUgM3.toFixed(3)), changePercent: Number(result.ozoneChangePercent.toFixed(1)), status: result.status },
        zone: state.zone,
        measures: { nox: state.measure, cov: state.covControl ? "P8" : "none" },
        chemistry: { noxBeforePpb: Number(result.reference.nox.toFixed(2)), noxAfterPpb: Number(result.values.nox.toFixed(2)), covBeforeUgM3: Number(result.reference.cov.toFixed(2)), covAfterUgM3: Number(result.values.cov.toFixed(2)), windBeforeMs: Number(result.reference.wind.toFixed(2)), windAfterMs: Number(result.values.wind.toFixed(2)), factors: Object.fromEntries(Object.entries(result.ozoneFactors).map(([key, value]) => [key, Number((value * 100).toFixed(1))])) },
        references: { colombiaEightHourUgM3: eightHourLimit, whoEightHourUgM3: eightHourLimit, contextualOnly: { whoPeakSeasonUgM3: model.ozonePeakSeasonUgM3 } },
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        visible: { noxMolecules: lastScene.noxMolecules, covMolecules: lastScene.covMolecules, ozoneMolecules: lastScene.ozoneMolecules, windArrows: lastScene.windArrows, receiver: lastScene.receiver, entities: lastScene.visibleEntities }
      });
    }

    window.RESOURCE = { kind: "ozone-formation-transport-exposure" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };

    let lastFrame = performance.now();
    function animateOzone(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateOzone);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateOzone);
  }

  function renderCovLab(root) {
    const model = window.NoxModel;
    if (!model) throw new Error("NoxModel no está disponible");

    const params = new URLSearchParams(location.search);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const currentParam = Number(params.get("current"));
    const legacyParam = Number(params.get("value"));
    const hasCurrent = params.has("current") && Number.isFinite(currentParam);
    const hasLegacy = params.has("value") && Number.isFinite(legacyParam);
    const currentCov = clamp(hasCurrent ? currentParam : hasLegacy ? legacyParam : model.baseline.cov, 0, 100);
    const initialExperiment = hasCurrent ? model.baseline.cov : hasLegacy ? clamp(legacyParam, 5, 50) : model.baseline.cov;
    const state = {
      view: params.get("view") === "fate" ? "fate" : "sources",
      concentration: initialExperiment,
      source: "mixed",
      measure: "none",
      covControl: false,
      playing: !reducedMotion,
      phase: 0
    };
    let lastScene = { covMolecules: 0, ozoneMolecules: 0, aerosolParticles: 0, captureDevices: 0, emitters: [] };

    const measureLabels = {
      none: "Sin medida complementaria",
      P1: "P1 · Zona de bajas emisiones",
      P2: "P2 · Buses eléctricos",
      P3: "P3 · Restricción vehicular",
      P4: "P4 · Ciclorrutas y vías peatonales",
      P5: "P5 · Arborización urbana",
      P6: "P6 · Corredores de ventilación",
      P9: "P9 · Teletrabajo y horarios"
    };
    const sourceLabels = {
      fuels: "Combustibles y tráfico: vapores de gasolina, almacenamiento y combustión urbana.",
      solvents: "Solventes y recubrimientos: pinturas, tintas, adhesivos y limpieza industrial.",
      products: "Productos y limpieza: fragancias, aerosoles, desengrasantes y productos de consumo.",
      mixed: "Mezcla urbana: combina combustibles, solventes, comercio, industria y productos volátiles."
    };

    function experiment() {
      const result = model.evaluateCovExperiment({ covUgM3: state.concentration, measure: state.measure, covControl: state.covControl });
      return {
        ...result,
        status: result.reductionPercent ? `Reducción de ${fmt(result.reductionPercent, 0)} % respecto a la base experimental` : "Sin cambio respecto a la base experimental"
      };
    }

    function sourceFlags() {
      return {
        fuels: state.source === "fuels" || state.source === "mixed",
        solvents: state.source === "solvents" || state.source === "mixed",
        products: state.source === "products" || state.source === "mixed"
      };
    }

    function covMoleculeMarkup(result, mode) {
      const count = Math.round(6 + ratio(result.covAfter, 5, 50) * 18);
      const colors = state.source === "fuels" ? ["#315f79"] : state.source === "solvents" ? ["#7c4d9e"] : state.source === "products" ? ["#c05283"] : ["#315f79", "#7c4d9e", "#c05283"];
      const starts = state.source === "fuels" ? [[86, 265]] : state.source === "solvents" ? [[300, 252]] : state.source === "products" ? [[500, 252]] : [[86, 265], [300, 252], [500, 252]];
      const markup = Array.from({ length: count }, (_, index) => {
        const progress = (state.phase * .72 + index / count) % 1;
        let x;
        let y;
        if (mode === "sources") {
          const start = starts[index % starts.length];
          x = start[0] + (650 - start[0]) * progress;
          y = start[1] + (118 - start[1]) * progress + Math.sin((progress + index) * Math.PI * 2) * 7;
        } else if (index % 2 === 0) {
          x = 42 + progress * 274;
          y = 115 + (index % 5) * 34 + Math.sin((progress + index) * Math.PI * 2) * 6;
        } else {
          x = 378 + progress * 285;
          y = 132 + (index % 5) * 31 + Math.cos((progress + index) * Math.PI * 2) * 6;
        }
        const color = colors[index % colors.length];
        return `<g class="cov-lab-molecule" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="${color}" opacity=".88"/><text y="3" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">COV</text></g>`;
      }).join("");
      return { markup, count };
    }

    function sourcesScene(result) {
      const flags = sourceFlags();
      const molecules = covMoleculeMarkup(result, "sources");
      const captureDevices = state.covControl ? 3 : 0;
      const capture = state.covControl ? `
        <g fill="none" stroke="#188b5b" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M88 230v-42h72"/><path d="M300 220v-42h70"/><path d="M500 220v-42h70"/></g>
        <g fill="#188b5b"><circle cx="160" cy="188" r="9"/><circle cx="370" cy="178" r="9"/><circle cx="570" cy="178" r="9"/></g>
        <g transform="translate(215 20)"><rect width="292" height="43" rx="14" fill="#e6f5ed" stroke="#9bcdb5"/><text x="146" y="17" text-anchor="middle" font-size="10" font-weight="900" fill="#176b48">P8 · control directo en la fuente</text><text x="146" y="31" text-anchor="middle" font-size="9" fill="#4c6c5b">Sustitución · contención · recuperación de vapores</text></g>` : `
        <g transform="translate(248 20)"><rect width="224" height="40" rx="14" fill="#fff" opacity=".93"/><text x="112" y="16" text-anchor="middle" font-size="10" font-weight="900" fill="#704985">Emisiones sin control directo</text><text x="112" y="29" text-anchor="middle" font-size="9" fill="#6e7180">Evaporación y fugas hacia el aire</text></g>`;
      const svg = svgFrame("Fuentes urbanas de compuestos orgánicos volátiles y estrategias de control en la fuente", `
        <rect width="720" height="306" fill="url(#sky)"/>${capture}
        <g opacity="${flags.fuels ? 1 : .24}" transform="translate(22 190)"><rect width="142" height="94" rx="7" fill="#d7e0e4"/><rect x="18" y="25" width="47" height="51" rx="5" fill="#315f79"/><path d="M65 38h28v39" fill="none" stroke="#315f79" stroke-width="7"/><text x="98" y="27" text-anchor="middle" font-size="9" font-weight="900" fill="#315f79">COMBUSTIBLES</text>${car(75, 58, palette.red, .62)}</g>
        <g opacity="${flags.solvents ? 1 : .24}" transform="translate(220 188)"><rect width="166" height="96" rx="7" fill="#ddd2e5"/><path d="M0 24 34 5l34 19 34-19 35 19" fill="#8a679f"/><g transform="translate(21 51)"><rect width="38" height="34" rx="5" fill="#7c4d9e"/><rect x="65" width="38" height="34" rx="5" fill="#9a6db6"/><text x="62" y="-8" text-anchor="middle" font-size="9" font-weight="900" fill="#67427b">SOLVENTES</text></g></g>
        <g opacity="${flags.products ? 1 : .24}" transform="translate(428 188)"><rect width="145" height="96" rx="7" fill="#f0dce6"/><rect x="22" y="36" width="28" height="49" rx="7" fill="#c05283"/><rect x="61" y="24" width="28" height="61" rx="7" fill="#d47ca4"/><rect x="100" y="44" width="24" height="41" rx="7" fill="#a84772"/><text x="72" y="16" text-anchor="middle" font-size="9" font-weight="900" fill="#8c3e63">PRODUCTOS</text></g>
        ${molecules.markup}
        <g transform="translate(578 53)"><rect width="124" height="100" rx="15" fill="#fff" stroke="#d1c4d9"/><text x="62" y="20" text-anchor="middle" font-size="9" font-weight="900" fill="#6e6077">MEZCLA EQUIVALENTE</text><text x="62" y="55" text-anchor="middle" font-size="25" font-weight="900" fill="#7c4d9e">${fmt(result.covAfter, 1)}</text><text x="62" y="73" text-anchor="middle" font-size="10" font-weight="800" fill="#6e6077">µg/m³ COV</text><text x="62" y="89" text-anchor="middle" font-size="8" fill="#7b7680">valor didáctico</text></g>
        <rect y="306" width="720" height="94" fill="#fff"/><text x="35" y="336" font-size="10" font-weight="900" fill="#6c6173">DE LA ACTIVIDAD A LA CONCENTRACIÓN</text><text x="35" y="360" font-size="11" fill="#5f6f7a">Uso y almacenamiento</text><path d="M174 356h70" stroke="#7c4d9e" stroke-width="4" marker-end="url(#arrow)"/><text x="269" y="360" font-size="11" fill="#5f6f7a">Masa emitida</text><path d="M372 356h70" stroke="#7c4d9e" stroke-width="4" marker-end="url(#arrow)"/><text x="468" y="360" font-size="11" fill="#5f6f7a">Concentración en el aire</text>
      `, "#f4eef7");
      const emitters = [flags.fuels ? "combustibles y tráfico" : null, flags.solvents ? "solventes y recubrimientos" : null, flags.products ? "productos y limpieza" : null].filter(Boolean);
      return { svg, covMolecules: molecules.count, ozoneMolecules: 0, aerosolParticles: 0, captureDevices, emitters };
    }

    function fateScene(result) {
      const molecules = covMoleculeMarkup(result, "fate");
      const ozoneCount = Math.round(5 + ratio(result.ozoneAfter, 15, 23) * 9);
      const aerosolCount = Math.round(4 + ratio(result.covAfter, 5, 50) * 8);
      const ozoneMarkup = Array.from({ length: ozoneCount }, (_, index) => {
        const progress = (state.phase * .58 + index / ozoneCount) % 1;
        const x = 500 + ((index * 47 + progress * 90) % 165);
        const y = 104 + ((index * 39) % 130) + Math.sin((progress + index) * Math.PI * 2) * 5;
        return `<g class="cov-product" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="9" fill="#d9822b" opacity=".9"/><text y="3.5" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">O₃</text></g>`;
      }).join("");
      const aerosolMarkup = Array.from({ length: aerosolCount }, (_, index) => {
        const progress = (state.phase * .46 + index / aerosolCount) % 1;
        const x = 460 + ((index * 61 + progress * 80) % 205);
        const y = 240 + ((index * 29) % 75);
        return `<circle class="cov-product" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${3 + index % 3}" fill="#677b85" opacity=".68"/>`;
      }).join("");
      const pulse = 4 + Math.sin(state.phase * Math.PI * 2) * 3;
      const svg = svgFrame("Exposición cercana y transformación atmosférica simplificada de una mezcla de compuestos orgánicos volátiles", `
        <defs><linearGradient id="cov-fate-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e8f6"/><stop offset="1" stop-color="#fff2cf"/></linearGradient></defs><rect width="720" height="400" fill="url(#cov-fate-sky)"/>
        <path d="M350 32v336" stroke="#c7b9cf" stroke-width="2" stroke-dasharray="8 8"/><text x="36" y="42" font-size="12" font-weight="900" fill="#704985">EXPOSICIÓN CERCA DE LA FUENTE</text><text x="390" y="42" font-size="12" font-weight="900" fill="#8a5b1e">TRANSFORMACIÓN ATMOSFÉRICA</text>
        <g transform="translate(35 220)"><rect width="108" height="83" rx="8" fill="#8d6aa3"/><rect x="24" y="-30" width="28" height="38" rx="4" fill="#65417a"/><text x="54" y="49" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">FUENTE</text></g>
        <g transform="translate(270 218)"><circle cx="0" cy="-22" r="15" fill="#d9aa90"/><path d="M0-7v54m0-31-23 21m23-21 22 19m-22 12-20 37m20-37 21 37" fill="none" stroke="#3d5968" stroke-width="8" stroke-linecap="round"/><text x="0" y="101" text-anchor="middle" font-size="8" font-weight="900" fill="#536773">EXPOSICIÓN</text></g>
        <circle cx="636" cy="73" r="31" fill="#f0c75e"/><text x="636" y="77" text-anchor="middle" font-size="9" font-weight="900" fill="#755500">SOL</text><g transform="translate(383 92)"><circle r="11" fill="#2563a8"/><text y="4" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">NOx</text></g>
        ${molecules.markup}<path d="M438 184 C468 ${166 - pulse} 483 ${166 + pulse} 505 184" fill="none" stroke="#d9822b" stroke-width="5" marker-end="url(#arrow)"/>${ozoneMarkup}${aerosolMarkup}
        <g transform="translate(390 328)"><rect width="292" height="44" rx="13" fill="#fff" opacity=".93"/><text x="146" y="17" text-anchor="middle" font-size="10" font-weight="900" fill="#566b74">Productos secundarios simplificados</text><text x="146" y="32" text-anchor="middle" font-size="9" fill="#6c7479">O₃ ${fmt(result.ozoneAfter, 1)} ppb · aerosol orgánico secundario</text></g>
        <g transform="translate(28 65)"><rect width="282" height="49" rx="13" fill="#fff" opacity=".93"/><text x="141" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="#6e4c7e">La composición determina el riesgo</text><text x="141" y="35" text-anchor="middle" font-size="9" fill="#6c6e78">Una cifra total no reemplaza identificar cada compuesto</text></g>
      `, "#f4eef7");
      return { svg, covMolecules: molecules.count, ozoneMolecules: ozoneCount, aerosolParticles: aerosolCount, captureDevices: 0, emitters: ["fuente cercana", "NOx", "radiación solar"] };
    }

    document.title = "Laboratorio de compuestos orgánicos volátiles";
    document.documentElement.style.setProperty("--accent", "#7c4d9e");
    document.documentElement.style.setProperty("--scene-tint", "#f4eef7");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell cov-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="cov-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio de fuentes y química urbana</span></nav>
      <header class="resource-header cov-header"><div><p class="eyebrow">Familia de compuestos, exposición y precursores</p><h1>COV: de la fuente al aire urbano</h1><p class="lead">Distingue actividad, emisión y concentración; explora el control en la fuente y observa por qué la composición de la mezcla importa tanto para la exposición directa como para la química atmosférica.</p></div><div class="header-mark cov-mark" aria-hidden="true">COV</div></header>
      <section class="cov-layout" aria-label="Laboratorio de compuestos orgánicos volátiles">
        <article class="card scene-card cov-scene-card">
          <div class="card-head"><div><h2 id="cov-scene-title"></h2><p id="cov-scene-note"></p></div><span class="live-badge" id="cov-animation-badge"></span></div>
          <div class="cov-view-tabs" role="tablist" aria-label="Vista del fenómeno"><button type="button" data-cov-view="sources" role="tab">Fuentes y control</button><button type="button" data-cov-view="fate" role="tab">Destino y efectos</button></div>
          <div class="scene cov-scene" id="cov-scene"></div><div class="scene-legend" id="cov-legend"></div>
          <div class="cov-context-grid"><article><span>COV actual del simulador</span><strong>${fmt(currentCov, 1)} <small>µg/m³</small></strong><small>Valor transferido; no se vuelve a reducir dentro del experimento.</small></article><article><span>Significado de la métrica</span><strong>Mezcla equivalente</strong><small>Concentración didáctica de COV reactivos; no es TVOC medido ni concentración de benceno.</small></article></div>
        </article>
        <aside class="card control-card cov-controls">
          <div><h2>Experimenta</h2><p class="control-intro">Las medidas son demostrativas y no modifican tu plan.</p></div>
          <div class="control-group"><label class="control-label" for="cov-concentration"><span>Concentración experimental</span><span class="control-readout" id="cov-concentration-readout"></span></label><input id="cov-concentration" type="range" min="5" max="50" step="0.1"><div class="range-labels"><span>5 µg/m³</span><span>50 µg/m³</span></div></div>
          <div class="control-group"><label class="control-label" for="cov-source"><span>Perfil de fuente</span></label><select id="cov-source" class="select-control"><option value="fuels">Combustibles y tráfico</option><option value="solvents">Solventes y recubrimientos</option><option value="products">Productos y limpieza</option><option value="mixed">Fuente mixta</option></select><small class="cov-source-note" id="cov-source-note"></small></div>
          <div class="control-group"><label class="control-label" for="cov-measure"><span>Medida complementaria</span></label><select id="cov-measure" class="select-control">${Object.entries(measureLabels).map(([code, label]) => `<option value="${code}">${label}</option>`).join("")}</select></div>
          <label class="mitigation-toggle cov-control-toggle"><input id="cov-control" type="checkbox"><span><strong>Aplicar P8 · Control directo de COV</strong><small>Reduce 35 % mediante estrategias de sustitución, contención y recuperación.</small></span></label>
          <div class="playback-controls"><button type="button" id="cov-play"></button><button type="button" id="cov-reset">Restablecer</button></div>
          <section class="cov-results" aria-live="polite"><span class="measure-name" id="cov-measure-name"></span><div class="cov-result-pair"><article><span>Antes</span><strong id="cov-before"></strong></article><i aria-hidden="true">→</i><article><span>Después</span><strong id="cov-after"></strong></article></div><strong class="cov-reduction" id="cov-reduction"></strong><small class="cov-difference" id="cov-difference"></small><div class="cov-ozone-result"><span>Respuesta secundaria de O₃</span><strong id="cov-ozone"></strong><small id="cov-ozone-note"></small></div><p class="cov-method-note">No existe un umbral sanitario único para esta mezcla agregada. Interpretar riesgo requiere conocer composición, método y tiempo de exposición.</p></section>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves para interpretar COV"><article class="card info-card"><span class="info-icon" aria-hidden="true">≠</span><h2>Una familia, no una sustancia</h2><p>Volatilidad, toxicidad y reactividad cambian entre combustibles, solventes, aromas y otros compuestos.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">2×</span><h2>Dos rutas de impacto</h2><p>Puede existir exposición directa cerca de la fuente y formación posterior de O₃ y aerosol secundario.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">1º</span><h2>Control en la fuente</h2><p>Sustituir, contener y prevenir fugas tiene prioridad conceptual sobre tratar la emisión al final.</p></article></section>
      <section class="card cov-context-card"><div><p class="eyebrow">Cómo interpretar la cifra</p><h2>Sin semáforo agregado de seguridad</h2><p>La Resolución 2254 no fija un máximo para COV agregados y las guías OMS 2021 se concentran en seis contaminantes clásicos. Compuestos específicos, como el benceno, requieren evaluación propia.</p></div><div class="cov-context-facts"><article><strong>Minambiente</strong><span>Guía de control, monitoreo y seguimiento por fuentes, procesos y compuestos.</span></article><article><strong>Medición</strong><span>El resultado depende de qué compuestos y métodos analíticos se incluyan.</span></article></div><div class="standards-links"><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/12/GUIA-EMISIONES-COMPUESTOS-VOLATILES.pdf" target="_blank" rel="noopener">Guía nacional de COV</a><a href="https://www.minambiente.gov.co/wp-content/uploads/2021/10/Resolucion-2254-de-2017.pdf" target="_blank" rel="noopener">Resolución 2254 de 2017</a><a href="https://www.epa.gov/indoor-air-quality-iaq/technical-overview-volatile-organic-compounds" target="_blank" rel="noopener">Panorama técnico · EPA</a></div></section>`;

    const elements = { scene: document.getElementById("cov-scene"), badge: document.getElementById("cov-animation-badge"), concentration: document.getElementById("cov-concentration"), source: document.getElementById("cov-source"), measure: document.getElementById("cov-measure"), covControl: document.getElementById("cov-control"), play: document.getElementById("cov-play") };

    function renderScene() {
      const result = experiment();
      lastScene = state.view === "sources" ? sourcesScene(result) : fateScene(result);
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const result = experiment();
      document.querySelectorAll("[data-cov-view]").forEach(button => {
        const active = button.dataset.covView === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      document.getElementById("cov-scene-title").textContent = state.view === "sources" ? "De las actividades a la concentración urbana" : "Exposición directa y productos secundarios";
      document.getElementById("cov-scene-note").textContent = state.view === "sources" ? "El perfil cambia lo que se destaca, pero no altera silenciosamente la concentración." : "La escena separa dos rutas de impacto y no representa toxicología exacta.";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.concentration.value = state.concentration;
      elements.source.value = state.source;
      elements.measure.value = state.measure;
      elements.covControl.checked = state.covControl;
      document.getElementById("cov-concentration-readout").textContent = `${fmt(state.concentration, 1)} µg/m³`;
      document.getElementById("cov-source-note").textContent = sourceLabels[state.source];
      document.getElementById("cov-measure-name").textContent = `${measureLabels[state.measure]}${state.covControl ? " + P8" : ""}`;
      document.getElementById("cov-before").textContent = `${fmt(result.covBefore, 1)} µg/m³`;
      document.getElementById("cov-after").textContent = `${fmt(result.covAfter, 1)} µg/m³`;
      document.getElementById("cov-reduction").textContent = result.status;
      document.getElementById("cov-reduction").className = `cov-reduction ${result.reductionPercent ? "decrease" : "stable"}`;
      document.getElementById("cov-difference").textContent = result.difference ? `Diferencia absoluta: ${fmt(result.difference, 1)} µg/m³` : "Diferencia absoluta: 0,0 µg/m³";
      const ozoneSign = result.ozoneChangePercent > 0 ? "+" : "";
      document.getElementById("cov-ozone").textContent = `${fmt(result.ozoneBefore, 1)} → ${fmt(result.ozoneAfter, 1)} ppb (${ozoneSign}${fmt(result.ozoneChangePercent, 0)} %)`;
      document.getElementById("cov-ozone").className = result.ozoneChangePercent > 0 ? "increase" : result.ozoneChangePercent < 0 ? "decrease" : "stable";
      document.getElementById("cov-ozone-note").textContent = result.ozoneChangePercent > 0 ? "La reducción aislada de NOx puede aumentar O₃ en el régimen simplificado." : result.ozoneChangePercent < 0 ? "El control suficiente de COV o la ventilación reduce O₃ en el modelo." : "La combinación no activa un cambio de O₃ en las reglas actuales.";
      document.getElementById("cov-legend").innerHTML = state.view === "sources" ? `<span class="legend-item"><i class="legend-dot" style="--dot:#315f79"></i>Combustibles</span><span class="legend-item"><i class="legend-dot" style="--dot:#7c4d9e"></i>Solventes</span><span class="legend-item"><i class="legend-dot" style="--dot:#c05283"></i>Productos</span><span class="legend-item"><i class="legend-dot" style="--dot:#188b5b"></i>Control P8</span>` : `<span class="legend-item"><i class="legend-dot" style="--dot:#7c4d9e"></i>COV</span><span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>O₃</span><span class="legend-item"><i class="legend-dot" style="--dot:#677b85"></i>Aerosol secundario</span>`;
      renderScene();
    }

    const viewButtons = [...document.querySelectorAll("[data-cov-view]")];
    viewButtons.forEach((button, index) => {
      button.addEventListener("click", () => { state.view = button.dataset.covView; render(); });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = viewButtons[(index + direction + viewButtons.length) % viewButtons.length];
        state.view = next.dataset.covView;
        render();
        next.focus();
      });
    });
    elements.concentration.addEventListener("input", () => { state.concentration = Number(elements.concentration.value); render(); });
    elements.source.addEventListener("change", () => { state.source = elements.source.value; render(); });
    elements.measure.addEventListener("change", () => { state.measure = elements.measure.value; render(); });
    elements.covControl.addEventListener("change", () => { state.covControl = elements.covControl.checked; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("cov-reset").addEventListener("click", () => { Object.assign(state, { view: "sources", concentration: model.baseline.cov, source: "mixed", measure: "none", covControl: false, playing: !reducedMotion, phase: 0 }); render(); });
    document.getElementById("cov-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
      else location.href = "index.html";
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && embedded && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "cov",
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        current: { covEquivalentUgM3: Number(currentCov.toFixed(2)), meaning: "concentración equivalente didáctica de COV reactivos" },
        experiment: { beforeCovUgM3: Number(result.covBefore.toFixed(3)), afterCovUgM3: Number(result.covAfter.toFixed(3)), differenceUgM3: Number(result.difference.toFixed(3)), reductionPercent: Number(result.reductionPercent.toFixed(1)), status: result.status },
        source: state.source,
        measures: { complementary: state.measure, directCovControl: state.covControl ? "P8" : "none" },
        chemistry: { noxBeforePpb: Number(result.reference.nox.toFixed(2)), noxAfterPpb: Number(result.values.nox.toFixed(2)), windBeforeMs: Number(result.reference.wind.toFixed(2)), windAfterMs: Number(result.values.wind.toFixed(2)), ozoneBeforePpb: Number(result.ozoneBefore.toFixed(3)), ozoneAfterPpb: Number(result.ozoneAfter.toFixed(3)), ozoneChangePercent: Number(result.ozoneChangePercent.toFixed(1)), factors: Object.fromEntries(Object.entries(result.ozoneFactors).map(([key, value]) => [key, Number((value * 100).toFixed(1))])) },
        interpretation: { aggregateHealthThreshold: null, compositionRequired: true, methodRequired: true },
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        visible: { covMolecules: lastScene.covMolecules, ozoneMolecules: lastScene.ozoneMolecules, aerosolParticles: lastScene.aerosolParticles, captureDevices: lastScene.captureDevices, emitters: lastScene.emitters }
      });
    }

    window.RESOURCE = { kind: "cov-sources-control-fate" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };

    let lastFrame = performance.now();
    function animateCov(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateCov);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateCov);
  }

  function renderTemperatureLab(root) {
    const model = window.NoxModel;
    if (!model?.evaluateTemperatureExperiment) return;
    const params = new URLSearchParams(location.search);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const embedded = params.get("embedded") === "1";
    const currentParam = Number(params.get("current"));
    const legacyParam = Number(params.get("value"));
    const hasCurrent = params.has("current") && Number.isFinite(currentParam);
    const hasLegacy = params.has("value") && Number.isFinite(legacyParam);
    const currentTemperature = clamp(hasCurrent ? currentParam : hasLegacy ? legacyParam : model.baseline.temp, 0, 60);
    const initialTemperature = hasCurrent ? model.baseline.temp : hasLegacy ? clamp(legacyParam, 18, 34) : model.baseline.temp;
    const initialView = ["energy", "exposure"].includes(params.get("view")) ? params.get("view") : "energy";
    const initialMoment = ["day", "night"].includes(params.get("moment")) ? params.get("moment") : "day";
    const state = {
      view: initialView,
      temperature: initialTemperature,
      profile: "mixed",
      moment: initialMoment,
      measures: { P4: false, P5: false, P6: false },
      playing: !reducedMotion,
      phase: 0
    };
    const profileLabels = {
      dark: "Superficies oscuras: mayor absorción y almacenamiento cualitativo.",
      reflective: "Superficies reflectivas: una fracción mayor de la radiación vuelve al entorno.",
      vegetated: "Cobertura vegetada: sombra y evapotranspiración dominan la ilustración.",
      mixed: "Perfil mixto: combina superficies duras, reflectivas y vegetadas."
    };
    let lastScene = { energyArrows: 0, vaporFluxes: 0, windArrows: 0, ozoneMolecules: 0, people: 0, visibleEntities: [] };

    function selectedMeasures() {
      return Object.keys(state.measures).filter(code => state.measures[code]);
    }

    function experiment() {
      return model.evaluateTemperatureExperiment({ temperatureC: state.temperature, measures: selectedMeasures() });
    }

    function energyScene(result) {
      const day = state.moment === "day";
      const profile = state.profile;
      const p4 = state.measures.P4;
      const p5 = state.measures.P5;
      const p6 = state.measures.P6;
      const phaseWave = Math.sin(state.phase * Math.PI * 2);
      const surfaceColor = profile === "dark" ? "#343b3f" : profile === "reflective" ? "#d8d6c8" : profile === "vegetated" ? "#7fb66d" : "#756f65";
      const roofColor = profile === "reflective" ? "#f0ead4" : profile === "vegetated" ? "#75ad68" : "#565c60";
      const treeCount = profile === "vegetated" ? 5 : profile === "dark" ? 1 : 3;
      const totalTrees = treeCount + (p5 ? 3 : 0);
      const energyArrows = day ? (profile === "dark" ? 8 : profile === "reflective" ? 5 : 6) : 5;
      const vaporFluxes = day && (profile === "vegetated" || profile === "mixed" || p5) ? totalTrees : 0;
      const windArrows = p6 ? 5 : 2;
      const rays = Array.from({ length: energyArrows }, (_, index) => {
        const x = 88 + index * 74;
        const endY = 252 + ((index % 2) * 34);
        const offset = phaseWave * (3 + index % 3);
        if (day) return `<path d="M${x} 82 L${x + 18 + offset} ${endY}" stroke="#e7a42d" stroke-width="4" opacity=".72" marker-end="url(#temp-arrow-warm)"/>`;
        return `<path d="M${x} ${endY} C${x - 8} ${210 - offset} ${x + 10} 170 ${x + 2} 132" fill="none" stroke="#d36a43" stroke-width="4" opacity=".68" marker-end="url(#temp-arrow-warm)"/>`;
      }).join("");
      const reflectionCount = day && profile === "reflective" ? 5 : day ? 2 : 0;
      const reflections = Array.from({ length: reflectionCount }, (_, index) => {
        const x = 285 + index * 62;
        return `<path d="M${x} 253 L${x + 12} ${128 + phaseWave * 4}" stroke="#f4d477" stroke-width="3" stroke-dasharray="8 7" marker-end="url(#temp-arrow-light)"/>`;
      }).join("");
      const treesMarkup = Array.from({ length: totalTrees }, (_, index) => tree(375 + (index % 6) * 53, 292 - Math.floor(index / 6) * 50, .62)).join("");
      const vapor = Array.from({ length: vaporFluxes }, (_, index) => {
        const progress = (state.phase + index / Math.max(1, vaporFluxes)) % 1;
        const x = 376 + (index % 6) * 53;
        const y = 226 - progress * 82;
        return `<circle cx="${x}" cy="${y.toFixed(1)}" r="${3 + index % 2}" fill="#55aeb1" opacity="${(.25 + progress * .45).toFixed(2)}"/>`;
      }).join("");
      const wind = Array.from({ length: windArrows }, (_, index) => {
        const x = 80 + ((state.phase * 190 + index * 126) % 570);
        const y = 128 + index * 27;
        return `<path d="M${x.toFixed(1)} ${y}h52" stroke="#4b9eb1" stroke-width="3" stroke-linecap="round" marker-end="url(#temp-arrow-air)" opacity="${p6 ? .82 : .35}"/>`;
      }).join("");
      const vehicles = p4 ? `${car(90, 306, "#3d8d70", .62)}<g transform="translate(175 320)"><circle cx="0" cy="13" r="11" fill="none" stroke="#234b60" stroke-width="3"/><circle cx="43" cy="13" r="11" fill="none" stroke="#234b60" stroke-width="3"/><path d="m0 13 17-22 13 22H0m17-22 26 22m-13 0 10-31" fill="none" stroke="#234b60" stroke-width="3"/></g>` : `${car(70, 307, "#be3a34", .72)}${car(155, 316, "#d9822b", .62)}`;
      const sky = day ? "#dff1f5" : "#1d334d";
      const labelColor = day ? "#28434f" : "#edf5f6";
      const svg = svgFrame(`${day ? "Balance diurno" : "Liberación nocturna"} de energía en un perfil urbano ${profile}`, `
        <defs><marker id="temp-arrow-warm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#d36a43"/></marker><marker id="temp-arrow-light" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#f4d477"/></marker><marker id="temp-arrow-air" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#4b9eb1"/></marker></defs>
        <rect width="720" height="400" fill="${sky}"/>${day ? `<circle cx="644" cy="63" r="34" fill="#f0c75e"/><text x="644" y="68" text-anchor="middle" font-size="10" font-weight="900" fill="#765900">SOL</text>` : `<circle cx="644" cy="63" r="27" fill="#f0ead4"/><circle cx="655" cy="53" r="27" fill="${sky}"/>`}
        <text x="28" y="38" font-size="12" font-weight="900" fill="${labelColor}">${day ? "ENTRADA, REFLEXIÓN Y ALMACENAMIENTO" : "LIBERACIÓN DE ENERGÍA ALMACENADA"}</text>
        ${rays}${reflections}${wind}
        <g transform="translate(0 8)">${buildings(302)}</g><rect y="302" width="720" height="98" fill="${surfaceColor}"/><rect x="270" y="251" width="96" height="51" fill="${roofColor}" opacity=".96"/>
        ${vehicles}${treesMarkup}${vapor}
        <g transform="translate(26 267)"><rect width="164" height="31" rx="10" fill="#fff" opacity=".92"/><text x="82" y="20" text-anchor="middle" font-size="10" font-weight="900" fill="#633d2c">AIRE: ${fmt(result.temperatureAfter, 1)} °C</text></g>
        <g transform="translate(496 329)"><rect width="194" height="48" rx="12" fill="#fff" opacity=".94"/><text x="97" y="18" text-anchor="middle" font-size="9" font-weight="900" fill="#5c6970">PERFIL VISUAL</text><text x="97" y="34" text-anchor="middle" font-size="10" fill="#3f555f">${profile === "dark" ? "oscuro" : profile === "reflective" ? "reflectivo" : profile === "vegetated" ? "vegetado" : "mixto"} · ${day ? "día" : "noche"}</text></g>
      `, sky);
      return { svg, energyArrows, vaporFluxes, windArrows, ozoneMolecules: 0, people: 0, visibleEntities: [day ? "sol" : "luna", "edificios", "superficie", p4 ? "movilidad activa" : "vehículos", ...(p5 ? ["arborización P5"] : []), ...(p6 ? ["corredor P6"] : [])] };
    }

    function exposureScene(result) {
      const day = state.moment === "day";
      const p5 = state.measures.P5;
      const p6 = state.measures.P6;
      const ozoneCount = Math.round(clamp(ratio(result.ozoneAfter, 16, 28), 0, 1) * 13 + 5);
      const windArrows = p6 ? 7 : 3;
      const shadeWidth = p5 || state.profile === "vegetated" ? 185 : state.profile === "dark" ? 55 : 105;
      const ozone = Array.from({ length: ozoneCount }, (_, index) => {
        const progress = (state.phase * .62 + index / ozoneCount) % 1;
        const x = 390 + ((index * 47 + progress * 180) % 275);
        const y = 92 + ((index * 31) % 132) + Math.sin((progress + index) * Math.PI * 2) * 4;
        return `<g class="temperature-o3" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="8" fill="#d9822b" opacity=".82"/><text y="3" text-anchor="middle" font-size="6.5" font-weight="900" fill="#fff">O₃</text></g>`;
      }).join("");
      const wind = Array.from({ length: windArrows }, (_, index) => {
        const x = 55 + ((state.phase * 220 + index * 103) % 570);
        const y = 245 + (index % 3) * 24;
        return `<path d="M${x.toFixed(1)} ${y}h48" stroke="#4b9eb1" stroke-width="3" marker-end="url(#temp-air-arrow)" opacity="${p6 ? .82 : .38}"/>`;
      }).join("");
      const person = (x, sheltered) => `<g transform="translate(${x} 267)"><circle cx="0" cy="-37" r="12" fill="#d7a88d"/><path d="M0-24v42m0-23-18 19m18-19 18 19M0 18-15 49m15-31 16 31" fill="none" stroke="${sheltered ? "#2f765f" : "#79473c"}" stroke-width="7" stroke-linecap="round"/><text x="0" y="66" text-anchor="middle" font-size="8" font-weight="900" fill="#536773">${sheltered ? "SOMBRA" : "SOL"}</text></g>`;
      const svg = svgFrame("Temperatura del aire, exposición al calor y respuesta secundaria simplificada de ozono", `
        <defs><linearGradient id="temp-exposure-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${day ? "#dcedf3" : "#243b55"}"/><stop offset="1" stop-color="${day ? "#fff0cc" : "#50647a"}"/></linearGradient><marker id="temp-air-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#4b9eb1"/></marker></defs><rect width="720" height="400" fill="url(#temp-exposure-sky)"/>
        <path d="M350 30v340" stroke="#b9c9ce" stroke-width="2" stroke-dasharray="8 8"/><text x="28" y="38" font-size="12" font-weight="900" fill="${day ? "#79473c" : "#fff"}">EXPOSICIÓN TÉRMICA</text><text x="384" y="38" font-size="12" font-weight="900" fill="${day ? "#87581f" : "#fff"}">RESPUESTA SECUNDARIA DE O₃</text>
        ${day ? `<circle cx="300" cy="72" r="29" fill="#f0c75e"/>` : `<circle cx="300" cy="72" r="23" fill="#f0ead4"/>`}<rect y="316" width="350" height="84" fill="#d8d0ba"/><path d="M28 316h${shadeWidth}l-28-104H28z" fill="#477b63" opacity=".26"/>
        ${tree(84, 287, .82)}${person(118, true)}${person(264, false)}${wind}
        <g transform="translate(24 70)"><rect width="174" height="54" rx="13" fill="#fff" opacity=".94"/><text x="87" y="20" text-anchor="middle" font-size="9" font-weight="900" fill="#6d4a3e">TEMPERATURA DEL AIRE</text><text x="87" y="42" text-anchor="middle" font-size="21" font-weight="900" fill="#b94734">${fmt(result.temperatureAfter, 1)} °C</text></g>
        ${ozone}<g transform="translate(382 255)"><rect width="304" height="92" rx="14" fill="#fff" opacity=".94"/><text x="152" y="20" text-anchor="middle" font-size="9" font-weight="900" fill="#75561f">MODELO QUÍMICO SIMPLIFICADO</text><text x="152" y="46" text-anchor="middle" font-size="18" font-weight="900" fill="#9d5722">${fmt(result.ozoneBefore, 1)} → ${fmt(result.ozoneAfter, 1)} ppb</text><text x="152" y="67" text-anchor="middle" font-size="9" fill="#586b73">requiere también NOx, COV y radiación</text><text x="152" y="82" text-anchor="middle" font-size="8" fill="#6c7377">No es un pronóstico atmosférico</text></g>
      `, "#edf3f2");
      return { svg, energyArrows: 0, vaporFluxes: 0, windArrows, ozoneMolecules: ozoneCount, people: 2, visibleEntities: ["persona en sombra", "persona expuesta", day ? "sol" : "noche", "módulo O3", ...(p5 ? ["sombra P5"] : []), ...(p6 ? ["ventilación P6"] : [])] };
    }

    document.title = "Laboratorio de temperatura urbana";
    document.documentElement.style.setProperty("--accent", "#c44935");
    document.documentElement.style.setProperty("--scene-tint", "#f8f1ec");
    document.body.classList.toggle("embedded-resource", embedded);
    root.className = "resource-shell temperature-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back particulate-close" id="temperature-close" type="button">${embedded ? "← Cerrar laboratorio" : "← Volver al simulador"}</button><span class="resource-tag">Laboratorio de energía urbana</span></nav>
      <header class="resource-header temperature-header"><div><p class="eyebrow">Meteorología, ciudad y exposición</p><h1>Temperatura urbana: aire, superficies y calor</h1><p class="lead">Distingue la temperatura del aire de la temperatura superficial, observa cómo la ciudad intercambia energía y explora los efectos demostrativos de movilidad activa, arborización y ventilación.</p></div><div class="header-mark temperature-mark" aria-hidden="true">°C</div></header>
      <section class="temperature-layout" aria-label="Laboratorio de temperatura urbana">
        <article class="card scene-card temperature-scene-card"><div class="card-head"><div><h2 id="temperature-scene-title"></h2><p id="temperature-scene-note"></p></div><span class="live-badge" id="temperature-animation-badge"></span></div>
          <div class="temperature-view-tabs" role="tablist" aria-label="Vista del fenómeno"><button type="button" data-temperature-view="energy" role="tab">Superficies y energía</button><button type="button" data-temperature-view="exposure" role="tab">Aire, exposición y química</button></div>
          <div class="scene temperature-scene" id="temperature-scene"></div><div class="scene-legend" id="temperature-legend"></div>
          <div class="temperature-context-grid"><article><span>Temperatura actual del simulador</span><strong>${fmt(currentTemperature, 1)} <small>°C</small></strong><small>Estado transferido; el experimento inicia en su propia base.</small></article><article><span>Qué representa</span><strong>Aire urbano exterior</strong><small>No es temperatura superficial, índice de calor, sensación térmica ni pronóstico.</small></article></div>
        </article>
        <aside class="card control-card temperature-controls"><div><h2>Experimenta</h2><p class="control-intro">Estas medidas son demostrativas y no modifican tu plan.</p></div>
          <div class="control-group"><label class="control-label" for="temperature-value"><span>Temperatura experimental</span><span class="control-readout" id="temperature-value-readout"></span></label><input id="temperature-value" type="range" min="18" max="34" step="0.1"><div class="range-labels"><span>18 °C</span><span>34 °C</span></div></div>
          <div class="temperature-control-row"><div class="control-group"><label class="control-label" for="temperature-profile"><span>Perfil urbano</span></label><select id="temperature-profile" class="select-control"><option value="dark">Impermeable oscuro</option><option value="reflective">Reflectivo</option><option value="vegetated">Vegetado</option><option value="mixed">Mixto</option></select></div><div class="control-group"><label class="control-label" for="temperature-moment"><span>Momento</span></label><select id="temperature-moment" class="select-control"><option value="day">Día</option><option value="night">Noche</option></select></div></div><small class="temperature-profile-note" id="temperature-profile-note"></small>
          <fieldset class="temperature-measures"><legend>Medidas demostrativas</legend><label><input type="checkbox" data-temperature-measure="P4"><span><strong>P4 · Movilidad activa</strong><small>−0,2 °C</small></span></label><label><input type="checkbox" data-temperature-measure="P5"><span><strong>P5 · Arborización técnica</strong><small>−1,1 °C</small></span></label><label><input type="checkbox" data-temperature-measure="P6"><span><strong>P6 · Corredores de ventilación</strong><small>−0,4 °C</small></span></label></fieldset>
          <div class="playback-controls"><button type="button" id="temperature-play"></button><button type="button" id="temperature-reset">Restablecer</button></div>
          <section class="temperature-results" aria-live="polite"><span class="measure-name" id="temperature-measure-name"></span><div class="temperature-result-pair"><article><span>Antes</span><strong id="temperature-before"></strong></article><i aria-hidden="true">→</i><article><span>Después</span><strong id="temperature-after"></strong></article></div><strong class="temperature-change" id="temperature-change"></strong><div class="temperature-ozone-result"><span>Respuesta secundaria de O₃</span><strong id="temperature-ozone"></strong><small id="temperature-ozone-note"></small></div><p class="temperature-method-note">No se asigna un semáforo sanitario con °C solamente: también importan humedad, radiación, viento, duración, actividad y vulnerabilidad.</p></section>
        </aside>
      </section>
      <section class="particulate-info-grid" aria-label="Claves para interpretar temperatura urbana"><article class="card info-card"><span class="info-icon" aria-hidden="true">aire</span><h2>Aire ≠ superficie</h2><p>Una cubierta puede calentarse mucho más que el aire. El laboratorio mantiene separadas ambas magnitudes.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">ΔT</span><h2>Isla de calor</h2><p>Es una diferencia entre zonas urbanas y su entorno, no un umbral universal de temperatura absoluta.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">O₃</span><h2>Una condición más</h2><p>El calor puede favorecer O₃ con sol y precursores suficientes; la temperatura no lo produce por sí sola.</p></article></section>
      <section class="card temperature-context-card"><div><p class="eyebrow">Interpretación responsable</p><h2>Sin máximo normativo de calidad del aire</h2><p>La Resolución 2254 no fija un máximo para temperatura. La evaluación de calor requiere contexto local y variables adicionales; aquí se comparan relaciones didácticas.</p></div><div class="temperature-context-facts"><article><strong>Día</strong><span>Radiación, reflexión, almacenamiento, sombra y evapotranspiración.</span></article><article><strong>Noche</strong><span>Las superficies pueden liberar parte de la energía almacenada durante el día.</span></article></div><div class="standards-links"><a href="https://www.ideam.gov.co/documents/11769/72085840/Anexo%2B10.%2BGlosario%2Bmeteorol%C3%B3gico.pdf" target="_blank" rel="noopener">Glosario meteorológico · IDEAM</a><a href="https://www.epa.gov/heatislands/measuring-heat-islands" target="_blank" rel="noopener">Medición de islas de calor · EPA</a><a href="https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health" target="_blank" rel="noopener">Calor y salud · OMS</a></div></section>`;

    const elements = { scene: document.getElementById("temperature-scene"), badge: document.getElementById("temperature-animation-badge"), temperature: document.getElementById("temperature-value"), profile: document.getElementById("temperature-profile"), moment: document.getElementById("temperature-moment"), play: document.getElementById("temperature-play") };

    function renderScene() {
      const result = experiment();
      lastScene = state.view === "energy" ? energyScene(result) : exposureScene(result);
      elements.scene.innerHTML = lastScene.svg;
    }

    function render() {
      const result = experiment();
      document.querySelectorAll("[data-temperature-view]").forEach(button => {
        const active = button.dataset.temperatureView === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      document.getElementById("temperature-scene-title").textContent = state.view === "energy" ? "Cómo la ciudad intercambia energía" : "Temperatura del aire, exposición y O₃";
      document.getElementById("temperature-scene-note").textContent = state.view === "energy" ? "Los flujos son cualitativos; la temperatura del aire permanece separada de las superficies." : "La escena muestra factores faltantes y una respuesta química simplificada, no un diagnóstico de salud.";
      elements.badge.textContent = state.playing ? "En movimiento" : "En pausa";
      elements.badge.classList.toggle("paused", !state.playing);
      elements.play.textContent = state.playing ? "Pausar animación" : "Reproducir animación";
      elements.temperature.value = state.temperature;
      elements.profile.value = state.profile;
      elements.moment.value = state.moment;
      document.getElementById("temperature-value-readout").textContent = `${fmt(state.temperature, 1)} °C`;
      document.getElementById("temperature-profile-note").textContent = profileLabels[state.profile];
      document.querySelectorAll("[data-temperature-measure]").forEach(input => { input.checked = state.measures[input.dataset.temperatureMeasure]; });
      const selected = selectedMeasures();
      document.getElementById("temperature-measure-name").textContent = selected.length ? selected.join(" + ") : "Sin medida";
      document.getElementById("temperature-before").textContent = `${fmt(result.temperatureBefore, 1)} °C`;
      document.getElementById("temperature-after").textContent = `${fmt(result.temperatureAfter, 1)} °C`;
      const change = document.getElementById("temperature-change");
      change.textContent = Math.abs(result.difference) < .0001 ? "Sin cambio" : result.difference < 0 ? `Reducción de ${fmt(Math.abs(result.difference), 1)} °C` : `Aumento de ${fmt(result.difference, 1)} °C`;
      change.className = `temperature-change ${result.difference < 0 ? "decrease" : result.difference > 0 ? "increase" : "stable"}`;
      const ozoneSign = result.ozoneChangePercent > 0 ? "+" : "";
      document.getElementById("temperature-ozone").textContent = `${fmt(result.ozoneBefore, 1)} → ${fmt(result.ozoneAfter, 1)} ppb (${ozoneSign}${fmt(result.ozoneChangePercent, 1)} %)`;
      document.getElementById("temperature-ozone").className = result.ozoneChangePercent > .05 ? "increase" : result.ozoneChangePercent < -.05 ? "decrease" : "stable";
      document.getElementById("temperature-ozone-note").textContent = state.temperature > model.baseline.temp ? "La temperatura aporta al resultado junto con NOx, COV y ventilación." : selected.includes("P6") ? "P6 reduce O₃ en el modelo por el aumento de ventilación, no solo por temperatura." : "Por debajo de la base, la regla actual no añade un factor térmico de O₃.";
      document.getElementById("temperature-legend").innerHTML = state.view === "energy" ? `<span class="legend-item"><i class="legend-dot" style="--dot:#e7a42d"></i>Radiación</span><span class="legend-item"><i class="legend-dot" style="--dot:#d36a43"></i>Calor almacenado/liberado</span><span class="legend-item"><i class="legend-dot" style="--dot:#55aeb1"></i>Evapotranspiración y aire</span>` : `<span class="legend-item"><i class="legend-dot" style="--dot:#477b63"></i>Sombra</span><span class="legend-item"><i class="legend-dot" style="--dot:#4b9eb1"></i>Ventilación</span><span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>O₃ simplificado</span>`;
      renderScene();
    }

    const viewButtons = [...document.querySelectorAll("[data-temperature-view]")];
    viewButtons.forEach((button, index) => {
      button.addEventListener("click", () => { state.view = button.dataset.temperatureView; render(); });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const next = viewButtons[(index + direction + viewButtons.length) % viewButtons.length];
        state.view = next.dataset.temperatureView;
        render();
        next.focus();
      });
    });
    elements.temperature.addEventListener("input", () => { state.temperature = Number(elements.temperature.value); render(); });
    elements.profile.addEventListener("change", () => { state.profile = elements.profile.value; render(); });
    elements.moment.addEventListener("change", () => { state.moment = elements.moment.value; render(); });
    document.querySelectorAll("[data-temperature-measure]").forEach(input => input.addEventListener("change", () => { state.measures[input.dataset.temperatureMeasure] = input.checked; render(); }));
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("temperature-reset").addEventListener("click", () => { Object.assign(state, { view: "energy", temperature: model.baseline.temp, profile: "mixed", moment: "day", playing: !reducedMotion, phase: 0 }); state.measures = { P4: false, P5: false, P6: false }; render(); });
    document.getElementById("temperature-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
      else location.href = "index.html";
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && embedded && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "temp",
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        current: { airTemperatureC: Number(currentTemperature.toFixed(2)), meaning: "temperatura urbana exterior representativa" },
        experiment: { beforeC: Number(result.temperatureBefore.toFixed(3)), afterC: Number(result.temperatureAfter.toFixed(3)), differenceC: Number(result.difference.toFixed(3)), status: result.status },
        profile: state.profile,
        moment: state.moment,
        measures: selectedMeasures(),
        chemistry: { noxPpb: Number(result.values.nox.toFixed(3)), covUgM3: Number(result.values.cov.toFixed(3)), windMs: Number(result.values.wind.toFixed(3)), ozoneBeforePpb: Number(result.ozoneBefore.toFixed(3)), ozoneAfterPpb: Number(result.ozoneAfter.toFixed(3)), ozoneChangePercent: Number(result.ozoneChangePercent.toFixed(2)), temperatureFactorBeforePercent: Number((result.ozoneFactorsBefore.temperature * 100).toFixed(1)), temperatureFactorAfterPercent: Number((result.ozoneFactorsAfter.temperature * 100).toFixed(1)) },
        interpretation: { surfaceTemperatureShownAsMeasurement: false, healthThreshold: null, missingHeatStressFactors: ["humedad", "radiación", "viento", "duración", "actividad", "vulnerabilidad"] },
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)) },
        visible: { energyArrows: lastScene.energyArrows, vaporFluxes: lastScene.vaporFluxes, windArrows: lastScene.windArrows, ozoneMolecules: lastScene.ozoneMolecules, people: lastScene.people, entities: lastScene.visibleEntities }
      });
    }

    window.RESOURCE = { kind: "temperature-energy-exposure-chemistry" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };
    let lastFrame = performance.now();
    function animateTemperature(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateTemperature);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateTemperature);
  }

  function renderDispersionLab(root) {
    const model = window.DispersionModel;
    if (!model) {
      root.textContent = "No fue posible cargar el modelo de dispersión.";
      return;
    }

    const params = new URLSearchParams(location.search);
    const validFocus = ["wind", "hmix", "vent", "stagnation"];
    const focus = validFocus.includes(params.get("focus"))
      ? params.get("focus")
      : validFocus.includes(document.body.dataset.focus)
        ? document.body.dataset.focus
        : "vent";
    const focusToView = { wind: "transport", hmix: "mixing", vent: "ventilation", stagnation: "stagnation" };
    const embedded = params.get("embedded") === "1";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const queryWind = params.has("wind") ? Number(params.get("wind")) : NaN;
    const queryHmix = params.has("hmix") ? Number(params.get("hmix")) : NaN;
    const legacyValue = params.has("value") ? Number(params.get("value")) : null;
    const currentWind = Number.isFinite(queryWind)
      ? queryWind
      : focus === "wind" && Number.isFinite(legacyValue)
        ? legacyValue
        : model.baseline.wind;
    const currentHmix = Number.isFinite(queryHmix)
      ? queryHmix
      : focus === "hmix" && Number.isFinite(legacyValue)
        ? legacyValue
        : model.baseline.hmix;
    const current = model.calculate(currentWind, currentHmix);
    const legacyDerived = (focus === "vent" || focus === "stagnation") && Number.isFinite(legacyValue)
      ? { key: focus, value: clamp(legacyValue, 0, 100) }
      : null;
    const initialView = ["transport", "mixing", "ventilation", "stagnation"].includes(params.get("view"))
      ? params.get("view")
      : focusToView[focus];
    const state = {
      view: initialView,
      wind: model.baseline.wind,
      hmix: model.baseline.hmix,
      direction: "east",
      measure: "none",
      playing: !reducedMotion,
      phase: 0
    };
    let lastScene = {};

    function selectedMeasures() {
      if (state.measure === "P5P6") return ["P5", "P6"];
      return state.measure === "none" ? [] : [state.measure];
    }

    function experiment() {
      return model.evaluateExperiment({ wind: state.wind, hmix: state.hmix, measures: selectedMeasures() });
    }

    function directionData() {
      return {
        east: { label: "Oeste → Este", dx: 1, dy: 0, source: [120, 205], receptor: [590, 205] },
        west: { label: "Este → Oeste", dx: -1, dy: 0, source: [600, 205], receptor: [130, 205] },
        north: { label: "Sur → Norte", dx: 0, dy: -1, source: [360, 325], receptor: [360, 80] },
        south: { label: "Norte → Sur", dx: 0, dy: 1, source: [360, 80], receptor: [360, 325] }
      }[state.direction];
    }

    function particleMarkup(result, mode) {
      const direction = directionData();
      const speedRatio = ratio(result.wind, model.limits.wind[0], model.limits.wind[1]);
      const heightRatio = ratio(result.hmix, model.limits.hmix[0], model.limits.hmix[1]);
      const count = mode === "stagnation" ? 12 + Math.round(result.stagnation * 0.28) : 24;
      const particles = [];
      for (let i = 0; i < count; i += 1) {
        const travel = ((i / count) + state.phase * (0.18 + speedRatio * 0.82)) % 1;
        let x;
        let y;
        if (mode === "transport") {
          x = direction.source[0] + (direction.receptor[0] - direction.source[0]) * travel;
          y = direction.source[1] + (direction.receptor[1] - direction.source[1]) * travel;
          const lateralX = direction.dy * (((i * 17) % 42) - 21) * (0.35 + heightRatio);
          const lateralY = -direction.dx * (((i * 17) % 42) - 21) * (0.35 + heightRatio);
          x += lateralX;
          y += lateralY;
        } else {
          const layerTop = 250 - heightRatio * 145;
          x = 70 + ((i * 83 + state.phase * (130 + speedRatio * 280)) % 590);
          y = layerTop + 18 + ((i * 47) % Math.max(35, 292 - layerTop));
        }
        particles.push(`<circle class="dispersion-particle" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${mode === "stagnation" ? 5 : 4}" fill="${mode === "stagnation" ? palette.red : palette.orange}" opacity="${mode === "stagnation" ? 0.58 : 0.72}"/>`);
      }
      return { markup: particles.join(""), count };
    }

    function transportScene(result) {
      const direction = directionData();
      const particles = particleMarkup(result, "transport");
      const arrowStartX = direction.source[0] + direction.dx * 58;
      const arrowStartY = direction.source[1] + direction.dy * 58;
      const arrowEndX = arrowStartX + direction.dx * 125;
      const arrowEndY = arrowStartY + direction.dy * 125;
      const blocks = [[40, 42], [520, 38], [46, 300], [525, 294]].map(([x, y], index) => `<g transform="translate(${x} ${y})"><rect width="145" height="72" rx="10" fill="${index % 2 ? "#cadccf" : "#d8e4d5"}" stroke="#92aa98"/><rect x="18" y="18" width="42" height="20" rx="4" fill="#8aa7b1"/><rect x="80" y="18" width="42" height="20" rx="4" fill="#8aa7b1"/><text x="72" y="58" text-anchor="middle" font-size="11" fill="${palette.muted}">Barrio</text></g>`).join("");
      return {
        svg: svgFrame("Vista superior del transporte de una pluma hacia un receptor a sotavento", `
          <rect width="720" height="400" fill="#e7efe4"/>
          ${blocks}
          <path d="M0 180h720M340 0v400" stroke="#87969c" stroke-width="54"/>
          <path d="M0 180h720M340 0v400" stroke="#f4d768" stroke-width="3" stroke-dasharray="14 15"/>
          <circle cx="${direction.source[0]}" cy="${direction.source[1]}" r="31" fill="${palette.red}"/>
          <text x="${direction.source[0]}" y="${direction.source[1] + 5}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">FUENTE</text>
          <circle cx="${direction.receptor[0]}" cy="${direction.receptor[1]}" r="36" fill="#fff" stroke="${palette.blue}" stroke-width="5"/>
          <circle cx="${direction.receptor[0]}" cy="${direction.receptor[1]}" r="8" fill="${palette.blue}"/>
          <text x="${direction.receptor[0]}" y="${direction.receptor[1] + 58}" text-anchor="middle" font-size="12" font-weight="900" fill="${palette.blue}">RECEPTOR A SOTAVENTO</text>
          <line x1="${arrowStartX}" y1="${arrowStartY}" x2="${arrowEndX}" y2="${arrowEndY}" stroke="${palette.teal}" stroke-width="9" stroke-linecap="round" marker-end="url(#arrow)"/>
          ${particles.markup}
          <rect x="22" y="348" width="250" height="34" rx="17" fill="#fff" opacity=".94"/>
          <text x="147" y="370" text-anchor="middle" font-size="13" font-weight="900" fill="${palette.ink}">${direction.label} · ${fmt(result.wind, 1)} m/s</text>
        `, "#eef6f1"),
        particles: particles.count,
        receptor: direction.receptor,
        description: "La dirección decide qué receptor queda a sotavento; la velocidad cambia el transporte, no la masa emitida."
      };
    }

    function mixingSceneForLab(result, combined = false) {
      const heightRatio = ratio(result.hmix, model.limits.hmix[0], model.limits.hmix[1]);
      const speedRatio = ratio(result.wind, model.limits.wind[0], model.limits.wind[1]);
      const top = 250 - heightRatio * 145;
      const particles = particleMarkup(result, "mixing");
      const arrows = Array.from({ length: 4 }, (_, i) => {
        const y = 80 + i * 42;
        const length = 45 + speedRatio * 125;
        return `<line x1="65" y1="${y}" x2="${65 + length}" y2="${y}" stroke="${palette.teal}" stroke-width="6" stroke-linecap="round"/><path d="M${65 + length} ${y}l-14-9v18z" fill="${palette.teal}"/>`;
      }).join("");
      return {
        svg: svgFrame(combined ? "Relación entre viento, altura de mezcla y ventilación" : "Corte vertical de la capa de mezcla urbana", `
          <rect width="720" height="315" fill="url(#sky)"/>
          <rect y="${top}" width="720" height="${315 - top}" fill="${palette.blue}" opacity=".12"/>
          <line x1="0" y1="${top}" x2="720" y2="${top}" stroke="${palette.blue}" stroke-width="5" stroke-dasharray="14 9"/>
          ${arrows}${particles.markup}${buildings(315)}
          <rect x="536" y="${top - 19}" width="154" height="36" rx="18" fill="#fff"/>
          <text x="613" y="${top + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="${palette.blue}">${fmt(result.hmix, 1)} m</text>
          <rect y="315" width="720" height="85" fill="#78966e"/>
          <text x="26" y="349" font-size="13" font-weight="900" fill="#fff">Emisión constante · volumen de mezcla variable</text>
          ${combined ? `<rect x="360" y="337" width="326" height="45" rx="12" fill="#fff" opacity=".95"/><text x="523" y="357" text-anchor="middle" font-size="12" font-weight="800" fill="${palette.muted}">VIENTO × ALTURA</text><text x="523" y="376" text-anchor="middle" font-size="17" font-weight="900" fill="${palette.teal}">${fmt(result.rate, 1)} m²/s</text>` : ""}
        `, "#eef5f6"),
        particles: particles.count,
        layerTop: Number(top.toFixed(1)),
        description: combined
          ? "El coeficiente físico combina transporte horizontal y volumen vertical; ninguno de los dos componentes debe interpretarse por separado."
          : "Una capa más profunda ofrece mayor volumen vertical para la misma emisión, sin crear ni eliminar contaminantes."
      };
    }

    function stagnationSceneForLab(result) {
      const heightRatio = ratio(result.hmix, model.limits.hmix[0], model.limits.hmix[1]);
      const top = 250 - heightRatio * 145;
      const particles = particleMarkup(result, "stagnation");
      const hour = state.phase * 24;
      return {
        svg: svgFrame("Evolución didáctica de un episodio de estancamiento durante 24 horas", `
          <rect width="720" height="310" fill="url(#sky)"/>
          <rect y="${top}" width="720" height="${310 - top}" fill="${palette.red}" opacity="${(0.08 + result.stagnation / 250).toFixed(2)}"/>
          <line x1="0" y1="${top}" x2="720" y2="${top}" stroke="${palette.orange}" stroke-width="6"/>
          ${particles.markup}${buildings(310)}
          <rect x="500" y="${top - 40}" width="190" height="32" rx="16" fill="#fff"/>
          <text x="595" y="${top - 18}" text-anchor="middle" font-size="12" font-weight="900" fill="${palette.orange}">Mezcla limitada</text>
          <rect y="310" width="720" height="90" fill="#fff"/>
          <line x1="54" y1="353" x2="666" y2="353" stroke="#d9e1dd" stroke-width="10" stroke-linecap="round"/>
          <line x1="54" y1="353" x2="${54 + 612 * state.phase}" y2="353" stroke="${palette.red}" stroke-width="10" stroke-linecap="round"/>
          ${[0, 6, 12, 18, 24].map((value, i) => `<text x="${54 + i * 153}" y="383" text-anchor="middle" font-size="12" fill="${palette.muted}">${value} h</text>`).join("")}
          <rect x="286" y="319" width="148" height="28" rx="14" fill="#f9efee"/>
          <text x="360" y="338" text-anchor="middle" font-size="13" font-weight="900" fill="${palette.red}">${fmt(hour, 1)} horas</text>
        `, "#f4f1eb"),
        particles: particles.count,
        hour: Number(hour.toFixed(2)),
        layerTop: Number(top.toFixed(1)),
        description: "Con ventilación limitada aumenta la permanencia visual cerca del suelo. La escena muestra tendencia relativa, no una concentración medida."
      };
    }

    function buildScene(result) {
      if (state.view === "transport") return transportScene(result);
      if (state.view === "mixing") return mixingSceneForLab(result, false);
      if (state.view === "ventilation") return mixingSceneForLab(result, true);
      return stagnationSceneForLab(result);
    }

    const closeLabel = embedded ? "Cerrar laboratorio" : "Volver al simulador";
    root.className = "resource-shell dispersion-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back" id="dispersion-close" type="button">← ${closeLabel}</button><span class="resource-tag">Laboratorio integrado</span></nav>
      <header class="resource-header particulate-header">
        <div><p class="eyebrow">Transporte y mezcla atmosférica</p><h1>¿Por qué se acumula la contaminación?</h1><p class="lead">Relaciona viento, altura de mezcla, ventilación física y estancamiento sin cambiar la emisión.</p></div>
        <div class="header-mark" aria-hidden="true">↠↕</div>
      </header>
      <section class="dispersion-current" aria-label="Estado actual transferido del simulador">
        <div><span>Viento actual</span><strong>${fmt(current.wind, 1)} m/s</strong></div>
        <div><span>Mezcla actual</span><strong>${fmt(current.hmix, 1)} m</strong></div>
        <div><span>Ventilación física</span><strong>${fmt(current.rate, 1)} m²/s</strong></div>
        <div><span>Índices actuales</span><strong>V ${fmt(current.ventilation, 1)} · E ${fmt(current.stagnation, 1)}</strong></div>
        ${legacyDerived ? `<p class="legacy-note">Enlace legado: ${legacyDerived.key === "vent" ? "ventilación" : "estancamiento"} ${fmt(legacyDerived.value, 1)}/100. No se inventaron valores de viento y altura para reconstruirlo.</p>` : ""}
      </section>
      <div class="view-tabs dispersion-tabs" role="tablist" aria-label="Vista del laboratorio">
        <button type="button" role="tab" data-dispersion-view="transport">Transporte</button>
        <button type="button" role="tab" data-dispersion-view="mixing">Mezcla vertical</button>
        <button type="button" role="tab" data-dispersion-view="ventilation">Ventilación</button>
        <button type="button" role="tab" data-dispersion-view="stagnation">Estancamiento</button>
      </div>
      <section class="particulate-workspace">
        <article class="card scene-card particulate-scene-card">
          <div class="card-head"><div><h2 id="dispersion-scene-title">Escena sincronizada</h2><p id="dispersion-scene-description"></p></div><span class="live-badge" id="dispersion-live">En movimiento</span></div>
          <div class="particulate-scene" id="dispersion-scene"></div>
          <div class="scene-legend"><span class="legend-item"><i class="legend-dot" style="--dot:#047a7a"></i>Flujo de aire</span><span class="legend-item"><i class="legend-dot" style="--dot:#d9822b"></i>Emisión constante</span><span class="legend-item"><i class="legend-dot" style="--dot:#2563a8"></i>Capa de mezcla</span></div>
        </article>
        <aside class="card control-card particulate-controls">
          <h2>Experimenta</h2>
          <div class="control-group"><label class="control-label" for="dispersion-wind"><span>Viento representativo</span><span class="control-readout" id="dispersion-wind-readout"></span></label><input id="dispersion-wind" type="range" min="0.5" max="5.5" step="0.1"><div class="range-labels"><span>0,5 m/s</span><span>5,5 m/s</span></div></div>
          <div class="control-group"><label class="control-label" for="dispersion-hmix"><span>Altura de mezcla</span><span class="control-readout" id="dispersion-hmix-readout"></span></label><input id="dispersion-hmix" type="range" min="70" max="220" step="1"><div class="range-labels"><span>70 m</span><span>220 m</span></div></div>
          <div class="control-group"><label class="control-label" for="dispersion-direction"><span>Dirección del transporte</span></label><select class="select-control" id="dispersion-direction"><option value="east">Oeste → Este</option><option value="west">Este → Oeste</option><option value="north">Sur → Norte</option><option value="south">Norte → Sur</option></select></div>
          <div class="control-group"><label class="control-label" for="dispersion-measure"><span>Aplicar medida demostrativa</span></label><select class="select-control" id="dispersion-measure"><option value="none">Ninguna</option><option value="P5">P5 · Arborización técnica</option><option value="P6">P6 · Corredores de ventilación</option><option value="P5P6">P5 + P6</option></select></div>
          <div class="playback-controls"><button id="dispersion-play" type="button"></button><button class="secondary" id="dispersion-reset" type="button">Restablecer</button></div>
          <p class="didactic-note">El viento se usa como aproximación del viento de transporte. El laboratorio no sustituye un modelo de dispersión regulatorio.</p>
        </aside>
      </section>
      <section class="dispersion-results" aria-label="Resultados del experimento">
        <article class="card dispersion-result-main"><p>Coeficiente físico</p><strong id="dispersion-rate"></strong><span>viento × altura de mezcla</span></article>
        <article class="card dispersion-result-card"><p>Ventilación relativa</p><div><span id="dispersion-vent-before"></span><b>→</b><strong id="dispersion-vent-after"></strong></div><small>0–100 dentro del rango didáctico</small></article>
        <article class="card dispersion-result-card"><p>Estancamiento relativo</p><div><span id="dispersion-stag-before"></span><b>→</b><strong id="dispersion-stag-after"></strong></div><small>Siempre 100 − ventilación</small></article>
        <article class="card dispersion-result-card"><p>Condiciones efectivas</p><strong id="dispersion-effective"></strong><small id="dispersion-measure-note"></small></article>
      </section>
      <section class="particulate-info-grid">
        <article class="card info-card"><span class="info-icon" aria-hidden="true">↠</span><h2>Transportar no es eliminar</h2><p>El viento reduce la concentración cerca de una fuente, pero desplaza la pluma hacia receptores a sotavento.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">↕</span><h2>Volumen vertical</h2><p>Una capa de mezcla más profunda distribuye la misma emisión en un volumen mayor de aire.</p></article>
        <article class="card info-card"><span class="info-icon" aria-hidden="true">24h</span><h2>Persistencia</h2><p>Viento débil y mezcla limitada favorecen episodios prolongados cerca del suelo; una inversión es una causa posible.</p></article>
      </section>
      <section class="reference-note"><strong>Lectura correcta:</strong> el resultado en m²/s es físico; las escalas 0–100 son comparaciones internas del simulador, no límites sanitarios ni categorías meteorológicas universales.</section>
    `;

    const elements = {
      wind: document.getElementById("dispersion-wind"),
      hmix: document.getElementById("dispersion-hmix"),
      direction: document.getElementById("dispersion-direction"),
      measure: document.getElementById("dispersion-measure"),
      play: document.getElementById("dispersion-play"),
      scene: document.getElementById("dispersion-scene")
    };

    function renderScene() {
      const result = experiment();
      lastScene = buildScene(result.after);
      elements.scene.innerHTML = lastScene.svg;
      document.getElementById("dispersion-scene-description").textContent = lastScene.description;
    }

    function render() {
      const result = experiment();
      elements.wind.value = state.wind;
      elements.hmix.value = state.hmix;
      elements.direction.value = state.direction;
      elements.measure.value = state.measure;
      document.getElementById("dispersion-wind-readout").textContent = `${fmt(state.wind, 1)} m/s`;
      document.getElementById("dispersion-hmix-readout").textContent = `${fmt(state.hmix, 0)} m`;
      document.querySelectorAll("[data-dispersion-view]").forEach(button => {
        const active = button.dataset.dispersionView === state.view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      elements.play.textContent = state.playing ? "Pausar" : "Reproducir";
      elements.play.setAttribute("aria-pressed", String(state.playing));
      document.getElementById("dispersion-live").textContent = state.playing ? "En movimiento" : "En pausa";
      document.getElementById("dispersion-rate").textContent = `${fmt(result.after.rate, 1)} m²/s`;
      document.getElementById("dispersion-vent-before").textContent = fmt(result.before.ventilation, 1);
      document.getElementById("dispersion-vent-after").textContent = fmt(result.after.ventilation, 1);
      document.getElementById("dispersion-stag-before").textContent = fmt(result.before.stagnation, 1);
      document.getElementById("dispersion-stag-after").textContent = fmt(result.after.stagnation, 1);
      document.getElementById("dispersion-effective").textContent = `${fmt(result.after.wind, 2)} m/s · ${fmt(result.after.hmix, 1)} m`;
      document.getElementById("dispersion-measure-note").textContent = result.selected.length ? `${result.selected.join(" + ")} aplicada al experimento` : "Sin medida: antes y después coinciden";
      renderScene();
    }

    const viewButtons = [...document.querySelectorAll("[data-dispersion-view]")];
    viewButtons.forEach((button, index) => {
      button.addEventListener("click", () => { state.view = button.dataset.dispersionView; render(); });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        viewButtons[(index + offset + viewButtons.length) % viewButtons.length].click();
        viewButtons[(index + offset + viewButtons.length) % viewButtons.length].focus();
      });
    });
    elements.wind.addEventListener("input", () => { state.wind = Number(elements.wind.value); render(); });
    elements.hmix.addEventListener("input", () => { state.hmix = Number(elements.hmix.value); render(); });
    elements.direction.addEventListener("change", () => { state.direction = elements.direction.value; render(); });
    elements.measure.addEventListener("change", () => { state.measure = elements.measure.value; render(); });
    elements.play.addEventListener("click", () => { state.playing = !state.playing; render(); });
    document.getElementById("dispersion-reset").addEventListener("click", () => {
      Object.assign(state, { view: initialView, wind: model.baseline.wind, hmix: model.baseline.hmix, direction: "east", measure: "none", playing: !reducedMotion, phase: 0 });
      render();
    });
    document.getElementById("dispersion-close").addEventListener("click", () => {
      if (embedded && window.parent !== window) window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      else if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) history.back();
      else location.href = "index.html";
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && embedded && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: "educational-resource:close" }, location.origin);
      }
    });

    function renderResourceToText() {
      const result = experiment();
      return JSON.stringify({
        resource: "dispersion",
        focus,
        view: state.view,
        coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
        current: {
          windMs: Number(current.wind.toFixed(3)),
          mixingHeightM: Number(current.hmix.toFixed(3)),
          ventilationRateM2s: Number(current.rate.toFixed(3)),
          ventilationIndex: Number(current.ventilation.toFixed(3)),
          stagnationIndex: Number(current.stagnation.toFixed(3)),
          legacyDerived
        },
        experiment: {
          windMs: Number(state.wind.toFixed(3)),
          mixingHeightM: Number(state.hmix.toFixed(3)),
          direction: state.direction,
          measures: result.selected,
          before: {
            rateM2s: Number(result.before.rate.toFixed(3)),
            ventilation: Number(result.before.ventilation.toFixed(3)),
            stagnation: Number(result.before.stagnation.toFixed(3))
          },
          after: {
            windMs: Number(result.after.wind.toFixed(3)),
            mixingHeightM: Number(result.after.hmix.toFixed(3)),
            rateM2s: Number(result.after.rate.toFixed(3)),
            ventilation: Number(result.after.ventilation.toFixed(3)),
            stagnation: Number(result.after.stagnation.toFixed(3))
          }
        },
        animation: { playing: state.playing, phase: Number(state.phase.toFixed(3)), simulatedHour: Number((state.phase * 24).toFixed(2)) },
        visible: { particles: lastScene.particles || 0, receptor: lastScene.receptor || null, layerTop: lastScene.layerTop ?? null }
      });
    }

    window.RESOURCE = { kind: "integrated-atmospheric-dispersion" };
    window.render_resource_to_text = renderResourceToText;
    window.render_game_to_text = renderResourceToText;
    window.advanceTime = ms => {
      if (state.playing) state.phase = (state.phase + Math.max(0, Number(ms) || 0) / 6000) % 1;
      renderScene();
      return renderResourceToText();
    };
    let lastFrame = performance.now();
    function animateDispersion(now) {
      const delta = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      if (state.playing) {
        state.phase = (state.phase + delta / 6000) % 1;
        renderScene();
      }
      requestAnimationFrame(animateDispersion);
    }
    render();
    if (!window.__vt_pending) requestAnimationFrame(animateDispersion);
  }

  function renderExposureLab(root) {
    const model = window.ExposureModel;
    if (!model) { root.textContent = "No fue posible cargar el modelo de exposición."; return; }
    const params = new URLSearchParams(location.search);
    const embedded = params.get("embedded") === "1";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const queryCurrent = params.has("current") ? Number(params.get("current")) : NaN;
    const queryValue = params.has("value") ? Number(params.get("value")) : NaN;
    const queryVulnerable = params.has("vulnerable") ? Number(params.get("vulnerable")) : NaN;
    const hasCurrent = Number.isFinite(queryCurrent);
    const hasLegacy = !hasCurrent && Number.isFinite(queryValue);
    const currentExposure = clamp(hasCurrent ? queryCurrent : hasLegacy ? queryValue : model.baseline.exposure, model.limits.exposure[0], model.limits.exposure[1]);
    const currentSusceptible = Number.isFinite(queryVulnerable) ? Math.max(0, Math.round(queryVulnerable)) : Math.round(currentExposure * model.susceptibleRatio);
    const initialExposure = hasLegacy ? currentExposure : model.baseline.exposure;
    const initialView = ["map", "day"].includes(params.get("view")) ? params.get("view") : "map";
    const state = { view: initialView, exposure: initialExposure, permanence: model.baseline.permanenceHours, environment: "mixed", measure: "none", p10: false, susceptibility: "hidden", playing: !reducedMotion, phase: 0 };
    const environments = {
      homes: { label: "Hogares", note: "La distribución destaca viviendas; la cercanía por sí sola no define cuántas personas están expuestas." },
      school: { label: "Colegio", note: "La distribución destaca el colegio y los desplazamientos escolares." },
      work: { label: "Trabajo", note: "La distribución destaca lugares de trabajo y viajes cotidianos." },
      mixed: { label: "Mixto", note: "La exposición diaria combina hogar, transporte, estudio, trabajo y espacios protegidos." }
    };
    const measureNames = { none: "Ninguna", P1: "Zona de bajas emisiones", P2: "Buses de baja emisión", P3: "Restricción vehicular", P4: "Movilidad activa", P5: "Arborización técnica", P6: "Corredores de ventilación", P7: "Control de polvo", P8: "Control de COV", P9: "Horarios escalonados" };
    let lastScene = {};
    function selectedMeasures() { return [...(state.measure === "none" ? [] : [state.measure]), ...(state.p10 ? ["P10"] : [])]; }
    function experiment() { return model.evaluateExperiment({ exposure: state.exposure, permanenceHours: state.permanence, measures: selectedMeasures() }); }
    function person(x, y, index, result, scale = 1) {
      const protectedRepresentatives = Math.round(16 * result.reduction);
      const protectedState = index < protectedRepresentatives;
      const susceptible = index < Math.round(16 * model.susceptibleRatio);
      const fill = protectedState ? "#21865b" : "#c44a3f";
      const ring = state.susceptibility === "highlight" && susceptible ? `<circle cx="0" cy="-8" r="15" fill="none" stroke="#6f45a6" stroke-width="4"/>` : "";
      return `<g class="exposure-person" data-person="${index + 1}" transform="translate(${x} ${y}) scale(${scale})">${ring}<circle cy="-13" r="7" fill="${fill}"/><path d="M0-5v21m-10-10L0 0l10 6M0 16l-8 14m8-14 8 14" fill="none" stroke="${fill}" stroke-width="5" stroke-linecap="round"/>${protectedState ? `<path d="M-13-25q13-12 26 0v12q0 18-13 25-13-7-13-25z" fill="#bce6cf" stroke="#21865b" stroke-width="2" opacity=".82"/>` : ""}</g>`;
    }
    function mapScene(result) {
      const layouts = {
        homes: [[475,85],[520,95],[570,82],[615,105],[475,145],[525,155],[575,145],[625,165],[440,235],[485,250],[535,235],[585,250],[630,235],[460,315],[535,315],[610,310]],
        school: [[455,75],[495,85],[535,75],[575,90],[615,78],[465,135],[510,145],[555,135],[600,150],[640,135],[455,205],[500,215],[545,205],[590,220],[635,205],[590,310]],
        work: [[430,72],[475,82],[520,72],[565,87],[610,75],[445,135],[490,145],[535,135],[580,150],[625,135],[450,235],[500,250],[550,235],[600,250],[530,315],[610,315]],
        mixed: [[430,78],[500,88],[575,78],[635,98],[450,150],[520,145],[600,155],[660,145],[430,235],[500,250],[570,235],[640,250],[455,325],[525,315],[595,325],[660,310]]
      };
      const people = layouts[state.environment].map(([x,y], i) => person(x, y, i, result, .72)).join("");
      const plumeOpacity = state.measure === "none" ? .28 : .14;
      return { people: 16, protectedRepresentatives: Math.round(16 * result.reduction), hour: state.phase * 24, svg: svgFrame("Mapa urbano con una fuente, dirección de pluma y dieciséis personas representativas que cambian entre exposición y protección", `
        <defs><marker id="exposure-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#c17b28"/></marker><linearGradient id="plume" x1="0" x2="1"><stop stop-color="#c44a3f" stop-opacity=".48"/><stop offset="1" stop-color="#c44a3f" stop-opacity="0"/></linearGradient></defs>
        <rect width="720" height="400" fill="#e7f0e4"/><path d="M0 185h720" stroke="#48545b" stroke-width="70"/><path d="M0 185h720" stroke="#f2cf55" stroke-width="4" stroke-dasharray="18 18"/>
        <g transform="translate(35 115)"><rect width="122" height="110" rx="9" fill="#768b94"/><rect x="20" y="-55" width="28" height="66" rx="4" fill="#596d76"/><text x="61" y="63" text-anchor="middle" font-size="13" font-weight="900" fill="white">FUENTE</text></g>
        <path d="M145 132C300 70 455 80 700 120L700 250C450 245 290 225 145 195Z" fill="url(#plume)" opacity="${plumeOpacity}"/><line x1="185" y1="95" x2="365" y2="95" stroke="#c17b28" stroke-width="8" stroke-linecap="round" marker-end="url(#exposure-arrow)"/><text x="275" y="78" text-anchor="middle" font-size="12" font-weight="900" fill="#8b571c">TRANSPORTE DE LA PLUMA</text>
        <g><rect x="405" y="25" width="120" height="74" rx="10" fill="#d7b38a" stroke="#9a764f"/><path d="M400 45l65-34 65 34" fill="#b15a4f"/><text x="465" y="72" text-anchor="middle" font-size="12" font-weight="900">HOGARES</text></g>
        <g><rect x="548" y="25" width="135" height="74" rx="10" fill="#d9e6ef" stroke="#7192a8"/><path d="M615 9v28m-18-14h36" stroke="#7192a8" stroke-width="8"/><text x="615" y="72" text-anchor="middle" font-size="12" font-weight="900">COLEGIO</text></g>
        <g><rect x="405" y="274" width="135" height="82" rx="10" fill="#d8dde0" stroke="#7b878d"/><rect x="430" y="292" width="22" height="24" fill="#9bb4c0"/><text x="472" y="340" text-anchor="middle" font-size="12" font-weight="900">TRABAJO</text></g>
        <g><rect x="565" y="274" width="126" height="82" rx="18" fill="#bfe3ce" stroke="#4a9a6d"/>${tree(590,315,.45)}${tree(660,315,.45)}<text x="628" y="345" text-anchor="middle" font-size="11" font-weight="900" fill="#246b49">ESPACIO PROTEGIDO</text></g>
        ${state.p10 ? `<g transform="translate(250 300)"><path d="M0 0h118v58H0z" fill="#fff4cf" stroke="#d39b28" stroke-width="3"/><text x="59" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#765112">ALERTA ACTIVA</text><text x="59" y="43" text-anchor="middle" font-size="10" fill="#765112">horarios y refugios</text></g>` : ""}${people}
        <rect x="20" y="345" width="245" height="38" rx="19" fill="white" opacity=".95"/><text x="142" y="369" text-anchor="middle" font-size="12" font-weight="900" fill="#365a47">16 figuras permanecen visibles</text>
      `, "#e7f0e4") };
    }
    function dayScene(result) {
      const hour = state.phase * 24;
      const stops = [{x:95,label:"HOGAR",color:"#d8b28a"},{x:275,label:"TRANSPORTE",color:"#7c8991"},{x:455,label:state.environment === "school" ? "COLEGIO" : "ESTUDIO / TRABAJO",color:"#9db8ca"},{x:625,label:"ESPACIO PROTEGIDO",color:"#9ed2b4"}];
      const active = hour < 6 || hour >= 21 ? 0 : hour < 8 || hour >= 17 && hour < 19 ? 1 : hour < 17 ? 2 : 3;
      const travel = ((state.phase * 4) % 1);
      const next = (active + 1) % 4;
      const centerX = active === 1 ? stops[0].x + (stops[2].x - stops[0].x) * travel : stops[active].x;
      const people = Array.from({length:16}, (_,i) => person(centerX + ((i%4)-1.5)*18, 222 + Math.floor(i/4)*30, i, result, .58)).join("");
      const exposedWidth = 600 * (state.permanence / 24);
      return { people: 16, protectedRepresentatives: Math.round(16 * result.reduction), hour, activeStop: stops[active].label, svg: svgFrame("Recorrido determinista de veinticuatro horas entre hogar, transporte, estudio o trabajo y espacio protegido", `
        <rect width="720" height="400" fill="#f4f5ee"/><text x="30" y="36" font-size="14" font-weight="900" fill="#355b47">DÍA DE EXPOSICIÓN · ${fmt(hour,1)} h</text>
        <line x1="70" y1="120" x2="650" y2="120" stroke="#cbd6cf" stroke-width="12" stroke-linecap="round"/>${stops.map((s,i)=>`<g><circle cx="${s.x}" cy="120" r="28" fill="${s.color}" stroke="${i===active ? "#235f45" : "white"}" stroke-width="${i===active ? 6 : 3}"/><text x="${s.x}" y="164" text-anchor="middle" font-size="10" font-weight="900" fill="#43564b">${s.label}</text></g>`).join("")}
        <path d="M${centerX-20} 185h40l-20 22z" fill="#235f45"/>${people}
        <rect x="50" y="342" width="620" height="18" rx="9" fill="#dce5df"/><rect x="50" y="342" width="${exposedWidth}" height="18" rx="9" fill="#c44a3f"/><line x1="${50+600*state.phase}" y1="330" x2="${50+600*state.phase}" y2="370" stroke="#17202a" stroke-width="4"/>
        ${[0,6,12,18,24].map((h,i)=>`<text x="${50+i*150}" y="388" text-anchor="middle" font-size="11" fill="#5f6f66">${h} h</text>`).join("")}<text x="360" y="326" text-anchor="middle" font-size="12" font-weight="900" fill="#9f3e35">${fmt(state.permanence,0)} h/día bajo exposición relevante</text>
      `, "#f4f5ee") };
    }
    function buildScene(result) { return state.view === "map" ? mapScene(result) : dayScene(result); }
    const closeLabel = embedded ? "Cerrar laboratorio" : "Volver al simulador";
    root.className = "resource-shell exposure-lab";
    root.innerHTML = `
      <nav class="resource-nav" aria-label="Navegación del recurso"><button class="back" id="exposure-close" type="button">← ${closeLabel}</button><span class="resource-tag">Laboratorio de exposición</span></nav>
      <header class="resource-header particulate-header"><div><p class="eyebrow">Ubicación, concentración y tiempo</p><h1>¿Cuántas personas permanecen expuestas?</h1><p class="lead">Explora cómo las medidas urbanas y la gestión dirigida cambian la exposición sin confundirla con concentración o enfermedad.</p></div><div class="header-mark" aria-hidden="true">●●●</div></header>
      <section class="exposure-current" aria-label="Estado actual transferido"><div><span>Población actual</span><strong>${fmt(currentExposure,0)} habitantes</strong></div><div><span>Subgrupo susceptible actual</span><strong>${fmt(currentSusceptible,0)}</strong><small>contexto didáctico, no censo</small></div><p>El experimento parte de ${fmt(initialExposure,0)} habitantes y no vuelve a aplicar automáticamente las políticas del plan.</p></section>
      <div class="view-tabs exposure-tabs" role="tablist" aria-label="Vista del laboratorio"><button type="button" role="tab" data-exposure-view="map">Mapa urbano</button><button type="button" role="tab" data-exposure-view="day">Día de exposición</button></div>
      <section class="particulate-workspace exposure-workspace"><article class="card scene-card particulate-scene-card"><div class="card-head"><div><h2>Escena sincronizada</h2><p id="exposure-scene-description"></p></div><span class="live-badge" id="exposure-live"></span></div><div class="particulate-scene" id="exposure-scene"></div><div class="scene-legend"><span class="legend-item"><i class="legend-dot" style="--dot:#c44a3f"></i>Bajo exposición relevante</span><span class="legend-item"><i class="legend-dot" style="--dot:#21865b"></i>Protegida por medidas</span><span class="legend-item"><i class="legend-dot" style="--dot:#6f45a6"></i>Mayor susceptibilidad</span></div></article>
      <aside class="card control-card particulate-controls exposure-controls"><h2>Experimenta</h2>
        <div class="control-group"><label class="control-label" for="exposure-population"><span>Población experimental</span><span class="control-readout" id="exposure-population-readout"></span></label><input id="exposure-population" type="range" min="27300" max="80000" step="100"><div class="range-labels"><span>27.300</span><span>80.000 habitantes</span></div></div>
        <div class="control-group"><label class="control-label" for="exposure-hours"><span>Permanencia promedio</span><span class="control-readout" id="exposure-hours-readout"></span></label><input id="exposure-hours" type="range" min="2" max="16" step="1"><div class="range-labels"><span>2 h/día</span><span>16 h/día</span></div></div>
        <div class="exposure-select-grid"><div class="control-group"><label class="control-label" for="exposure-environment"><span>Entorno dominante</span></label><select class="select-control" id="exposure-environment"><option value="homes">Hogares</option><option value="school">Colegio</option><option value="work">Trabajo</option><option value="mixed">Mixto</option></select></div><div class="control-group"><label class="control-label" for="exposure-measure"><span>Medida urbana</span></label><select class="select-control" id="exposure-measure">${Object.entries(measureNames).map(([value,label])=>`<option value="${value}">${value === "none" ? label : `${value} · ${label}`}</option>`).join("")}</select></div></div>
        <label class="exposure-toggle"><input type="checkbox" id="exposure-p10"><span><strong>Gestión dirigida P10</strong><small>Alertas, horarios y espacios protegidos · −18 %</small></span></label>
        <label class="exposure-toggle"><input type="checkbox" id="exposure-susceptibility"><span><strong>Destacar mayor susceptibilidad</strong><small>Solo cambia la capa explicativa.</small></span></label>
        <div class="playback-controls"><button id="exposure-play" type="button"></button><button class="secondary" id="exposure-reset" type="button">Restablecer</button></div><p class="didactic-note">Las figuras son representativas: su número permanece fijo. Cambian de ubicación o condición, no desaparecen.</p>
      </aside></section>
      <section class="exposure-results" aria-label="Resultados"><article class="card exposure-result-main"><p>Población después</p><strong id="exposure-after"></strong><span id="exposure-summary"></span></article><article class="card exposure-result-card"><p>Antes → después</p><strong><span id="exposure-before"></span> → <b id="exposure-after-small"></b></strong><small id="exposure-reduction"></small></article><article class="card exposure-result-card"><p>Personas protegidas</p><strong id="exposure-protected"></strong><small>fuera de exposición relevante</small></article><article class="card exposure-result-card"><p>Persona-horas/día</p><strong id="exposure-person-hours"></strong><small id="exposure-person-hours-before"></small></article><article class="card exposure-result-card"><p>Mayor susceptibilidad</p><strong id="exposure-susceptible"></strong><small>misma proporción didáctica 18.000 / 78.000</small></article></section>
      <section class="particulate-info-grid"><article class="card info-card"><span class="info-icon" aria-hidden="true">C×t</span><h2>Concentración y tiempo</h2><p>La exposición combina cuánto contaminante hay, dónde está la persona y durante cuánto tiempo permanece allí.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">↔</span><h2>No hay distancia universal</h2><p>La influencia de una vía también depende del tráfico, la dirección del aire, la topografía y el uso del suelo.</p></article><article class="card info-card"><span class="info-icon" aria-hidden="true">P10</span><h2>Gestionar no es emitir menos</h2><p>P10 cambia horarios, alertas o acceso a refugios; por eso reduce exposición sin reducir visualmente la fuente.</p></article></section>
      <section class="reference-note"><strong>Lectura correcta:</strong> la población es una cifra didáctica del escenario; persona-horas no es dosis inhalada y el subgrupo susceptible no es una estimación demográfica ni clínica.</section>`;
    const elements = { scene: document.getElementById("exposure-scene"), population: document.getElementById("exposure-population"), hours: document.getElementById("exposure-hours"), environment: document.getElementById("exposure-environment"), measure: document.getElementById("exposure-measure"), p10: document.getElementById("exposure-p10"), susceptibility: document.getElementById("exposure-susceptibility"), play: document.getElementById("exposure-play") };
    function renderScene() { const result = experiment(); lastScene = buildScene(result); elements.scene.innerHTML = lastScene.svg; document.getElementById("exposure-scene-description").textContent = state.view === "map" ? environments[state.environment].note : `Recorrido de 24 horas; el reloj está en ${fmt(lastScene.hour,1)} h y conserva ${fmt(state.permanence,0)} h/día de permanencia.`; }
    function render() {
      const result = experiment();
      Object.assign(elements.population,{value:state.exposure}); Object.assign(elements.hours,{value:state.permanence}); elements.environment.value=state.environment; elements.measure.value=state.measure; elements.p10.checked=state.p10; elements.susceptibility.checked=state.susceptibility==="highlight";
      document.getElementById("exposure-population-readout").textContent=`${fmt(state.exposure,0)} habitantes`; document.getElementById("exposure-hours-readout").textContent=`${fmt(state.permanence,0)} h/día`;
      document.querySelectorAll("[data-exposure-view]").forEach(button=>{const active=button.dataset.exposureView===state.view;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));button.tabIndex=active?0:-1;});
      elements.play.textContent=state.playing?"Pausar":"Reproducir"; elements.play.setAttribute("aria-pressed",String(state.playing)); document.getElementById("exposure-live").textContent=state.playing?"En movimiento":"En pausa";
      document.getElementById("exposure-after").textContent=`${fmt(result.after,0)} habitantes`; document.getElementById("exposure-summary").textContent=result.protectedPeople?`${fmt(result.protectedPeople,0)} personas menos bajo exposición relevante`:"Sin cambio respecto al escenario experimental";
      document.getElementById("exposure-before").textContent=fmt(result.before,0);document.getElementById("exposure-after-small").textContent=fmt(result.after,0);document.getElementById("exposure-reduction").textContent=result.reduction?`Reducción de ${fmt(result.reduction*100,0)} %`:"Sin cambio";document.getElementById("exposure-protected").textContent=fmt(result.protectedPeople,0);document.getElementById("exposure-person-hours").textContent=fmt(result.personHoursAfter,0);document.getElementById("exposure-person-hours-before").textContent=`Antes: ${fmt(result.personHoursBefore,0)}`;document.getElementById("exposure-susceptible").textContent=`${fmt(result.susceptibleBefore,0)} → ${fmt(result.susceptibleAfter,0)}`; renderScene();
    }
    const tabs=[...document.querySelectorAll("[data-exposure-view]")];tabs.forEach((button,index)=>{button.addEventListener("click",()=>{state.view=button.dataset.exposureView;render();});button.addEventListener("keydown",event=>{if(!["ArrowLeft","ArrowRight"].includes(event.key))return;event.preventDefault();const next=(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});});
    elements.population.addEventListener("input",()=>{state.exposure=Number(elements.population.value);render();});elements.hours.addEventListener("input",()=>{state.permanence=Number(elements.hours.value);render();});elements.environment.addEventListener("change",()=>{state.environment=elements.environment.value;render();});elements.measure.addEventListener("change",()=>{state.measure=elements.measure.value;render();});elements.p10.addEventListener("change",()=>{state.p10=elements.p10.checked;render();});elements.susceptibility.addEventListener("change",()=>{state.susceptibility=elements.susceptibility.checked?"highlight":"hidden";render();});elements.play.addEventListener("click",()=>{state.playing=!state.playing;render();});
    document.getElementById("exposure-reset").addEventListener("click",()=>{Object.assign(state,{view:"map",exposure:model.baseline.exposure,permanence:model.baseline.permanenceHours,environment:"mixed",measure:"none",p10:false,susceptibility:"hidden",playing:!reducedMotion,phase:0});render();});
    document.getElementById("exposure-close").addEventListener("click",()=>{if(embedded&&window.parent!==window)window.parent.postMessage({type:"educational-resource:close"},location.origin);else if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1)history.back();else location.href="index.html";});
    window.addEventListener("keydown",event=>{if(event.key==="Escape"&&embedded&&window.parent!==window){event.preventDefault();window.parent.postMessage({type:"educational-resource:close"},location.origin);}});
    function renderResourceToText(){const result=experiment();return JSON.stringify({resource:"exposure",view:state.view,coordinateSystem:"SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",current:{exposedPeople:Math.round(currentExposure),susceptiblePeople:currentSusceptible},experiment:{before:result.before,after:result.after,protectedPeople:result.protectedPeople,reductionPercent:Number((result.reduction*100).toFixed(2)),permanenceHours:result.permanenceHours,personHoursBefore:result.personHoursBefore,personHoursAfter:result.personHoursAfter,susceptibleBefore:result.susceptibleBefore,susceptibleAfter:result.susceptibleAfter,environment:state.environment,urbanMeasure:state.measure,p10:state.p10,measures:result.selected,susceptibilityLayer:state.susceptibility},animation:{playing:state.playing,phase:Number(state.phase.toFixed(3)),simulatedHour:Number((state.phase*24).toFixed(2))},visible:{representativePeople:lastScene.people||0,protectedRepresentatives:lastScene.protectedRepresentatives||0,activeStop:lastScene.activeStop||null}});}
    window.RESOURCE={kind:"urban-population-exposure"};window.render_resource_to_text=renderResourceToText;window.render_game_to_text=renderResourceToText;window.advanceTime=ms=>{if(state.playing)state.phase=(state.phase+Math.max(0,Number(ms)||0)/6000)%1;renderScene();return renderResourceToText();};
    let lastFrame=performance.now();function animateExposure(now){const delta=Math.min(50,Math.max(0,now-lastFrame));lastFrame=now;if(state.playing){state.phase=(state.phase+delta/6000)%1;renderScene();}requestAnimationFrame(animateExposure);}render();if(!window.__vt_pending)requestAnimationFrame(animateExposure);
  }

  const key = document.body.dataset.resource;
  const root = document.getElementById("resource-app");
  if (!root) return;

  if (key === "pm25" || key === "pm10") {
    renderParticulateLab(key, root);
    return;
  }

  if (key === "co2") {
    renderCo2Lab(root);
    return;
  }

  if (key === "nox") {
    renderNoxLab(root);
    return;
  }

  if (key === "o3") {
    renderOzoneLab(root);
    return;
  }

  if (key === "cov") {
    renderCovLab(root);
    return;
  }

  if (key === "temp") {
    renderTemperatureLab(root);
    return;
  }

  if (key === "dispersion") {
    renderDispersionLab(root);
    return;
  }

  if (key === "exposure") {
    renderExposureLab(root);
    return;
  }

  const config = resources[key];
  if (!config) return;

  const state = {};
  const controls = [config.primary, ...(config.secondary || [])];
  controls.forEach(control => { state[control.id] = control.value; });

  const rawQueryValue = new URLSearchParams(location.search).get("value");
  const queryValue = Number(rawQueryValue);
  if (rawQueryValue !== null && Number.isFinite(queryValue)) {
    state[config.primary.id] = config.fromQuery ? config.fromQuery(queryValue) : clamp(queryValue, config.primary.min, config.primary.max);
    if (config.afterQuery) config.afterQuery(state, queryValue);
  }

  document.title = `Recurso educativo: ${config.title}`;
  document.documentElement.style.setProperty("--accent", config.accent);
  document.documentElement.style.setProperty("--scene-tint", config.tint);

  function controlMarkup(control) {
    if (control.type === "select") {
      return `<div class="control-group"><label class="control-label" for="control-${control.id}"><span>${control.label}</span></label><select class="select-control" id="control-${control.id}">${control.options.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}</select></div>`;
    }
    const digits = control.digits ?? (String(control.step).includes(".") ? 1 : 0);
    return `<div class="control-group"><label class="control-label" for="control-${control.id}"><span>${control.label}</span><span class="control-readout" id="readout-${control.id}">${fmt(state[control.id], digits)} ${control.unit || ""}</span></label><input id="control-${control.id}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${state[control.id]}" aria-describedby="range-${control.id}"><div class="range-labels" id="range-${control.id}"><span>${control.low || control.min}</span><span>${control.high || control.max}</span></div></div>`;
  }

  root.className = "resource-shell";
  root.innerHTML = `
    <nav class="resource-nav" aria-label="Navegación del recurso"><a class="back" href="index.html">← Volver al simulador</a><span class="resource-tag">Laboratorio interactivo</span></nav>
    <header class="resource-header"><div><p class="eyebrow">${config.eyebrow}</p><h1>${config.title}</h1><p class="lead">${config.lead}</p></div><div class="header-mark" aria-hidden="true">${config.mark}</div></header>
    <section class="lab" aria-label="Laboratorio de ${config.title}">
      <article class="card scene-card"><div class="card-head"><div><h2>Observa el fenómeno</h2><p>La escena responde a los controles sin cambiar elementos al azar.</p></div><span class="live-badge">En vivo</span></div><div class="scene" id="scene"></div><div class="scene-legend" id="scene-legend"></div></article>
      <aside class="card control-card"><h2>Experimenta</h2>${controls.map(controlMarkup).join("")}<div class="metric" aria-live="polite"><span class="metric-caption">Resultado estimado</span><div class="metric-value"><strong id="metric-value"></strong><span id="metric-unit"></span></div><span class="status" id="status"></span></div><p class="explanation" id="explanation"></p><p class="didactic-note">Modelo didáctico para comparar relaciones de causa y efecto; no sustituye mediciones ni normas oficiales.</p></aside>
    </section>
    <section class="info-grid" aria-label="Información clave">${config.info.map(item => `<article class="card info-card"><span class="info-icon" aria-hidden="true">${item.icon}</span><h2>${item.title}</h2><p>${item.text}</p></article>`).join("")}</section>
    <section class="challenge"><strong aria-hidden="true">?</strong><p><b>Reto de observación:</b> ${config.challenge}</p></section>`;

  controls.forEach(control => {
    const element = document.getElementById(`control-${control.id}`);
    element.value = state[control.id];
    const eventName = control.type === "select" ? "change" : "input";
    element.addEventListener(eventName, () => {
      state[control.id] = Number(element.value);
      render();
    });
  });

  let lastOutput = null;
  function render() {
    controls.forEach(control => {
      if (control.type === "select") return;
      const digits = control.digits ?? (String(control.step).includes(".") ? 1 : 0);
      document.getElementById(`readout-${control.id}`).textContent = `${fmt(state[control.id], digits)} ${control.unit || ""}`.trim();
    });
    lastOutput = config.compute(state);
    document.getElementById("scene").innerHTML = lastOutput.scene.svg;
    document.getElementById("scene-legend").innerHTML = lastOutput.scene.legend.map(item => `<span class="legend-item"><i class="legend-dot" style="--dot:${item.color}"></i>${item.label}</span>`).join("");
    document.getElementById("metric-value").textContent = fmt(lastOutput.value, lastOutput.digits || 0);
    document.getElementById("metric-unit").textContent = lastOutput.unit;
    const status = document.getElementById("status");
    status.textContent = lastOutput.category;
    status.className = `status ${lastOutput.tone || ""}`;
    document.getElementById("explanation").textContent = lastOutput.explanation;
  }

  function renderResourceToText() {
    return JSON.stringify({
      resource: key,
      title: config.title,
      coordinateSystem: "SVG viewBox 720x400; origen arriba a la izquierda; x hacia la derecha, y hacia abajo",
      controls: Object.fromEntries(controls.map(control => [control.id, state[control.id]])),
      result: lastOutput ? { value: Number(lastOutput.value.toFixed(2)), unit: lastOutput.unit, category: lastOutput.category } : null
    });
  }

  window.RESOURCE = config;
  window.render_resource_to_text = renderResourceToText;
  window.render_game_to_text = renderResourceToText;
  window.advanceTime = () => render();
  render();
})();
