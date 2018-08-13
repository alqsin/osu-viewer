import React from 'react';
import {Line, Group} from 'react-konva';
import CurveCalc from './CurveCalc.js'
import OsuApproachCircle from './OsuApproachCircle.js'
import HitObjectCalc from './HitObjectCalc.js'

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
    fadeInEnd: 0,
    sliderEnd: 0,
    sliderWidth: 0,
    linearizedPoints: null,
  }
  shouldComponentUpdate() {
    return this.props.currTime >= this.state.fadeInStart && this.props.currTime <= this.state.sliderEnd;
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate),
      fadeInEnd: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate) + HitObjectCalc.getFadeInTime(this.props.approachRate),
      sliderEnd: this.props.endTime + HitObjectCalc.getHitWindow(this.props.overallDifficulty),
      sliderWidth: HitObjectCalc.getCircleRadius(this.props.circleSize) * 2,
    })
    if (this.props.curveType === "linear") {
      this.setState({
        linearizedPoints: this.props.points,
      })
    } else if (this.props.curveType === "bezier" || this.props.points.length > 6) {
      this.setState({
        linearizedPoints: CurveCalc.linearizeBezier(this.props.points),
      })
    } else if (this.props.curveType === "pass-through" && this.props.points.length === 6) {
      this.setState({
        linearizedPoints: CurveCalc.linearizeArc(this.props.points),
      })
    } else throw new Error("Invalid slider???")
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.sliderEnd || this.props.currTime <= 0) return null;
    const opacity = HitObjectCalc.getOpacity(this.props.currTime,this.state.fadeInStart,this.state.fadeInEnd);
    return (
      <Group>
        <OsuApproachCircle
          x={this.props.points[0]}
          y={this.props.points[1]}
          currTime={this.props.currTime}
          hitTime={this.props.startTime}
          fadeInStart={this.state.fadeInStart}
          baseCircleRadius={this.state.sliderWidth / 2}
          windowScale={this.props.windowScale}
          opacity={opacity}
        />
        <Line
          points={scalePoints(this.state.linearizedPoints,this.props.windowScale)}
          strokeWidth={this.state.sliderWidth * this.props.windowScale}
          stroke='green'
          lineCap='round'
          opacity={opacity}
        />
      </Group>
    )
  }
}

export default OsuSlider