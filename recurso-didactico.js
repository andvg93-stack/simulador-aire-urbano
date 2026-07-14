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

  function co2Scene(level) {
    const cars = Math.round(2 + level * 6);
    const bubbles = deterministicDots(Math.round(5 + level * 15), { x: 46, y: 35, width: 620, height: 190, color: "#657985", minRadius: 7, maxRadius: 15, opacity: 0.24 });
    const carMarkup = Array.from({ length: cars }, (_, index) => car(38 + index * 92, 326, index % 2 ? palette.blue : palette.red, 0.82)).join("");
    return {
      svg: svgFrame("Calle urbana donde el tráfico incrementa el dióxido de carbono", `
        <rect width="720" height="320" fill="url(#sky)"/>
        <circle cx="650" cy="64" r="35" fill="${palette.yellow}" opacity=".88"/>
        ${bubbles}${buildings(310)}
        <rect y="306" width="720" height="94" fill="${palette.road}"/>
        <line x1="0" y1="355" x2="720" y2="355" stroke="#f6df76" stroke-width="4" stroke-dasharray="28 22"/>
        ${carMarkup}
        <g transform="translate(28 24)"><rect width="158" height="42" rx="21" fill="#fff" opacity=".92"/><circle cx="22" cy="21" r="8" fill="#657985" opacity=".45"/><text x="42" y="26" font-size="13" font-weight="800" fill="${palette.ink}">Actividad vehicular</text></g>
      `, "#edf3f7"),
      legend: [{ label: "CO₂ indicativo", color: "#657985" }, { label: "Tráfico urbano", color: palette.red }]
    };
  }

  function noxScene(level) {
    const cars = Math.round(2 + level * 6);
    const carMarkup = Array.from({ length: cars }, (_, index) => {
      const x = 25 + index * 96;
      return `${car(x, 318, index % 2 ? "#4f7183" : palette.red, 0.85)}<path d="M${x + 54} 324c34-28 54-31 80-25" fill="none" stroke="${palette.blue}" stroke-width="${5 + level * 10}" stroke-linecap="round" opacity="${0.18 + level * 0.4}"/>`;
    }).join("");
    return {
      svg: svgFrame("Vehículos emitiendo óxidos de nitrógeno y participando en la formación de ozono", `
        <rect width="720" height="304" fill="url(#sky)"/>
        ${buildings(304)}
        <g transform="translate(482 34)"><circle cx="42" cy="42" r="33" fill="${palette.yellow}"/><path d="M93 42h55" stroke="${palette.orange}" stroke-width="4" marker-end="url(#arrow)"/><rect x="155" y="16" width="104" height="54" rx="14" fill="#fff"/><text x="207" y="49" text-anchor="middle" font-size="18" font-weight="900" fill="${palette.red}">O₃</text></g>
        <rect y="302" width="720" height="98" fill="${palette.road}"/>
        <line x1="0" y1="358" x2="720" y2="358" stroke="#f6df76" stroke-width="4" stroke-dasharray="28 22"/>
        ${carMarkup}
        <g transform="translate(24 25)"><rect width="140" height="42" rx="21" fill="#fff"/><circle cx="23" cy="21" r="8" fill="${palette.blue}" opacity=".5"/><text x="42" y="26" font-size="13" font-weight="800" fill="${palette.ink}">Pluma de NOx</text></g>
      `, "#f3f5f7"),
      legend: [{ label: "Emisión de NOx", color: palette.blue }, { label: "Precursor de O₃", color: palette.yellow }]
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
    co2: {
      title: "CO₂", eyebrow: "Indicador de combustión urbana", mark: "CO₂", accent: "#506773", tint: "#edf3f7",
      lead: "El dióxido de carbono ayuda a representar combustión y actividad vehicular, aunque no es el contaminante criterio local más tóxico a estas escalas.",
      primary: { id: "traffic", label: "Intensidad del tráfico", min: 0, max: 100, step: 1, value: 55, unit: "%", low: "Tráfico bajo", high: "Tráfico alto" },
      fromQuery: value => clamp((value - 410) / 1.7, 0, 100),
      compute: s => { const r = s.traffic / 100; const value = 410 + s.traffic * 1.7; return { value, digits: 0, unit: "ppm", category: categoryFor(r, ["Actividad baja", "Actividad media", "Actividad alta"]), tone: r < .68 ? "info" : "warn", explanation: "Al aumentar el tráfico crecen los vehículos y la señal estimada de CO₂. La cifra es una relación didáctica, no una medición ambiental.", scene: co2Scene(r) }; },
      info: [{ icon: "🚗", title: "Fuente", text: "Motores, combustión y consumo de combustibles en la ciudad." }, { icon: "📍", title: "Interpretación", text: "Aquí funciona como indicador de actividad, no como índice local de toxicidad." }, { icon: "🔌", title: "Acciones", text: "Movilidad eléctrica, transporte público y reducción de viajes motorizados." }],
      challenge: "¿Qué cambia en la calle cuando duplicas la intensidad del tráfico?"
    },
    nox: {
      title: "NOx", eyebrow: "Óxidos de nitrógeno", mark: "NOx", accent: "#2563a8", tint: "#eaf3fa",
      lead: "Se originan principalmente en motores y otras combustiones; además participan en la química que forma ozono troposférico.",
      primary: { id: "combustion", label: "Vehículos de combustión", min: 0, max: 100, step: 1, value: 70, unit: "%", low: "Pocos", high: "Muchos" },
      fromQuery: value => clamp((value - 15) / 1.1, 0, 100),
      compute: s => { const r = s.combustion / 100; const value = 15 + s.combustion * 1.1; return { value, digits: 0, unit: "ppb", category: categoryFor(r, ["Emisión baja", "Emisión media", "Emisión alta"]), tone: toneFor(r), explanation: "Más vehículos de combustión producen una pluma más intensa y aportan precursores para la formación de O₃.", scene: noxScene(r) }; },
      info: [{ icon: "🚌", title: "Fuente", text: "Motores diésel y gasolina, calderas y combustión industrial." }, { icon: "🫁", title: "Efectos", text: "Irrita el sistema respiratorio y empeora algunas condiciones pulmonares." }, { icon: "☀️", title: "Química", text: "Con COV y radiación participa en la formación de ozono troposférico." }],
      challenge: "Reduce los vehículos y observa qué partes de la escena cambian y cuáles permanecen."
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

  const key = document.body.dataset.resource;
  const config = resources[key];
  const root = document.getElementById("resource-app");
  if (!config || !root) return;

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
