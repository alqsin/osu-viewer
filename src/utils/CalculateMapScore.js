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

function checkCursorInRadius(cursorX, cursorY, objectX, objectY, objectRadius) {
  const cursorObjectDist = Math.sqrt(Math.pow(objectX - cursorX,2) + Math.pow(objectY - cursorY,2));
  return cursorObjectDist <= objectRadius;
}

// this binary search finds the index of the first instance of a cursor action after t
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

class CalculateMapScore {
  static assignObjectHits(hitObjects, replayData, circleSize, overallDifficulty) {
    let currHitTime = 0;
    for (let i=0;i<hitObjects.length;i++){
      if (hitObjects[i].objectName === 'circle') {
        const currScore = calculateCircleScore(hitObjects[i],replayData,circleSize,overallDifficulty,currHitTime);
        hitObjects[i].objectScore = currScore[0]
        hitObjects[i].objectHitAt = currScore[1]
        currHitTime = currScore[1]
        // following line increments combo by 1 or resets to 0 (may want to trim nested ternary expression)
        hitObjects[i].comboAfter = currScore[0] > 0 ? (i > 0 ? hitObjects[i-1].comboAfter + 1 : 1) : 0;
      } else if (hitObjects[i].objectName === 'slider') {
        hitObjects[i].objectScore = 0;  // placeholder
      } else if (hitObjects[i].objectName === 'spinner') {
        hitObjects[i].objectScore = 0;  // placeholder
      } else throw new Error ("Object isn't a circle, slider or spinner??")
    }
    return hitObjects;
  }
}

export default CalculateMapScore;