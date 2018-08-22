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
    if (checkNewKeyPress(replayData[i-1].keyPressedBitwise,replayData[i].keyPressedBitwise)){
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
  // TODO: tickTime is probably not useful, remove later
  const tickRadius = HitObjectCalc.getCircleRadius(circleSize) * 2.4;  // this is massive, need to test to see if it's right
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
      // check origin tick
      tickResult.push(checkSingleTick(cursorStatus.posAt(currTime), slider.linearizedPoints[0], slider.linearizedPoints[1], tickRadius));

      tickTime.push(currTime);
      currTime += beatLength;

      forward = true;
      numRepeats -= 1;
    }
  }

  return {tickResult: tickResult, tickTime: tickTime};
}

function calculateSpinnerScore(spinner, cursorStatus) {
  // placeholder
  return 300;
}

function getSliderComboAndScore(slider, currCombo, totalScore) {
  // returns sliderCombo and sliderScore, both arrays of length slider.ticksHit.length + 2
  var sliderCombo = [];
  var sliderScore = [];
  let tickMissed = false;
  let endMissed = false;

  if (slider.wasHit) {
    totalScore += getHitScore(30, currCombo);
    currCombo += 1;
  }
  else {
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
      tickMissed = true;
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
    endMissed = true;
  }
  sliderCombo.push(currCombo);
  sliderScore.push(totalScore);

  // I honestly have no idea what the criteria for slider score is, just winging it
  let sliderHitScore = 0;
  if (!endMissed && !tickMissed && slider.wasHit) {
    sliderHitScore = 300;
  }
  else if (!endMissed && !tickMissed) {
    sliderHitScore = 100;
  }
  else if (slider.wasHit && (!endMissed || !tickMissed)) {
    sliderHitScore = 100;
  }
  else if (slider.wasHit || !endMissed || !tickMissed) {
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

function mergeSliderScoreCombo(sliderScore, sliderCombo, slider) {
  // takes sliderScore, sliderCombo and slider (containing ticksHitTime) and returns
  // an array containing [time, score, combo] for each time score/combo updates.
  var result = []

  // obviously score and combo arrays should be the same length
  if (sliderScore.length !== sliderCombo.length) throw new Error("Slider doesn't have same score and combo length.");

  // need ticks to be length of score/combo arrays minus 2 (1 for start, 1 for overall slider)
  if (slider.ticksHitTime.length !== sliderScore.length - 2) throw new Error("Slider tick time not correct length.");

  result.push([slider.startTime, sliderScore[0], sliderCombo[0]]);

  for (let i=0;i<sliderScore.length-2;i++) {
    result.push([slider.ticksHitTime[i], sliderScore[i+1], sliderCombo[i+1]]);
  }

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

        scoreAndCombo.push([currHitTime, totalScore, combo]);

      } else if (hitObjects[i].objectName === 'slider') {
        const currScore = calculateCircleScore(hitObjects[i],replayData,circleSize,overallDifficulty,currHitTime);
        const currTimingPoint = CurveCalc.getSliderTimingPoint(hitObjects[i].startTime, timingPoints);
        const ticksHit = calculateSliderTicksHit(hitObjects[i], cursorStatus, currTimingPoint, circleSize);
        hitObjects[i].ticksHit = ticksHit.tickResult;
        hitObjects[i].ticksHitTime = ticksHit.tickTime;
        if (currScore[0] > 0) hitObjects[i].wasHit = true;

        const sliderResults = getSliderComboAndScore(hitObjects[i], combo, totalScore);

        combo = sliderResults.sliderCombo[sliderResults.sliderCombo.length - 1]
        totalScore = sliderResults.sliderScore[sliderResults.sliderScore.length - 1]

        // the slider is probably not considered when checking if you can hit a note or not, so just assign currHitTime to startTime
        currHitTime = hitObjects[i].startTime;

        scoreAndCombo = scoreAndCombo.concat(mergeSliderScoreCombo(sliderResults.sliderScore, sliderResults.sliderCombo, hitObjects[i]))

      } else if (hitObjects[i].objectName === 'spinner') {
        const currScore = calculateSpinnerScore(hitObjects[i], cursorStatus)
        hitObjects[i].objectScore = currScore;
        totalScore += getHitScore(currScore, combo);
        if (currScore > 0) combo += 1;

        // don't know how to calculate spinners yet, so just set currHitTime to startTime
        currHitTime = hitObjects[i].startTime;

        scoreAndCombo.push([hitObjects[i].endTime, totalScore, combo])
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
      mapData.hitObjects[i].duration = mapData.hitObjects[i].pixelLength * timingPoint.beatLength / (100.0 * mapData.SliderMultiplier)
    } 
  }
}

export default MapScoreCalc;