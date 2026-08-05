(function (global) {
  "use strict";

  const BASELINE = Object.freeze({ wind: 1.5, hmix: 102 });
  const LIMITS = Object.freeze({ wind: Object.freeze([0.5, 5.5]), hmix: Object.freeze([70, 220]) });
  const MEASURE_EFFECTS = Object.freeze({
    P5: Object.freeze({ wind: 0, hmix: 0.05 }),
    P6: Object.freeze({ wind: 0.18, hmix: 0.15 })
  });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  const MIN_RATE = LIMITS.wind[0] * LIMITS.hmix[0];
  const MAX_RATE = LIMITS.wind[1] * LIMITS.hmix[1];

  function calculate(wind = BASELINE.wind, hmix = BASELINE.hmix) {
    const boundedWind = clamp(wind, ...LIMITS.wind);
    const boundedHmix = clamp(hmix, ...LIMITS.hmix);
    const rate = boundedWind * boundedHmix;
    const ventilation = clamp(((rate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * 100, 0, 100);
    return {
      wind: boundedWind,
      hmix: boundedHmix,
      rate,
      ventilation,
      stagnation: 100 - ventilation
    };
  }

  function measureEffects(measures = []) {
    const selected = [...new Set(Array.isArray(measures) ? measures : [measures])]
      .filter(code => Object.prototype.hasOwnProperty.call(MEASURE_EFFECTS, code));
    return selected.reduce((result, code) => {
      result.wind += MEASURE_EFFECTS[code].wind;
      result.hmix += MEASURE_EFFECTS[code].hmix;
      return result;
    }, { wind: 0, hmix: 0, selected });
  }

  function evaluateExperiment({ wind = BASELINE.wind, hmix = BASELINE.hmix, measures = [] } = {}) {
    const before = calculate(wind, hmix);
    const effects = measureEffects(measures);
    const after = calculate(before.wind * (1 + effects.wind), before.hmix * (1 + effects.hmix));
    return { before, after, effects, selected: effects.selected };
  }

  global.DispersionModel = Object.freeze({
    baseline: BASELINE,
    limits: LIMITS,
    minRate: MIN_RATE,
    maxRate: MAX_RATE,
    calculate,
    measureEffects,
    evaluateExperiment
  });
})(window);
