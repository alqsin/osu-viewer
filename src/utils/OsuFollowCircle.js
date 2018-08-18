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

function findCurrentPosition(timeSinceStart, linearizedPoints, msVelocity, integratedLength) {
  const currLength = msVelocity * timeSinceStart;
  const lengthInd = binarySearchLower(integratedLength, currLength, 0, integratedLength.length - 1);
  const lengthDiff = currLength - integratedLength[lengthInd];

  return interpolate(linearizedPoints[lengthInd*2],linearizedPoints[lengthInd*2+1],linearizedPoints[lengthInd*2+2],linearizedPoints[lengthInd*2+3],lengthDiff);
}

function sumPointsLength(linearizedPoints) {
  var integratedLength = [0];
  let currLength = 0;
  for (let i=0;i<linearizedPoints.length-2;i+=2) {
    currLength += dist(linearizedPoints[i],linearizedPoints[i+1],linearizedPoints[i+2],linearizedPoints[i+3]);
    integratedLength.push(currLength);
  }
  return integratedLength;
}

class OsuFollowCircle extends React.Component {
  // needs props timeSinceStart, linearizedPoints, msVelocity, radius, windowScale, opacity
  state = {
    integratedLength: null,
  }
  componentWillMount(){
    this.setState({integratedLength: sumPointsLength(this.props.linearizedPoints)})
  }
  render() {
    const currPos = findCurrentPosition(this.props.timeSinceStart, this.props.linearizedPoints, this.props.msVelocity, this.state.integratedLength);
    return (
      <Circle
        radius={this.props.radius * this.props.windowScale}
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