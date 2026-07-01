const fs = require("fs");
const vm = require("vm");

const INDEX_PATH = "index.html";
const JSON_OUT = "policy-audit-report.json";
const MD_OUT = "policy-audit-summary.md";
const CSV_OUT = "policy-audit-combinations.csv";

function extractConst(source, name) {
  const regex = new RegExp(`const\\s+${name}\\s*=\\s*([\\s\\S]*?);\\r?\\n`);
  const match = source.match(regex);
  if (!match) throw new Error(`No se encontro const ${name}`);
  return match[1].trim();
}

function readIndexModel() {
  const source = fs.readFileSync(INDEX_PATH, "utf8");
  const context = {};
  const baseline = vm.runInNewContext(`(${extractConst(source, "baseline")})`, context);
  const policies = vm.runInNewContext(`(${extractConst(source, "policies")})`, context);
  const budget = Number(extractConst(source, "BUDGET"));
  const maxPolicies = Number(extractConst(source, "MAX_POLICIES"));
  const totalYears = Number(extractConst(source, "TOTAL_YEARS"));
  return { baseline, policies, budget, maxPolicies, totalYears };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmt(value, digits = 1) {
  return Number(value).toLocaleString("es-CO", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  });
}

function policyProgress(policy, year, startYear = 1) {
  const elapsed = year - (startYear - 1);
  if (elapsed <= 0) return 0;
  const ramp = clamp(elapsed / policy.implementation, 0, 1);
  if (!policy.degradation || elapsed <= policy.implementation) return ramp;
  const decay = clamp((elapsed - policy.implementation) / policy.degradation, 0, 1);
  return ramp * (1 - (0.8 * decay));
}

function buildEffectSums(model, selectedPolicies, year) {
  const { baseline } = model;
  const sums = { pm25: 0, pm10: 0, co2: 0, nox: 0, cov: 0, temp: 0, wind: 0, hmix: 0, exposure: 0 };
  let acceptance = baseline.acceptance;
  let equity = baseline.equity;

  selectedPolicies.forEach(policy => {
    const progress = policyProgress(policy, year, 1);
    Object.keys(sums).forEach(key => {
      sums[key] += (policy.effects[key] || 0) * progress;
    });
    acceptance += policy.acceptance * progress;
    equity += policy.equity * progress;
  });

  return {
    sums,
    acceptance: clamp(acceptance, 0, 100),
    equity: clamp(equity, 0, 100)
  };
}

function calculateValues(model, selectedPolicies, year) {
  const { baseline } = model;
  const { sums, acceptance, equity } = buildEffectSums(model, selectedPolicies, year);
  const pm25 = baseline.pm25 * clamp(1 + sums.pm25, 0.25, 1.25);
  const pm10 = baseline.pm10 * clamp(1 + sums.pm10, 0.25, 1.25);
  const co2 = baseline.co2 * clamp(1 + sums.co2, 0.65, 1.15);
  const nox = baseline.nox * clamp(1 + sums.nox, 0.25, 1.25);
  const cov = baseline.cov * clamp(1 + sums.cov, 0.25, 1.25);
  const temp = baseline.temp + sums.temp;
  const wind = baseline.wind * clamp(1 + sums.wind, 0.55, 1.65);
  const hmix = baseline.hmix * clamp(1 + sums.hmix, 0.8, 1.45);
  const exposure = baseline.exposure * clamp(1 + sums.exposure, 0.35, 1.05);
  const vent = clamp(baseline.vent + ((wind / baseline.wind - 1) * 58) + ((hmix / baseline.hmix - 1) * 34) + (Math.max(0, -sums.pm25) * 32), 0, 100);
  const stagnation = clamp(100 - vent, 0, 100);

  const covReduction = clamp(1 - (cov / baseline.cov), -0.2, 0.8);
  const noxReduction = clamp(1 - (nox / baseline.nox), -0.2, 0.8);
  let factorNoxCov = 0;
  if (covReduction >= 0.20) {
    factorNoxCov = -0.12;
  } else if (noxReduction >= 0.20 && covReduction < 0.10) {
    factorNoxCov = 0.08;
  } else if (noxReduction >= 0.20 && covReduction >= 0.10) {
    factorNoxCov = -0.05;
  }
  const factorTemp = Math.max(0, temp - baseline.temp) * 0.03;
  const factorVent = Math.max(0, (wind / baseline.wind - 1) * 100) * -0.005;
  const o3 = clamp(baseline.o3 * (1 + factorNoxCov + factorTemp + factorVent), 6, 90);

  return { year, pm25, pm10, co2, nox, o3, cov, temp, wind, hmix, vent, stagnation, exposure, acceptance, equity };
}

function reduction(model, key, values) {
  return (model.baseline[key] - values[key]) / model.baseline[key];
}

function evaluatePlan(model, selectedPolicies, values) {
  const cost = selectedPolicies.reduce((total, policy) => total + policy.cost, 0);
  const budgetOk = cost <= model.budget;
  const criteria = [
    { label: "PM2.5", pass: reduction(model, "pm25", values) >= 0.30 },
    { label: "PM10", pass: reduction(model, "pm10", values) >= 0.20 },
    { label: "NOx", pass: reduction(model, "nox", values) >= 0.25 },
    { label: "Exposicion", pass: reduction(model, "exposure", values) >= 0.20 },
    { label: "Aceptacion", pass: values.acceptance >= 50 },
    { label: "Equidad interna", pass: values.equity >= 55, internal: true },
    { label: "O3", pass: ((values.o3 - model.baseline.o3) / model.baseline.o3) <= 0.05 }
  ];
  const failures = criteria.filter(item => !item.pass);
  const o3Increase = (values.o3 - model.baseline.o3) / model.baseline.o3;

  let status = "Parcialmente aceptable";
  let tone = "warn";
  if (
    !budgetOk ||
    o3Increase > 0.10 ||
    values.acceptance < 40 ||
    reduction(model, "pm25", values) < 0.18 ||
    reduction(model, "nox", values) < 0.12 ||
    reduction(model, "exposure", values) <= 0
  ) {
    status = "No aceptable";
    tone = "bad";
  } else if (budgetOk && failures.length === 0) {
    status = "Aceptable";
    tone = "good";
  } else if (budgetOk && failures.length <= 2) {
    status = "Parcialmente aceptable";
    tone = "warn";
  } else {
    status = "No aceptable";
    tone = "bad";
  }

  return { status, tone, failures: failures.map(item => item.label), criteria, budgetOk };
}

function combinations(items, maxSize) {
  const result = [];
  function walk(start, picked) {
    result.push([...picked]);
    if (picked.length >= maxSize) return;
    for (let i = start; i < items.length; i++) {
      picked.push(items[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  }
  walk(0, []);
  return result;
}

function statusRank(status) {
  return { "No aceptable": 0, "Parcialmente aceptable": 1, "Aceptable": 2 }[status] ?? 0;
}

function evaluateCombination(model, combo, year = model.totalYears) {
  const cost = combo.reduce((total, policy) => total + policy.cost, 0);
  const final = calculateValues(model, combo, year);
  const evaluation = evaluatePlan(model, combo, final);
  return {
    codes: combo.map(policy => policy.code),
    names: combo.map(policy => policy.name),
    cost,
    status: evaluation.status,
    failures: evaluation.failures,
    values: {
      pm25: final.pm25,
      pm10: final.pm10,
      nox: final.nox,
      o3: final.o3,
      cov: final.cov,
      exposure: final.exposure,
      acceptance: final.acceptance,
      equity: final.equity,
      vent: final.vent,
      stagnation: final.stagnation
    },
    reductions: {
      pm25: reduction(model, "pm25", final),
      pm10: reduction(model, "pm10", final),
      nox: reduction(model, "nox", final),
      exposure: reduction(model, "exposure", final),
      cov: reduction(model, "cov", final),
      equityChange: final.equity - model.baseline.equity
    }
  };
}

function buildMarginal(model, evaluations) {
  const byCodes = new Map(evaluations.map(item => [item.codes.join(","), item]));
  return model.policies.map(policy => {
    const included = evaluations.filter(item => item.codes.includes(policy.code));
    const excluded = evaluations.filter(item => !item.codes.includes(policy.code));
    let improves = 0;
    let worsens = 0;
    let unchanged = 0;

    excluded.forEach(base => {
      if (base.codes.length >= model.maxPolicies) return;
      const comboPolicies = base.codes.map(code => model.policies.find(policy => policy.code === code));
      const candidateCost = comboPolicies.reduce((total, item) => total + item.cost, 0) + policy.cost;
      if (candidateCost > model.budget) return;
      const candidateCodes = [...base.codes, policy.code].sort();
      const candidate = byCodes.get(candidateCodes.join(","));
      if (!candidate) return;
      const diff = statusRank(candidate.status) - statusRank(base.status);
      if (diff > 0) improves++;
      else if (diff < 0) worsens++;
      else unchanged++;
    });

    return {
      code: policy.code,
      name: policy.name,
      includedStatusCounts: countStatuses(included),
      hasAcceptableWithPolicy: included.some(item => item.status === "Aceptable"),
      hasAcceptableWithoutPolicy: excluded.some(item => item.status === "Aceptable"),
      marginal: { improves, worsens, unchanged }
    };
  });
}

function countStatuses(items) {
  return {
    aceptable: items.filter(item => item.status === "Aceptable").length,
    parcial: items.filter(item => item.status === "Parcialmente aceptable").length,
    noAceptable: items.filter(item => item.status === "No aceptable").length
  };
}

function buildIntentChecks(model, evaluations, marginal) {
  const finalSingle = model.policies.map(policy => evaluateCombination(model, [policy]));
  const peakSingle = model.policies.map(policy => evaluateCombination(model, [policy], policy.implementation));
  const byCode = Object.fromEntries(peakSingle.map(item => [item.codes[0], item]));
  const byCodeFinal = Object.fromEntries(finalSingle.map(item => [item.codes[0], item]));
  const marginalByCode = Object.fromEntries(marginal.map(item => [item.code, item]));
  const acceptablePlans = evaluations.filter(item => item.status === "Aceptable");
  const p3AcceptableShare = acceptablePlans.length
    ? acceptablePlans.filter(item => item.codes.includes("P3")).length / acceptablePlans.length
    : 0;
  const byCodes = new Map(evaluations.map(item => [item.codes.join(","), item]));
  const p10MasksBadEmissions = evaluations.some(base => {
    if (base.codes.includes("P10") || base.codes.length >= model.maxPolicies) return false;
    const comboPolicies = base.codes.map(code => model.policies.find(policy => policy.code === code));
    const p10 = model.policies.find(policy => policy.code === "P10");
    const candidateCost = comboPolicies.reduce((total, item) => total + item.cost, 0) + p10.cost;
    if (candidateCost > model.budget) return false;
    const candidate = byCodes.get([...base.codes, "P10"].sort().join(","));
    return Boolean(
      candidate &&
      candidate.status === "Aceptable" &&
      (base.reductions.pm25 < 0.18 || base.reductions.nox < 0.12)
    );
  });
  const maxPm10Single = peakSingle.reduce((best, item) => item.reductions.pm10 > best.reductions.pm10 ? item : best, peakSingle[0]);
  return [
    {
      check: "P3 no domina los planes aceptables",
      pass: p3AcceptableShare < 0.70,
      evidence: `P3 aparece en ${fmt(p3AcceptableShare * 100)}% de planes aceptables`
    },
    {
      check: "P7 impacta especialmente PM10",
      pass: maxPm10Single.codes[0] === "P7",
      evidence: `Mayor reduccion individual PM10 al efecto completo: ${maxPm10Single.codes[0]} (${fmt(maxPm10Single.reductions.pm10 * 100)}%); al ano 5 P7 queda en ${fmt(byCodeFinal.P7.reductions.pm10 * 100)}% por degradacion`
    },
    {
      check: "P8 reduce COV sin disparar O3",
      pass: byCode.P8.reductions.cov >= 0.15 && byCode.P8.values.o3 <= model.baseline.o3 * 1.05,
      evidence: `COV ${fmt(byCode.P8.reductions.cov * 100)}%, O3 ${fmt(byCode.P8.values.o3, 1)} ppb al efecto completo; al ano 5 COV ${fmt(byCodeFinal.P8.reductions.cov * 100)}%`
    },
    {
      check: "P10 mejora exposicion sin reducir emisiones",
      pass: byCode.P10.reductions.exposure >= 0.08 && Math.abs(byCode.P10.reductions.pm25) < 0.001 && Math.abs(byCode.P10.reductions.nox) < 0.001,
      evidence: `Exposicion ${fmt(byCode.P10.reductions.exposure * 100)}%, PM2.5 ${fmt(byCode.P10.reductions.pm25 * 100)}%, NOx ${fmt(byCode.P10.reductions.nox * 100)}% al efecto completo`
    },
    {
      check: "P10 no maquilla planes sin reduccion minima de emisiones",
      pass: !p10MasksBadEmissions,
      evidence: p10MasksBadEmissions ? "Existe al menos un plan que P10 vuelve aceptable sin minimo de PM2.5 o NOx" : "Ningun plan aceptable depende de P10 para ocultar emisiones insuficientes"
    },
    {
      check: "P6 mejora ventilacion y estancamiento",
      pass: byCode.P6.values.vent > model.baseline.vent && byCode.P6.values.stagnation < model.baseline.stagnation,
      evidence: `Vent ${fmt(byCode.P6.values.vent, 0)} vs ${model.baseline.vent}; estancamiento ${fmt(byCode.P6.values.stagnation, 0)} vs ${model.baseline.stagnation}`
    },
    {
      check: "P3 reduce emisiones y penaliza aceptacion",
      pass: byCode.P3.reductions.pm25 > 0.05 && byCode.P3.values.acceptance < model.baseline.acceptance,
      evidence: `PM2.5 ${fmt(byCode.P3.reductions.pm25 * 100)}%, aceptacion ${fmt(byCode.P3.values.acceptance, 0)}`
    },
    {
      check: "P7, P8 y P9 ganan peso marginal",
      pass: marginalByCode.P7.marginal.improves > 25 && marginalByCode.P8.marginal.improves > 9 && marginalByCode.P9.marginal.improves > 15,
      evidence: `Mejoras P7 ${marginalByCode.P7.marginal.improves}, P8 ${marginalByCode.P8.marginal.improves}, P9 ${marginalByCode.P9.marginal.improves}`
    }
  ];
}

function buildBalanceFindings(model, evaluations, marginal) {
  const acceptable = evaluations.filter(item => item.status === "Aceptable");
  const singleAcceptable = evaluations.filter(item => item.codes.length === 1 && item.status === "Aceptable");
  const poison = marginal.filter(item => !item.hasAcceptableWithPolicy).map(item => item.code);
  const alwaysWin = marginal.filter(item => {
    const included = evaluations.filter(plan => plan.codes.includes(item.code));
    return included.length > 0 && included.every(plan => plan.status === "Aceptable");
  }).map(item => item.code);
  return {
    hasAcceptablePlan: acceptable.length > 0,
    acceptablePlanCount: acceptable.length,
    acceptableRatio: evaluations.length ? acceptable.length / evaluations.length : 0,
    singlePolicyAcceptable: singleAcceptable.map(item => item.codes[0]),
    poisonPolicies: poison,
    alwaysWinPolicies: alwaysWin,
    tooManyAcceptableWarning: acceptable.length > evaluations.length * 0.25
  };
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(evaluations) {
  const header = [
    "politicas",
    "costo",
    "estado",
    "criterios_fallidos",
    "pm25_final",
    "pm25_reduccion_pct",
    "pm10_final",
    "pm10_reduccion_pct",
    "nox_final",
    "nox_reduccion_pct",
    "cov_final",
    "cov_reduccion_pct",
    "o3_final",
    "exposicion_final",
    "exposicion_reduccion_pct",
    "aceptacion_final",
    "equidad_interna_final",
    "equidad_interna_cambio_pts",
    "equidad_interna_ok",
    "ventilacion_final",
    "estancamiento_final"
  ];
  const rows = evaluations.map(plan => [
    plan.codes.join("+") || "baseline",
    plan.cost,
    plan.status,
    plan.failures.join("|") || "-",
    plan.values.pm25.toFixed(2),
    (plan.reductions.pm25 * 100).toFixed(2),
    plan.values.pm10.toFixed(2),
    (plan.reductions.pm10 * 100).toFixed(2),
    plan.values.nox.toFixed(2),
    (plan.reductions.nox * 100).toFixed(2),
    plan.values.cov.toFixed(2),
    (plan.reductions.cov * 100).toFixed(2),
    plan.values.o3.toFixed(2),
    plan.values.exposure.toFixed(0),
    (plan.reductions.exposure * 100).toFixed(2),
    plan.values.acceptance.toFixed(2),
    plan.values.equity.toFixed(2),
    plan.reductions.equityChange.toFixed(2),
    plan.values.equity >= 55 ? "si" : "no",
    plan.values.vent.toFixed(2),
    plan.values.stagnation.toFixed(2)
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(",")).join("\n") + "\n";
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Auditoria de balance de politicas");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Resumen");
  lines.push("");
  lines.push(`- Combinaciones evaluadas: ${report.summary.totalEvaluated}`);
  lines.push(`- Aceptables: ${report.summary.statusCounts.aceptable}`);
  lines.push(`- Parcialmente aceptables: ${report.summary.statusCounts.parcial}`);
  lines.push(`- No aceptables: ${report.summary.statusCounts.noAceptable}`);
  lines.push(`- Porcentaje aceptable: ${fmt(report.balanceFindings.acceptableRatio * 100)}%`);
  lines.push(`- Existe plan aceptable: ${report.balanceFindings.hasAcceptablePlan ? "si" : "no"}`);
  lines.push(`- Politicas aceptables por si solas: ${report.balanceFindings.singlePolicyAcceptable.join(", ") || "ninguna"}`);
  lines.push(`- Politicas veneno: ${report.balanceFindings.poisonPolicies.join(", ") || "ninguna"}`);
  lines.push(`- Politicas boton de ganar: ${report.balanceFindings.alwaysWinPolicies.join(", ") || "ninguna"}`);
  lines.push(`- Advertencia por demasiados aceptables: ${report.balanceFindings.tooManyAcceptableWarning ? "si" : "no"}`);
  lines.push("");
  lines.push("## Mejores planes aceptables");
  lines.push("");
  lines.push("| Politicas | Costo | PM2.5 | PM10 | NOx | Exposicion | Aceptacion | Equidad int. | Fallas |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---|");
  report.bestAcceptablePlans.forEach(plan => {
    lines.push(`| ${plan.codes.join("+")} | ${plan.cost} | ${fmt(plan.reductions.pm25 * 100)}% | ${fmt(plan.reductions.pm10 * 100)}% | ${fmt(plan.reductions.nox * 100)}% | ${fmt(plan.reductions.exposure * 100)}% | ${fmt(plan.values.acceptance, 0)} | ${fmt(plan.values.equity, 0)} | ${plan.failures.join(", ") || "-"} |`);
  });
  if (!report.bestAcceptablePlans.length) lines.push("| - | - | - | - | - | - | - | - | - |");
  lines.push("");
  lines.push("## Analisis marginal");
  lines.push("");
  lines.push("| Politica | Con aceptable | Sin aceptable | Mejora | Empeora | Igual |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  report.marginal.forEach(item => {
    lines.push(`| ${item.code} | ${item.includedStatusCounts.aceptable} | ${item.hasAcceptableWithoutPolicy ? "si" : "no"} | ${item.marginal.improves} | ${item.marginal.worsens} | ${item.marginal.unchanged} |`);
  });
  lines.push("");
  lines.push("## Chequeos de intencion");
  lines.push("");
  report.intentChecks.forEach(item => {
    lines.push(`- ${item.pass ? "OK" : "REVISAR"}: ${item.check}. ${item.evidence}.`);
  });
  lines.push("");
  lines.push("## Todos los planes aceptables");
  lines.push("");
  report.acceptablePlans.forEach(plan => {
    lines.push(`- ${plan.codes.join("+")} (costo ${plan.cost})`);
  });
  if (!report.acceptablePlans.length) lines.push("- Ninguno.");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const model = readIndexModel();
  const validCombos = combinations(model.policies, model.maxPolicies)
    .filter(combo => combo.reduce((total, policy) => total + policy.cost, 0) <= model.budget)
    .map(combo => combo.sort((a, b) => a.code.localeCompare(b.code)));
  const evaluations = validCombos
    .map(combo => evaluateCombination(model, combo))
    .sort((a, b) => a.codes.join(",").localeCompare(b.codes.join(",")));
  const marginal = buildMarginal(model, evaluations);
  const acceptablePlans = evaluations
    .filter(item => item.status === "Aceptable")
    .sort((a, b) => a.cost - b.cost || b.reductions.pm25 - a.reductions.pm25);
  const report = {
    generatedAt: new Date().toISOString(),
    source: INDEX_PATH,
    assumptions: {
      implementedFromYear: 1,
      evaluatedAtYear: model.totalYears,
      budget: model.budget,
      maxPolicies: model.maxPolicies
    },
    summary: {
      totalEvaluated: evaluations.length,
      statusCounts: countStatuses(evaluations)
    },
    balanceFindings: buildBalanceFindings(model, evaluations, marginal),
    intentChecks: buildIntentChecks(model, evaluations, marginal),
    marginal,
    bestAcceptablePlans: acceptablePlans.slice(0, 12),
    acceptablePlans,
    evaluations
  };

  fs.writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(MD_OUT, buildMarkdown(report));
  fs.writeFileSync(CSV_OUT, buildCsv(evaluations));

  console.log(`Auditoria generada: ${JSON_OUT}, ${MD_OUT}, ${CSV_OUT}`);
  console.log(`Combinaciones evaluadas: ${report.summary.totalEvaluated}`);
  console.log(`Aceptables: ${report.summary.statusCounts.aceptable}`);
  if (!report.balanceFindings.hasAcceptablePlan) {
    console.log("REVISAR: no existe ningun plan aceptable.");
  }
  if (report.balanceFindings.poisonPolicies.length) {
    console.log(`REVISAR: politicas veneno: ${report.balanceFindings.poisonPolicies.join(", ")}`);
  }
  if (report.balanceFindings.alwaysWinPolicies.length) {
    console.log(`REVISAR: politicas boton de ganar: ${report.balanceFindings.alwaysWinPolicies.join(", ")}`);
  }
  if (report.balanceFindings.tooManyAcceptableWarning) {
    console.log(`REVISAR: demasiados planes aceptables (${fmt(report.balanceFindings.acceptableRatio * 100)}%).`);
  }
  report.intentChecks
    .filter(item => !item.pass)
    .forEach(item => console.log(`REVISAR: ${item.check}. ${item.evidence}.`));
}

main();
