import React from 'react';
import {Circle} from 'react-konva';

class OsuCircle extends React.Component {
  // props are pos (giving pos.x and pos.y), circleSize, hitTime, approachRate, windowScale, currTime, overallDifficulty
  state = {
    // this is probably stupid, I'm not sure if it saves calculation
    fadeInStart: getFadeInStart(),
    noteEnd: getNoteEnd(),
  }

  getFadeInStart = () => {
    // assume ar>5 for now
    const preempt = 1200 - 750 * this.props.approachRate / 5;
    return this.props.hitTime - preempt
  }
  getNoteEnd = () => {
    const hitWindowMax = 150 + 50  * (5 - overallDifficulty) / 5;
    return this.props.hitTime + hitWindowMax
  }
  getScaledRadius = () => {
    const absoluteRadius = 54.4 - 4.48 * circleSize;
    return circleSize * this.props.windowScale;
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.getNoteEnd) return null;
    return (
      <Circle
        x={this.props.pos.x * this.props.windowScale}
        y={this.props.pos.y * this.props.windowScale}
        radius={this.getScaledRadius()}
        fill='blue'
      />
    )
  }
}

export default OsuCircle