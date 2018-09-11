import ModCalc from './ModCalc.js';

function getSpinsPerSecond(overallDifficulty, mods) {
  overallDifficulty = ModCalc.getOverallDifficulty(overallDifficulty, mods);

  if (overallDifficulty < 5) return 5 - 2 * (5 - overallDifficulty) / 5;
  if (overallDifficulty === 5) return 5;
  return 5 + 2.5 * (overallDifficulty - 5) / 5;
}

class HitObjectCalc {
  static getPreTime(approachRate, mods) {
    approachRate = ModCalc.getApproachRate(approachRate, mods);
    var result;

    if (approachRate > 5) result = 1200 - 750 * (approachRate - 5) / 5;
    else if (approachRate === 5) result = 1200;
    else result = 1200 + 600 * (5 - approachRate) / 5;

    if (mods.DoubleTime) return result / 1.5;
    if (mods.HalfTime) return result * 4.0 / 3.0;

    return result;
  }
  static getFadeInTime(approachRate, mods) {
    approachRate = ModCalc.getApproachRate(approachRate, mods);
    var result;

    if (approachRate > 5) result = 800 - 500 * (approachRate - 5) / 5;
    else if (approachRate === 5) result = 800;
    else result = 800 + 400 * (5 - approachRate) / 5;

    if (mods.DoubleTime) return result / 1.5;
    if (mods.HalfTime) return result * 4.0 / 3.0;

    return result;
  }
  static getHitWindow(overallDifficulty, mods) {
    overallDifficulty = ModCalc.getOverallDifficulty(overallDifficulty, mods);

    var result = 150 + 50 * (5 - overallDifficulty) / 5;

    if (mods.DoubleTime) return result / 1.5;
    if (mods.HalfTime) return result * 4.0 / 3.0;

    return result;
  }
  static get100Window(overallDifficulty, mods) {
    overallDifficulty = ModCalc.getOverallDifficulty(overallDifficulty, mods);

    var result = 100 + 40 * (5 - overallDifficulty) / 5;

    if (mods.DoubleTime) return result / 1.5;
    if (mods.HalfTime) return result * 4.0 / 3.0;

    return result;
  }
  static get300Window(overallDifficulty, mods) {
    overallDifficulty = ModCalc.getOverallDifficulty(overallDifficulty, mods);

    var result = 50 + 30 * (5 - overallDifficulty) / 5;

    if (mods.DoubleTime) return result / 1.5;
    if (mods.HalfTime) return result * 4.0 / 3.0;

    return result;
  }
  static getCircleRadius(circleSize, mods) {
    circleSize = ModCalc.getCircleSize(circleSize, mods);
    
    return 54.4 - 4.48 * circleSize;
  }
  static getRequiredSpins(overallDifficulty, spinnerLengthSec, mods) {
    return Math.floor(getSpinsPerSecond(overallDifficulty, mods) * spinnerLengthSec * 0.55);
  }
  static getOpacity(currTime, fadeInStart, fadeInEnd) {
    const maxOpacity = 0.7;
    if (currTime >= fadeInEnd) return maxOpacity;
    return maxOpacity * (1 - 1.0 * (fadeInEnd - currTime) / (fadeInEnd - fadeInStart));
  }
}

export default HitObjectCalc