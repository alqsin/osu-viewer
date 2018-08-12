import React from 'react';
import {Circle} from 'react-konva';

class OsuApproachCircle extends React.Component {
  // props are x, y, currTime, hitTime, fadeInStart, baseCircleRadius, windowScale, opacity
  render() {
    if (this.props.currTime >= this.props.hitTime) return null;
    return (
      <Circle
        x={this.props.x * this.props.windowScale}
        y={this.props.y * this.props.windowScale}
        radius={this.props.baseCircleRadius * this.props.windowScale * (1 + 3*(this.props.hitTime - this.props.currTime) / (this.props.hitTime - this.props.fadeInStart))}
        stroke='blue'
        strokeWidth={5}
        opacity={this.props.opacity}
      />
    )
  }
}

export default OsuApproachCircle;