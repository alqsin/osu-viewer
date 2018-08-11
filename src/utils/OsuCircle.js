import React from 'react';
import {Circle} from 'react-konva';

class OsuCircle extends React.Component {
  // props are x, y, hitTime, currTime, windowScale, circleSize, approachRate, overallDifficulty
  state = {
    // this hopefully won't break b/c setState is called after mount
    fadeInStart: 0,
    noteEnd: 0,
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.getFadeInStart(),
      noteEnd: this.getNoteEnd(),
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
  getScaledRadius = () => {
    const absoluteRadius = (54.4 - 4.48 * this.props.circleSize) / 2;
    return absoluteRadius * this.props.windowScale;
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.noteEnd) return null;
    //if (this.props.currTime < this.getFadeInStart() || this.props.currTime > this.getNoteEnd()) return null;
    return (
      <Circle
        x={this.props.x * this.props.windowScale}
        y={this.props.y * this.props.windowScale}
        radius={this.getScaledRadius()}
        fill='blue'
      />
    )
  }
}

export default OsuCircle