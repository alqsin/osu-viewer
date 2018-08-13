class HitObjectCalc {
  static getPreTime(approachRate) {
    if (approachRate > 5) return 1200 - 750 * (approachRate - 5) / 5;
    if (approachRate === 5) return 1200;
    return 1200 + 600 * (5 - approachRate) / 5;
  }
  static getFadeInTime(approachRate) {
    if (approachRate > 5) return 800 - 500 * (approachRate - 5) / 5;
    if (approachRate === 5) return 800;
    return 800 + 400 * (5 - approachRate) / 5;

  }
  static getHitWindow(overallDifficulty) {
    return 150 + 50 * (5 - overallDifficulty) / 5;
  }
  static get100Window(overallDifficulty) {
    return 100 + 40 * (5 - overallDifficulty) / 5;
  }
  static get300Window(overallDifficulty) {
    return 50 + 30 * (5 - overallDifficulty) / 5;
  }
  static getCircleRadius(circleSize) {
    return 54.4 - 4.48 * circleSize;
  }
  static getOpacity(currTime,fadeInStart,fadeInEnd) {
    const maxOpacity = 0.7;
    if (currTime >= fadeInEnd) return maxOpacity;
    return maxOpacity * (1 - 1.0 * (fadeInEnd - currTime) / (fadeInEnd - fadeInStart));
  }
}

export default HitObjectCalc