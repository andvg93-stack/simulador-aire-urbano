(function exposeExposureModel(global) {
  "use strict";
  const BASELINE = Object.freeze({ exposure: 78000, susceptible: 18000, permanenceHours: 8 });
  const LIMITS = Object.freeze({ exposure: Object.freeze([27300, 80000]), permanenceHours: Object.freeze([2, 16]) });
  const EFFECTS = Object.freeze({ P1: -0.12, P2: -0.12, P3: -0.05, P4: -0.06, P5: -0.07, P6: -0.10, P7: -0.04, P8: -0.05, P9: -0.10, P10: -0.18 });
  const SUSCEPTIBLE_RATIO = BASELINE.susceptible / BASELINE.exposure;
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value))); }
  function effectFor(code) { return Object.prototype.hasOwnProperty.call(EFFECTS, code) ? EFFECTS[code] : 0; }
  function combinedEffect(measures = []) {
    const selected = [...new Set(Array.isArray(measures) ? measures : [measures])].filter(code => Object.prototype.hasOwnProperty.call(EFFECTS, code));
    const raw = selected.reduce((sum, code) => sum + EFFECTS[code], 0);
    return { selected, raw, factor: clamp(1 + raw, 0.35, 1.05) };
  }
  function evaluateExperiment({ exposure = BASELINE.exposure, permanenceHours = BASELINE.permanenceHours, measures = [] } = {}) {
    const before = clamp(exposure, LIMITS.exposure[0], LIMITS.exposure[1]);
    const hours = clamp(permanenceHours, LIMITS.permanenceHours[0], LIMITS.permanenceHours[1]);
    const effects = combinedEffect(measures);
    const after = Math.round(before * effects.factor);
    const protectedPeople = Math.max(0, before - after);
    return { before, after, protectedPeople, reduction: before ? protectedPeople / before : 0, permanenceHours: hours,
      personHoursBefore: Math.round(before * hours), personHoursAfter: Math.round(after * hours),
      susceptibleBefore: Math.round(before * SUSCEPTIBLE_RATIO), susceptibleAfter: Math.round(after * SUSCEPTIBLE_RATIO),
      effects, selected: effects.selected };
  }
  global.ExposureModel = Object.freeze({ baseline: BASELINE, limits: LIMITS, effects: EFFECTS, susceptibleRatio: SUSCEPTIBLE_RATIO, effectFor, combinedEffect, evaluateExperiment });
})(window);
