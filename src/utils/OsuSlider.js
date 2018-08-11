import React from 'react';
import {Line, Group} from 'react-konva';

function perfectSliderLinearize(points) {
  const x1 = points[0]
  const y1 = points[1]
  const x2 = points[2]
  const y2 = points[3]
  const x3 = points[4]
  const y3 = points[5]

  const aSq = Math.pow(x2-x3,2) + Math.pow(y2-y3,2);
  const bSq = Math.pow(x1-x3,2) + Math.pow(y1-y3,2);
  const cSq = Math.pow(x1-x2,2) + Math.pow(y1-y2,2);

  const tol = 0.1
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

  for (let i=0;i<numPoints;++i){
    const fract = i*1.0 / (numPoints - 1);
    const theta = thetaStart + dir * fract * thetaRange;
    const ox = Math.cos(theta) * r;
    const oy = Math.sin(theta) * r;
    result.push(centerx + ox);
    result.push(centery + oy);
  }

  return result;
}

function bezierSplit(points) {
  //splits points into separate arrays at repeating points
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

function scalePoints(points,windowScale){
  var newPoints = [];
  for (let i=0;i<points.length;i++){
    newPoints.push(points[i] * windowScale);
  }
  return newPoints;
}

class OsuSlider extends React.Component {
  // props are points, curveType, repeatCount, newCombo, startTime, endTime, currTime, windowScale, circleSize, approachRate, overallDifficulty
  state = {
    fadeInStart: 0,
    sliderEnd: 0,
    sliderWidth: 0,
    linearizedPoints: null,
    bezierSplitPoints: null,
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.getFadeInStart(),
      sliderEnd: this.getSliderEnd(),
      sliderWidth: this.getAbsoluteSliderWidth(),
    })
    if (this.props.curveType === "bezier" || this.props.points.length > 6){
      this.setState({
        bezierSplitPoints: bezierSplit(this.props.points),
      })
    } else if (this.props.curveType === "pass-through") {
      this.setState({
        linearizedPoints: perfectSliderLinearize(this.props.points),
      })
    }
  }
  getFadeInStart = () => {
    const preempt = 1200 - 750 * this.props.approachRate / 5;
    return this.props.startTime + preempt;
  }
  getSliderEnd = () => {
    const hitWindowMax = 150 + 50 * (5 - this.props.overallDifficulty) / 5;
    return this.props.endTime + hitWindowMax;
  }
  getAbsoluteSliderWidth = () => {
    return (54.4 - 4.48 * this.props.circleSize);
  }
  render() {
    if (this.props.currTime <= 0 || this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.sliderEnd) return null;
    if (this.props.curveType === "bezier" || this.props.points.length > 6){
      if (this.state.bezierSplitPoints == null){
        return (
          <Line
            points={scalePoints(this.props.points,this.props.windowScale)}
            bezier={true}
            strokeWidth={this.state.sliderWidth * this.props.windowScale}
            stroke='green'
            lineCap='round'
          />
        )
      } else {
        return (
          <Group>
            {this.state.bezierSplitPoints.map( t =>
              <Line 
                points={scalePoints(t,this.props.windowScale)}
                strokeWidth={this.state.sliderWidth * this.props.windowScale}
                stroke='green'
                lineCap='round'
              />
            )}
          </Group>
        )
      }
    }
    if (this.props.curveType === "linear") {
      return (
        <Line
          points={scalePoints(this.props.points,this.props.windowScale)}
          strokeWidth={this.state.sliderWidth * this.props.windowScale}
          stroke='green'
          lineCap='round'
        />
      )
    }
    if (this.props.curveType === "pass-through") {
      return (
        <Line
          points={scalePoints(this.state.linearizedPoints,this.props.windowScale)}
          strokeWidth={this.state.sliderWidth * this.props.windowScale}
          stroke='green'
          lineCap='round'
        />
      )
    }
  }
}

export default OsuSlider