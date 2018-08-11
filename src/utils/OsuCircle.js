import React from 'react';
import {Circle} from 'react-konva';

class OsuCircle extends React.Component {
  // props are x, y, hitTime, currTime, windowScale, circleSize, approachRate, overallDifficulty
  state = {
    // this hopefully won't break b/c setState is called after mount
    fadeInStart: 0,
    noteEnd: 0,
    circleRadius: 0,
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.getFadeInStart(),
      noteEnd: this.getNoteEnd(),
      circleRadius: this.getAbsoluteRadius(),
      }
    )
  }

  getFadeInStart = () => {
    // assume ar>5 for now
    const preempt = 1200 - 750 * this.props.approachRate / 5;
    return this.props.hitTime + preempt
  }
  getNoteEnd = () => {
    const hitWindowMax = 150 + 50 * (5 - this.props.overallDifficulty) / 5;
    return this.props.hitTime + hitWindowMax
  }
  getAbsoluteRadius = () => {
    const absoluteRadius = (54.4 - 4.48 * this.props.circleSize) / 2;
    return absoluteRadius;
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.noteEnd) return null;
    return (
      <Circle
        x={this.props.x * this.props.windowScale}
        y={this.props.y * this.props.windowScale}
        radius={this.state.circleRadius * this.props.windowScale}
        fill='blue'
      />
    )
  }
}

export default OsuCircle