function bezierSplit(points) {
  // splits points into separate arrays at repeating points

  var result = []
  var curr = []
  const pointsLength = points.length
  for (let i=0;i<pointsLength;i+=2){
    curr.push(points[i])
    curr.push(points[i+1])
    if (i+2 < pointsLength && points[i+2] === points[i] && points[i+3] === points[i+1]){
      result.push(curr)
      curr = []
    } else if (i + 2 >= pointsLength){
      result.push(curr)
    }
  }
  if (result.length === 1) {
    return null
  }
  return result
}

function flatEnough(points) {
  // takes some flattened points and compares the max distance betwen any intermediate point and the endpoint, returning true if they're "close"

  const tol = 0.1

  // precalc points.length
  const l = points.length

  // if there are only two points, they're flat enough
  if (l === 4) return true;

  // calculate the distance between endpoints
  const end2end = Math.sqrt(Math.pow(points[l-2]-points[0],2) + Math.pow(points[l-1]-points[1],2));

  // in a loop, calculate the area*2 of the triangle made by all three points
  // use this to check if the absolute distance from a point to the endpoint line is greater than tol
  for (let i=2;i<points.length-2;i+=2){
    let areax2 = Math.abs(points[i] * (points[l-1] - points[1]) - points[i+1] * (points[l-2] - points[0]) + points[1] * points[l-2] - points[0] * points[l-1]);
    if (areax2 / end2end > tol) return false;
  }

  return true;

}

function recurseSingleBezier(points) {
  // takes a set of flattened points and returns the set of midpoints of those points,
  // as well as the set of midpoints of all resulting midpoints (recursively)

  var midpoints = []

  for (let i=0;i+2<points.length;i+=2) {
    midpoints.push((points[i] + points[i+2])/2);
    midpoints.push((points[i+1] + points[i+3])/2);
  }

  if (midpoints.length === 2) return [midpoints];

  return [midpoints].concat(recurseSingleBezier(midpoints))
}

function recursiveBezierApprox(points) {
  // recursively splits bezier control points into equivalent left and right bezier control points
  // returns when set of control points are quite flat

  if (flatEnough(points)) return points;

  var l = []
  var r = []

  const recursedPoints = recurseSingleBezier(points);

  // fill l
  l.push(points[0])
  l.push(points[1])
  for (let i=0;i<recursedPoints.length;i++){
    l.push(recursedPoints[i][0])
    l.push(recursedPoints[i][1])
  }

  // fill r
  for (let i=recursedPoints.length-1;i>=0;i--){
    r.push(recursedPoints[i][recursedPoints[i].length - 2])
    r.push(recursedPoints[i][recursedPoints[i].length - 1])
  }
  r.push(points[points.length - 2])
  r.push(points[points.length - 1])

  return recursiveBezierApprox(l).concat(recursiveBezierApprox(r))
}

function interpolate(x1,y1,x2,y2,length) {
  // gives coordinates of point length away from (x1,y1) in the direction of (x2,y2)
  const totalLen = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));

  // if (x2,y2) is sufficiently close to being correct, just return it
  if (Math.abs(totalLen - length) < 0.01) return [x2, y2];

  const unitX = 1.0*(x2-x1)/totalLen;
  const unitY = 1.0*(y2-y1)/totalLen;
  
  return [x1 + unitX * length,y1 + unitY * length];
}

function removeRepeatedPoints(arr) {
  var result = []
  result.push(arr[0],arr[1])
  for (let i=2;i<arr.length;i+=2) {
    if (arr[i] === arr[i-2] && arr[i+1] === arr[i-1]) continue;
    result.push(arr[i],arr[i+1]);
  }
  return result;
}

function bezierCorrectSliderLength(points, pixelLength) {
  // makes it so a bezier curve is exactly length pixelLength
  var newPoints = [];

  //first remove repeated points
  points = removeRepeatedPoints(points);

  let totalLength = 0;
  let currLength = 0;
  for (let i=0;i+2<points.length;i+=2) {
    currLength = Math.sqrt(Math.pow(points[i+2]-points[i],2)+Math.pow(points[i+3]-points[i+1],2));
    if (currLength + totalLength >= pixelLength) {
      const finalPoint = interpolate(points[i],points[i+1],points[i+2],points[i+3],pixelLength-totalLength);
      newPoints.push(finalPoint[0])
      newPoints.push(finalPoint[1])
      return newPoints;
    }
    totalLength += currLength;
    newPoints.push(points[i]);
    newPoints.push(points[i+1]);
  }

  // if pixelLength is not reached, interpolate the second to last point in the direction of the final point
  const finalPoint = interpolate(
    newPoints[newPoints.length-2],
    newPoints[newPoints.length-1],
    points[points.length-2],
    points[points.length-1],
    pixelLength - totalLength + currLength
    );
  newPoints.push(finalPoint[0]);
  newPoints.push(finalPoint[1]);

  return newPoints;

}

class CurveCalc {
  static linearizeArc(points, pixelLength){
    const x1 = points[0]
    const y1 = points[1]
    const x2 = points[2]
    const y2 = points[3]
    const x3 = points[4]
    const y3 = points[5]

    const aSq = Math.pow(x2-x3,2) + Math.pow(y2-y3,2);
    const bSq = Math.pow(x1-x3,2) + Math.pow(y1-y3,2);
    const cSq = Math.pow(x1-x2,2) + Math.pow(y1-y2,2);

    const tol = 0.01
    //if (aSq < tol ||  bSq < tol || cSq < tol) throw new Error('Slider is not valid.');

    const s = aSq * (bSq + cSq - aSq);
    const t = bSq * (aSq + cSq - bSq);
    const u = cSq * (aSq + bSq - cSq);

    const sum = s + t + u;

    //if (sum < tol) throw new Error('Slider is not valid.');

    const centerx = (s * x1 + t * x2 + u * x3) / sum;
    const centery = (s * y1 + t * y2 + u * y3) / sum;

    const dAx = x1 - centerx;
    const dAy = y1 - centery;

    const dCx = x3 - centerx;
    const dCy = y3 - centery;

    const r = Math.sqrt(Math.pow(dAx,2) + Math.pow(dAy,2))
    
    const thetaStart = Math.atan2(dAy, dAx);
    let thetaEnd = Math.atan2(dCy, dCx);

    while (thetaEnd < thetaStart) thetaEnd += 2 * Math.PI;

    let dir = 1;
    let thetaRange = thetaEnd - thetaStart;

    const atocx = y3-y1;
    const atocy = x1-x3;

    if (atocx * (x2-x1) + atocy * (y2-y1) < 0){
      dir = -1 * dir;
      thetaRange = 2 * Math.PI - thetaRange
    }

    const numPoints = 2 * r <= tol ? 2 : Math.max(2, Math.ceil(thetaRange / (2 * Math.acos(1 - tol / r))));

    var result = []

    let totalLength = 0;
    let currLength = 0;

    for (let i=0;totalLength < pixelLength;++i){
      const fract = i*1.0 / (numPoints - 1);
      const theta = thetaStart + dir * fract * thetaRange;
      const ox = Math.cos(theta) * r;
      const oy = Math.sin(theta) * r;

      // calculate length from prev point to this point
      if (i > 0) {
        currLength = Math.sqrt(Math.pow(centerx + ox - result[result.length-2],2)+Math.pow(centery + oy - result[result.length-1],2));
        totalLength += currLength;
      }

      result.push(centerx + ox);
      result.push(centery + oy);
    }

    const l=result.length;
    const finalPoint = interpolate(result[l-4],result[l-3],result[l-2],result[l-1],pixelLength-(totalLength-currLength));
    result[l-2] = finalPoint[0];
    result[l-1] = finalPoint[1];

    return result;
  }

  static linearizeBezier(points, pixelLength) {
    // takes points from a slider and returns a linear approximation of them

    const splitPoints = bezierSplit(points);

    if (splitPoints == null) {
      return bezierCorrectSliderLength(recursiveBezierApprox(points), pixelLength);
    }

    var result = [];

    for (let i=0;i<splitPoints.length;i++) {
      if (splitPoints[i].length === 4) result = result.concat(splitPoints[i]);
      else result = result.concat(recursiveBezierApprox(splitPoints[i]));
    }

    return bezierCorrectSliderLength(result, pixelLength);
  }

  static getSliderTicks(slider, sliderMultiplier, velocity) {
    // returns an array containing position of each slider tick and its time
    // const sliderLength = slider.pixelLength;  // doesn't include repeats to my knowledge
    const beatPixelLength = sliderMultiplier * 100 * velocity;

    var result = []

    // TODO: add repeat
    let prevTickPos = [slider.linearizedPoints[0],slider.linearizedPoints[1]]
    let currLength = 0;
    let lengthToNext = 0;
    for (let i=0;i<slider.linearizedPoints.length;i+=2) {
      if (i+2 >= slider.linearizedPoints.length && currLength > 0.1) {
        result.push([slider.linearizedPoints[i],slider.linearizedPoints[i+1]]);
        continue;
      }
      lengthToNext = Math.sqrt(Math.pow(slider.linearizedPoints[i+2]-slider.linearizedPoints[i],2)+Math.pow(slider.linearizedPoints[i+3]-slider.linearizedPoints[i+1],2));
      if (lengthToNext + currLength < beatPixelLength) {
        currLength += lengthToNext;
        prevTickPos = [slider.linearizedPoints[i+2],slider.linearizedPoints[i+3]]
        continue;
      }
      while (lengthToNext + currLength >= beatPixelLength) {
        const newTickPos = interpolate(prevTickPos[0],prevTickPos[1],slider.linearizedPoints[i+2],slider.linearizedPoints[i+3],beatPixelLength-currLength);
        result.push(newTickPos);
        lengthToNext -= (beatPixelLength - currLength);
        currLength = 0;
        prevTickPos = newTickPos;
      }
      if (lengthToNext > 0.1) currLength += lengthToNext;
    }
    return result;
  }

  static getSliderTimingPoint(startTime, timingPoints) {
    for (let i=0;i<timingPoints.length;i++) {
      if (i+1 >= timingPoints.length) return timingPoints[i];
      if (timingPoints[i+1].offset > startTime) return timingPoints[i];
    }
    throw new Error("Error finding timing point for slider at time " + startTime + '.')
  }

  static linearCorrectPathLength(points, pixelLength) {
    // corrects the path length of a linear slider with points points (array length assumed to be 4)
    if (points.length !== 4) throw new Error("Linear slider has more than two points!")
    return [points[0],points[1]].concat(interpolate(points[0],points[1],points[2],points[3],pixelLength))
  }
}

export default CurveCalc