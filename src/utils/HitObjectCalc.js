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
  static getCircleRadius(circleSize) {
    return (54.4 - 4.48 * circleSize) / 2;
  }
  static getOpacity(currTime,fadeInStart,fadeInEnd) {
    if (currTime >= fadeInEnd) return 1;
    return 1 - 1.0 * (fadeInEnd - currTime) / (fadeInEnd - fadeInStart);
  }
}

export default HitObjectCalc