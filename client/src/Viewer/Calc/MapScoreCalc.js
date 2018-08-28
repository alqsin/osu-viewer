import HitObjectCalc from './HitObjectCalc.js';
import CurveCalc from './CurveCalc.js';

function checkNewKeyPress(keyPressedBefore,keyPressedNow) {
  // for now, let's just ignore k1 and k2, and smokes
  const beforem1 = keyPressedBefore % 2;
  const beforem2 = Math.floor(keyPressedBefore % 4 / 2);
  const nowm1 = keyPressedNow % 2;
  const nowm2 = Math.floor(keyPressedNow % 4 / 2);

  if (nowm1 && !beforem1) return true;
  if (nowm2 && !beforem2) return true;

  return false;
}

function anyKeyPressed(keysPressed){
  const m1 = keysPressed % 2;
  const m2 = Math.floor(keysPressed % 4 / 2);
  if (m1 || m2) return true;

  return false;
}

function checkCursorInRadius(cursorX, cursorY, objectX, objectY, objectRadius) {
  const cursorObjectDist = Math.sqrt(Math.pow(objectX - cursorX,2) + Math.pow(objectY - cursorY,2));
  return cursorObjectDist <= objectRadius;
}

// this binary search finds the index of the first instance of a cursor action after t
// TODO: move to cursorStatus
const binarySearchMinIndex = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t <= d[m].totalTime && t > d[m-1].totalTime) return m;
  if (e - 1 === s) return e;
  if (t > d[m].totalTime) return binarySearchMinIndex(d,t,m,e);
  return binarySearchMinIndex(d,t,s,m);
}

function calculateCircleScore(circle, replayData, circleSize, overallDifficulty, prevHitTime) {
  // looks through replayData and determines whether or not circle was hit, returning an array containing score and time of hit
  // if object is never hit, just send circle fade out time as time of hit
  const window50 = HitObjectCalc.getHitWindow(overallDifficulty);
  const window100 = HitObjectCalc.get100Window(overallDifficulty);
  const window300 = HitObjectCalc.get300Window(overallDifficulty);
  const circleRadius = HitObjectCalc.getCircleRadius(circleSize);
  let searchStartTime = circle.startTime - window50;
  if (prevHitTime + 1 > searchStartTime) searchStartTime = prevHitTime + 1;
  const indStart = binarySearchMinIndex(replayData,searchStartTime,1,replayData.length-1); // use the fact that nothing happens at time 0 of replay
  for (let i=indStart;replayData[i].totalTime<=circle.startTime + window50;i++){
    if (checkNewKeyPress(replayData[i-1].keys,replayData[i].keys)){
      if (checkCursorInRadius(replayData[i].x,replayData[i].y,circle.position[0],circle.position[1],circleRadius)) {
        const hitDelta = Math.abs(replayData[i].totalTime - circle.startTime);
        if (hitDelta <= window300) return [300,replayData[i].totalTime];
        if (hitDelta <= window100) return [100,replayData[i].totalTime];
        return [50,replayData[i].totalTime];
      }
    }
  }
  return [0,circle.startTime + window50];
}

function checkSingleTick(currCursorPos, tickX, tickY, tickRadius) {
  if (!anyKeyPressed(currCursorPos.keys)) return false;
  if (checkCursorInRadius(currCursorPos.x, currCursorPos.y, tickX, tickY, tickRadius)) return true;
  return false;
}

function calculateSliderTicksHit(slider, cursorStatus, timingPoint, circleSize) {
  // returns two arrays, one with a set of the slider ticks hit and one with the time of each slider hit
  const tickRadius = HitObjectCalc.getCircleRadius(circleSize) * 2.4;  // apparently this is pretty close to correct
  const beatLength = timingPoint.beatLength;
  const finalTickLength = slider.duration - beatLength * (slider.ticks.length-1);
  let numRepeats = slider.repeatCount;
  let currTime = slider.startTime + beatLength;
  let forward = true;
  var tickResult = [];
  var tickTime = [];

  while (numRepeats > 0) {
    // if going in forward direction, just go from start tick to end tick
    if (forward) {
      for (let i=0; i<slider.ticks.length-1;i++) {
        tickResult.push(checkSingleTick(cursorStatus.posAt(currTime), slider.ticks[i][0], slider.ticks[i][1], tickRadius));

        tickTime.push(currTime);
        currTime += beatLength;

      }
      // handle last tick
      currTime -= (beatLength - finalTickLength);

      // apparently slider ends are calculated 36 ms early
      if (numRepeats === 1) currTime -= 36;

      tickResult.push(checkSingleTick(cursorStatus.posAt(currTime), slider.ticks[slider.ticks.length-1][0], slider.ticks[slider.ticks.length-1][1], tickRadius));

      tickTime.push(currTime);
      currTime += finalTickLength;

      forward = false;
      numRepeats -= 1;
    }
    // if going in backwards direction, go from second to last tick to origin
    else {
      for (let i=slider.ticks.length-2;i>=0;i--) {
        tickResult.push(checkSingleTick(cursorStatus.posAt(currTime), slider.ticks[i][0], slider.ticks[i][1], tickRadius));

        tickTime.push(currTime);
        currTime += beatLength;
      }
      // apparently slider ends are calculated 36 ms early
      if (numRepeats === 1) currTime -= 36;

      // check origin tick
      tickResult.push(checkSingleTick(cursorStatus.posAt(currTime), slider.linearizedPoints[0], slider.linearizedPoints[1], tickRadius));
      
      tickTime.push(currTime);
      currTime += beatLength;

      forward = true;
      numRepeats -= 1;
    }
  }

  return {tickResult, tickTime};
}

function calculateRadianChange(x1, y1, x2, y2) {
  // returns the delta in radians between (x1, y1) and (x2, y2)
  // note that the center of a spinner is at (256, 192)

  // get the angle (between -pi and +pi) from spinner center to points
  const rad1 = Math.atan2(y1 - 192,x1 - 256);
  const rad2 = Math.atan2(y2 - 192,x2 - 256);

  // calculate angle difference
  var delta = rad1 - rad2;

  // squash the difference to between 0 and pi
  if (delta > Math.PI) {
    delta -= Math.PI * 2;
    delta = Math.abs(delta);
  }
  else if (delta < Math.PI * -1) {
    delta += Math.PI * 2;
  }
  else if (delta < 0) {
    delta = Math.abs(delta);
  }

  return delta
}

function calculateSpinnerScore(spinner, replayData, requiredSpins) {
  // returns object containing spinner score and array of time of completion of each full spin
  var spinCompletionTime = [];
  var totalRadians = 0;
  var spinsCompleted = 0;
  const indStart = binarySearchMinIndex(replayData, spinner.startTime, 1, replayData.length - 1);
  var currentlySpinning = anyKeyPressed(replayData[indStart].keys);

  for (let i = indStart + 1; replayData[i].totalTime < spinner.endTime; i++) {
    // if player wasn't spinning last cycle, or isn't spinning now, continue
    if (!currentlySpinning) {
      currentlySpinning = anyKeyPressed(replayData[i].keys);
      continue;
    }
    currentlySpinning = anyKeyPressed(replayData[i].keys);
    if (!currentlySpinning) continue;

    totalRadians += calculateRadianChange(replayData[i-1].x, replayData[i-1].y, replayData[i].x, replayData[i].y);

    // if full spin is completed, increment spinsCompleted and log time
    if (totalRadians - spinsCompleted * Math.PI * 2 > Math.PI * 2) {
      ++spinsCompleted;
      spinCompletionTime.push(replayData[i].totalTime)
    }
  }

  let score = 0;

  // TODO: check requirements for spinner completion
  if (spinsCompleted > requiredSpins) {
    if (spinsCompleted > requiredSpins - 2) score = 100;
    else if (requiredSpins > 0.5 > requiredSpins - 4) score = 50;
  }
  else {
    score = 300;
  }

  return {score, spinCompletionTime};
}

function getSpinnerScoreAndCombo(spinner, requiredSpins, currCombo, totalScore) {
  // returns an array containing [time, score, combo] for every time the spinner updates score
  // assumes spinner.spinCompletionTime and spinner.objectScore are already calculated
  var result = [];

  // go through "extra" spins
  if (spinner.spinCompletionTime.length > requiredSpins) {
    for (let i = requiredSpins + 1; i < spinner.spinCompletionTime.length; i++) {
      // TODO: when score modifier is added, update this
      totalScore += 1000;
      result.push([spinner.spinCompletionTime[i], totalScore, currCombo]);
    }
  }

  // spinner end
  totalScore += getHitScore(spinner.objectScore, currCombo);
  if (spinner.objectScore === 0) currCombo = 0;
  else ++currCombo;

  result.push([spinner.endTime, totalScore, currCombo]);

  return result;
}

function getSliderComboAndScore(slider, currCombo, totalScore) {
  // returns sliderCombo and sliderScore, both arrays of length slider.ticksHit.length + 2
  var sliderCombo = [];
  var sliderScore = [];
  let partsMissed = 0;
  const totalParts = 1 + slider.ticksHit.length;

  if (slider.wasHit) {
    totalScore += getHitScore(30, currCombo);
    currCombo += 1;
  }
  else {
    ++partsMissed;
    currCombo = 0;
  }
  sliderCombo.push(currCombo);
  sliderScore.push(totalScore);

  for (let i=0;i<slider.ticksHit.length-1;i++){
    if (slider.ticksHit[i] === true) {
      totalScore += getHitScore(10, currCombo);
      currCombo += 1;
    }
    else {
      ++partsMissed;
      currCombo = 0;
    }
    sliderCombo.push(currCombo)
    sliderScore.push(totalScore)
  }

  let i = slider.ticksHit.length-1;
  if (slider.ticksHit[i] === true) {
    totalScore += getHitScore(10, currCombo)
    currCombo += 1;
  }
  else {
    ++partsMissed;
  }
  sliderCombo.push(currCombo);
  sliderScore.push(totalScore);

  // this is vaguely related to the actual criteria for slider score
  let sliderHitScore = 0;
  if (partsMissed === 0) {
    sliderHitScore = 300;
  }
  else if (partsMissed <= 0.5 * totalParts) {
    sliderHitScore = 100;
  }
  else if (partsMissed < totalParts) {
    sliderHitScore = 50;
  }
  else sliderHitScore = 0;

  // WARNING: this modifies slider directly to provide the objectScore
  slider.objectScore = sliderHitScore;

  totalScore += getHitScore(sliderHitScore, currCombo);
  sliderCombo.push(currCombo);
  sliderScore.push(totalScore);

  return {sliderCombo: sliderCombo, sliderScore: sliderScore};
}

function getHitScore(hitValue, combo) {
  // gets score given by hit with value hitValue, with combo combo before hit
  // currently does not factor in mods
  const actualCombo = combo > 0 ? combo : 0;
  return hitValue + (hitValue * actualCombo / 25.0);
}

// TODO: why tf is this not just done in getSliderComboAndScore????
function mergeSliderScoreCombo(sliderScore, sliderCombo, slider) {
  // takes sliderScore, sliderCombo and slider (containing ticksHitTime) and returns
  // an array containing [time, score, combo] for each time score/combo updates.
  var result = []

  // obviously score and combo arrays should be the same length
  if (sliderScore.length !== sliderCombo.length) throw new Error("Slider doesn't have same score and combo length.");

  // need ticks to be length of score/combo arrays minus 2 (1 for start, 1 for overall slider)
  if (slider.ticksHitTime.length !== sliderScore.length - 2) throw new Error("Slider tick time not correct length.");

  // initial hit
  result.push([slider.startTime, sliderScore[0], sliderCombo[0]]);

  // slider ticks, except "hit" tick w/ objectScore factored in
  for (let i=0;i<sliderScore.length-2;i++) {
    result.push([slider.ticksHitTime[i], sliderScore[i+1], sliderCombo[i+1]]);
  }

  // "hit" tick
  result.push([slider.endTime, sliderScore[sliderScore.length-1], sliderCombo[sliderCombo.length-1]]);

  return result;
}

class MapScoreCalc {
  static assignObjectHits(hitObjects, cursorStatus, circleSize, overallDifficulty, timingPoints) {
    let scoreAndCombo = [[0,0,0]]; // array of triplets with time, score, combo
    let currHitTime = 0;
    const replayData = cursorStatus.getReplayData()
    let combo = 0;
    let totalScore = 0;
    for (let i=0;i<hitObjects.length;i++){
      if (hitObjects[i].objectName === 'circle') {
        const currScore = calculateCircleScore(hitObjects[i],replayData,circleSize,overallDifficulty,currHitTime);
        hitObjects[i].objectScore = currScore[0];
        hitObjects[i].objectHitAt = currScore[1];
        currHitTime = currScore[1];
        // add to total score, then assign to object
        totalScore += getHitScore(currScore[0],combo);
        if (currScore[0] > 0) combo += 1;
        else combo = 0;

        // append scoreAndCombo with current hit result
        scoreAndCombo.push([currHitTime, totalScore, combo]);
      } else if (hitObjects[i].objectName === 'slider') {
        const currScore = calculateCircleScore(hitObjects[i],replayData,circleSize,overallDifficulty,currHitTime);
        const currTimingPoint = CurveCalc.getSliderTimingPoint(hitObjects[i].startTime, timingPoints);
        const ticksHit = calculateSliderTicksHit(hitObjects[i], cursorStatus, currTimingPoint, circleSize);
        hitObjects[i].ticksHit = ticksHit.tickResult;
        hitObjects[i].ticksHitTime = ticksHit.tickTime;
        if (currScore[0] > 0) hitObjects[i].wasHit = true;

        const sliderResults = getSliderComboAndScore(hitObjects[i], combo, totalScore);

        // sliderResults provides score and combo after final tick of slider
        combo = sliderResults.sliderCombo[sliderResults.sliderCombo.length - 1]
        totalScore = sliderResults.sliderScore[sliderResults.sliderScore.length - 1]

        // the slider is probably not considered when checking if you can hit a note or not, so just assign currHitTime to startTime
        currHitTime = hitObjects[i].startTime;

        // merge slider score and combo w/ tick time and concat to scoreAndCombo
        scoreAndCombo = scoreAndCombo.concat(mergeSliderScoreCombo(sliderResults.sliderScore, sliderResults.sliderCombo, hitObjects[i]));
      } else if (hitObjects[i].objectName === 'spinner') {
        // TODO: check if total spins required is integer or not
        const requiredSpins = HitObjectCalc.getRequiredSpins(overallDifficulty, (hitObjects[i].endTime - hitObjects[i].startTime) / 1000);
        const spinResult = calculateSpinnerScore(hitObjects[i], replayData, requiredSpins);

        hitObjects[i].objectScore = spinResult.score;
        hitObjects[i].spinCompletionTime = spinResult.spinCompletionTime;

        const spinnerScoreAndCombo = getSpinnerScoreAndCombo(hitObjects[i], requiredSpins, combo, totalScore);

        // assign post-spinner score and combo
        totalScore = spinnerScoreAndCombo[spinnerScoreAndCombo.length - 1][1];
        if (spinResult.score > 0) ++combo;
        else combo = 0;

        // don't know how to calculate spinners yet, so just set currHitTime to startTime
        currHitTime = hitObjects[i].startTime;

        // concat spinner time/score/combo to scoreAndCombo
        scoreAndCombo = scoreAndCombo.concat(spinnerScoreAndCombo);
      } else throw new Error ("Object isn't a circle, slider or spinner??")
    }
    return scoreAndCombo;
  }

  static addLinearizedPoints(mapData) {
    // creates linearization for every slider
    for (let i=0;i<mapData.hitObjects.length;i++){
      // only do this for sliders
      if (mapData.hitObjects[i].objectName !== 'slider') continue;
  
      // flatten current object points
      mapData.hitObjects[i].points = [].concat.apply([], mapData.hitObjects[i].points)
  
      // for each type of slider, use a different process
      if (mapData.hitObjects[i].curveType === "linear") {
        mapData.hitObjects[i].linearizedPoints = CurveCalc.linearCorrectPathLength(mapData.hitObjects[i].points, mapData.hitObjects[i].pixelLength)
      } else if (mapData.hitObjects[i].curveType === "bezier" || mapData.hitObjects[i].points.length > 6) {
        mapData.hitObjects[i].linearizedPoints = CurveCalc.linearizeBezier(mapData.hitObjects[i].points, mapData.hitObjects[i].pixelLength)
      } else if (mapData.hitObjects[i].curveType === "pass-through" && mapData.hitObjects[i].points.length === 6) {
          mapData.hitObjects[i].linearizedPoints = CurveCalc.linearizeArc(mapData.hitObjects[i].points, mapData.hitObjects[i].pixelLength)
      } else throw new Error("Invalid slider???");
  
      // also want to add ticks for each slider
      // first get timing point, then add ticks using its properties
      const timingPoint = CurveCalc.getSliderTimingPoint(mapData.hitObjects[i].startTime,mapData.timingPoints);
      mapData.hitObjects[i].ticks = CurveCalc.getSliderTicks(mapData.hitObjects[i], mapData.SliderMultiplier, timingPoint.velocity);
  
      // beatLength of slider needs to be known to show follow circle
      mapData.hitObjects[i].beatLength = timingPoint.beatLength;
  
      // recalculate the duration properly
      mapData.hitObjects[i].duration = mapData.hitObjects[i].pixelLength * timingPoint.beatLength / (100.0 * mapData.SliderMultiplier) / timingPoint.velocity;
    } 
  }
}

export default MapScoreCalc;