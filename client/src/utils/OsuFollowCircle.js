import React from 'react';
import {Circle} from 'react-konva';
import {interpolate} from './CurveCalc.js';

const binarySearchLower = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t >= d[m] && t < d[m+1]) return m;
  if (e - 1 === s) return s;
  if (t > d[m]) return binarySearchLower(d,t,m,e);
  return binarySearchLower(d,t,s,m);
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function findCurrentPosition(timeSinceStart, points, msVelocity, integratedLength) {
  const doubledSliderLength = integratedLength[integratedLength.length - 1];
  const currLength = msVelocity * timeSinceStart % doubledSliderLength;
  const lengthInd = binarySearchLower(integratedLength, currLength, 0, integratedLength.length - 1);
  const lengthDiff = currLength - integratedLength[lengthInd];

  return interpolate(points[lengthInd*2],points[lengthInd*2+1],points[lengthInd*2+2],points[lengthInd*2+3],lengthDiff);
}

function reverseByTwo(points) {
  var newPoints = [];
  for (let i=points.length-2;i>=0;i-=2) {
    newPoints.push(points[i]);
    newPoints.push(points[i+1]);
  }
  return newPoints;
}

function sumPointsLength(points) {
  var integratedLength = [0];
  let currLength = 0;
  for (let i=0;i<points.length-2;i+=2) {
    currLength += dist(points[i],points[i+1],points[i+2],points[i+3]);
    integratedLength.push(currLength);
  }
  return integratedLength;
}

function duplicateAndSumPoints(points) {
  const duplicatedPoints = points.slice().concat(reverseByTwo(points));
  return {duplicatedPoints: duplicatedPoints, integratedLength: sumPointsLength(duplicatedPoints)}
}

class OsuFollowCircle extends React.Component {
  // needs props timeSinceStart, linearizedPoints, msVelocity, circleRadius, windowScale, opacity
  state = {
    integratedLength: null,
    duplicatedPoints: null,
    followCircleScale: 1.8,
  }
  componentWillMount(){
    this.setState(duplicateAndSumPoints(this.props.linearizedPoints));
  }
  render() {
    const currPos = findCurrentPosition(this.props.timeSinceStart, this.state.duplicatedPoints, this.props.msVelocity, this.state.integratedLength);
    return (
      <Circle
        radius={this.props.circleRadius * this.state.followCircleScale * this.props.windowScale}
        opacity={this.props.opacity}
        x={currPos[0] * this.props.windowScale}
        y={currPos[1] * this.props.windowScale}
        stroke='blue'
        strokeWidth={2 * this.props.windowScale}
      />
    )
  }
}

export default OsuFollowCircle;