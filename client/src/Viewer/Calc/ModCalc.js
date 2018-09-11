const modEnum = {
	NoFail         : 1,
	Easy           : 2,
	TouchDevice    : 4,
	Hidden         : 8,
	HardRock       : 16,
	SuddenDeath    : 32,
	DoubleTime     : 64,
	Relax          : 128,
	HalfTime       : 256,
	Nightcore      : 512, // Only set along with DoubleTime. i.e: NC only gives 576
	Flashlight     : 1024,
	Autoplay       : 2048,
	SpunOut        : 4096,
	Relax2         : 8192,	// Autopilot
	Perfect        : 16384, // Only set along with SuddenDeath. i.e: PF only gives 16416  
	Key4           : 32768,
	Key5           : 65536,
	Key6           : 131072,
	Key7           : 262144,
	Key8           : 524288,
	FadeIn         : 1048576,
	Random         : 2097152,
	Cinema         : 4194304,
	Target         : 8388608,
	Key9           : 16777216,
	KeyCoop        : 33554432,
	Key1           : 67108864,
	Key3           : 134217728,
	Key2           : 268435456,
	ScoreV2        : 536870912,
	LastMod        : 1073741824,
};

// provide integer values of difficulty to use for interpolation
const approachRateVals = [1800, 1680, 1560, 1440, 1320, 1200, 1050, 900, 750, 600, 450, 300];
const overallDifficultyVals = [79.5, 73.5, 67.5, 61.5, 55.5, 49.5, 43.5, 37.5, 31.5, 25.5, 19.5];

function interpolateMsValue (msValue, msValueArray) {
  // find first index in msValueArray smaller than msValue
  var i = 0;
  for (; i < msValueArray.length; i++) {
    if (msValueArray[i] < msValue) {
      break;
    }
  }

  // msValue is smaller than final value of msValueArray
  if (i === msValueArray.length) {
    const slope = msValueArray[i - 2] - msValueArray[i - 1]; 
    return (i - 1) + (msValueArray[i - 1] - msValue) / slope;
  }

  // msValue is greater than first value of msValueArray
  if (i === 0) {
    const slope = msValueArray[0] - msValueArray[1];
    return 0 - (msValue - msValueArray[0]) / slope;
  }

  // msValue is between some values in msValueArray
  const slope = msValueArray[i - 1] - msValueArray[i];
  return i - (msValue - msValueArray[i]) / slope;

}

function clamp (value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

class ModCalc {
  static getMods (bitwiseMods) {
    const mods = {};
    let anyMod = false;
    for (var mod in modEnum) {
      let currModEnabled = (modEnum[mod] & bitwiseMods) > 0;
      if (currModEnabled) {
        anyMod = true;
        mods[mod] = true;
      }
      else mods[mod] = false;
    }
    mods['None'] = anyMod ? false: true;
    return mods;
  }
  static getOverallDifficulty (baseOverallDifficulty, mods) {
    if (mods.Easy) baseOverallDifficulty *= 0.5;
    else if (mods.HardRock) baseOverallDifficulty *= 1.4;

    return clamp(baseOverallDifficulty, 0, 10);
  }
  static getApproachRate (baseApproachRate, mods) {
    if (mods.Easy) baseApproachRate *= 0.5;
    else if (mods.HardRock) baseApproachRate *= 1.4;

    return clamp(baseApproachRate, 0, 10);
  }
  static getCircleSize (baseCircleSize, mods) {
    if (mods.Easy) baseCircleSize *= 0.5;
    else if (mods.HardRock) baseCircleSize *= 1.3;

    return clamp(baseCircleSize, 2, 7);
  }
  static getHPDrain (baseHPDrain, mods) {
    if (mods.Easy) baseHPDrain *= 0.5;
    else if (mods.HardRock) baseHPDrain *= 1.4;

    return clamp(baseHPDrain, 0, 10);
  }
  static getBPM (baseBPM, mods) {
    if (mods.DoubleTime) baseBPM *= 1.5;
    else if (mods.HalfTime) baseBPM *= 0.75;

    return baseBPM;
  }
  static getSongSpeed (mods) {
    if (mods.DoubleTime) return 1.5;
    else if (mods.HalfTime) return 0.75;
    
    return 1.0;
  }
  static getScoreMultiplier (mods) {
    const scoreMultEnum = {
      NoFail: 0.5,
      Easy: 0.5,
      Hidden: 1.06,
      HardRock: 1.06,
      DoubleTime: 1.12,
      HalfTime: 0.3,
      FlashLight: 1.12,
      SpunOut: 0.9,
    }
    let scoreMultiplier = 1.0;
    for (var mod in scoreMultEnum) {
      if (modEnum[mod]) scoreMultiplier *= scoreMultEnum[mod];
    }
    return scoreMultiplier;
  }
}

export default ModCalc;