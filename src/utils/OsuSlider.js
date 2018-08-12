import React from 'react';
import {Line, Group} from 'react-konva';
import CurveCalc from './CurveCalc.js'

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
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.getFadeInStart(),
      sliderEnd: this.getSliderEnd(),
      sliderWidth: this.getAbsoluteSliderWidth(),
    })
    if (this.props.curveType === "bezier" || this.props.points.length > 6){
      this.setState({
        linearizedPoints: CurveCalc.linearizeBezier(this.props.points),
      })
    } else if (this.props.curveType === "pass-through" && this.props.points.length === 6) {
      this.setState({
        linearizedPoints: CurveCalc.linearizeArc(this.props.points),
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
    if (this.props.curveType === "pass-through" || this.props.curveType ===  "bezier") {
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