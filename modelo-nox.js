(function exposeNoxModel(global) {
  "use strict";

  const BASELINE = Object.freeze({
    nox: 94,
    cov: 33.9,
    o3: 20.2,
    wind: 1.5,
    temp: 25.7
  });

  const POLICY_EFFECTS = Object.freeze({
    none: Object.freeze({ nox: 0, cov: 0, temp: 0, wind: 0 }),
    P1: Object.freeze({ nox: -0.25, cov: -0.08, temp: 0, wind: 0 }),
    P2: Object.freeze({ nox: -0.35, cov: -0.04, temp: 0, wind: 0 }),
    P3: Object.freeze({ nox: -0.10, cov: -0.04, temp: 0, wind: 0 }),
    P4: Object.freeze({ nox: -0.10, cov: -0.04, temp: -0.2, wind: 0 }),
    P6: Object.freeze({ nox: -0.08, cov: -0.06, temp: -0.4, wind: 0.18 }),
    P8: Object.freeze({ nox: 0, cov: -0.35, temp: 0, wind: 0 }),
    P9: Object.freeze({ nox: -0.08, cov: -0.03, temp: 0, wind: 0 })
  });

  const NO2_MOLAR_MASS = 46.0055;
  const O3_MOLAR_MASS = 47.9982;
  const MOLAR_VOLUME_25C = 24.45;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function policyEffects(code) {
    return POLICY_EFFECTS[code] || POLICY_EFFECTS.none;
  }

  function mergePolicyEffects(code, otherEffects) {
    return { ...otherEffects, ...policyEffects(code) };
  }

  function noxPpbToNo2UgM3(value) {
    return Number(value) * NO2_MOLAR_MASS / MOLAR_VOLUME_25C;
  }

  function no2UgM3ToNoxPpb(value) {
    return Number(value) * MOLAR_VOLUME_25C / NO2_MOLAR_MASS;
  }

  function o3PpbToUgM3(value) {
    return Number(value) * O3_MOLAR_MASS / MOLAR_VOLUME_25C;
  }

  function o3UgM3ToPpb(value) {
    return Number(value) * MOLAR_VOLUME_25C / O3_MOLAR_MASS;
  }

  function ozoneResponse(values, reference = BASELINE) {
    const covReduction = clamp(1 - values.cov / reference.cov, -0.2, 0.8);
    const noxReduction = clamp(1 - values.nox / reference.nox, -0.2, 0.8);
    let factorNoxCov = 0;
    if (covReduction >= 0.20) {
      factorNoxCov = -0.12;
    } else if (noxReduction >= 0.20 && covReduction < 0.10) {
      factorNoxCov = 0.08;
    } else if (noxReduction >= 0.20 && covReduction >= 0.10) {
      factorNoxCov = -0.05;
    }
    const factorTemp = Math.max(0, values.temp - reference.temp) * 0.03;
    const factorVent = Math.max(0, (values.wind / reference.wind - 1) * 100) * -0.005;
    const factorTotal = factorNoxCov + factorTemp + factorVent;
    return {
      value: reference.o3 * (1 + factorTotal),
      changePercent: factorTotal * 100,
      factors: { noxCov: factorNoxCov, temperature: factorTemp, ventilation: factorVent },
      reductions: { nox: noxReduction, cov: covReduction }
    };
  }

  function evaluateExperiment({ noxPpb = BASELINE.nox, measure = "none", covControl = false } = {}) {
    const reference = { ...BASELINE, nox: clamp(Number(noxPpb), 10, 120) };
    const primary = policyEffects(measure);
    const p8 = covControl ? policyEffects("P8") : policyEffects("none");
    const effects = {
      nox: primary.nox + p8.nox,
      cov: primary.cov + p8.cov,
      temp: primary.temp + p8.temp,
      wind: primary.wind + p8.wind
    };
    const values = {
      nox: reference.nox * (1 + effects.nox),
      cov: reference.cov * (1 + effects.cov),
      temp: reference.temp + effects.temp,
      wind: reference.wind * (1 + effects.wind)
    };
    const ozone = ozoneResponse(values, reference);
    return {
      reference,
      values,
      effects,
      ozoneBefore: reference.o3,
      ozoneAfter: ozone.value,
      ozoneChangePercent: ozone.changePercent,
      ozoneFactors: ozone.factors,
      reductionPercent: Math.max(0, -effects.nox * 100),
      no2EquivalentBefore: noxPpbToNo2UgM3(reference.nox),
      no2EquivalentAfter: noxPpbToNo2UgM3(values.nox)
    };
  }

  function evaluateOzoneExperiment({ o3Ppb = BASELINE.o3, measure = "none", covControl = false } = {}) {
    const reference = { ...BASELINE, o3: clamp(Number(o3Ppb), 10, 60) };
    const primary = policyEffects(measure);
    const p8 = covControl ? policyEffects("P8") : policyEffects("none");
    const effects = {
      nox: primary.nox + p8.nox,
      cov: primary.cov + p8.cov,
      temp: primary.temp + p8.temp,
      wind: primary.wind + p8.wind
    };
    const values = {
      nox: reference.nox * (1 + effects.nox),
      cov: reference.cov * (1 + effects.cov),
      temp: reference.temp + effects.temp,
      wind: reference.wind * (1 + effects.wind)
    };
    const ozone = ozoneResponse(values, reference);
    return {
      reference,
      values,
      effects,
      ozoneBefore: reference.o3,
      ozoneAfter: ozone.value,
      ozoneChangePercent: ozone.changePercent,
      ozoneFactors: ozone.factors,
      reductions: ozone.reductions,
      ozoneBeforeUgM3: o3PpbToUgM3(reference.o3),
      ozoneAfterUgM3: o3PpbToUgM3(ozone.value)
    };
  }

  global.NoxModel = Object.freeze({
    baseline: BASELINE,
    policyEffects,
    mergePolicyEffects,
    noxPpbToNo2UgM3,
    no2UgM3ToNoxPpb,
    o3PpbToUgM3,
    o3UgM3ToPpb,
    ozoneResponse,
    evaluateExperiment,
    evaluateOzoneExperiment,
    colombiaOneHourUgM3: 200,
    ozoneEightHourUgM3: 100,
    ozonePeakSeasonUgM3: 60
  });
})(window);
