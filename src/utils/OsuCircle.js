import React from 'react';
import {Circle, Group} from 'react-konva';
import HitObjectCalc from './HitObjectCalc.js'

class OsuCircle extends React.Component {
  // props are x, y, hitTime, currTime, windowScale, circleSize, approachRate, overallDifficulty
  state = {
    // this hopefully won't break b/c setState is called after mount
    fadeInStart: 0,
    fadeInEnd: 0,
    noteEnd: 0,
    circleRadius: 0,
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.props.hitTime - HitObjectCalc.getPreTime(this.props.approachRate),
      fadeInEnd: this.props.hitTime - HitObjectCalc.getPreTime(this.props.approachRate) + HitObjectCalc.getFadeInTime(this.props.approachRate),
      noteEnd: this.props.hitTime + HitObjectCalc.getHitWindow(this.props.overallDifficulty),
      circleRadius: HitObjectCalc.getCircleRadius(this.props.circleSize),
      }
    )
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.state.noteEnd) return null;
    const opacity = HitObjectCalc.getOpacity(this.props.currTime,this.state.fadeInStart,this.state.fadeInEnd);
    return (
      <Group>
      {this.props.currTime < this.props.hitTime &&
        <Circle
          x={this.props.x * this.props.windowScale}
          y={this.props.y * this.props.windowScale}
          radius={this.state.circleRadius * this.props.windowScale * (1 + 3*(this.props.hitTime - this.props.currTime) / (this.props.hitTime - this.state.fadeInStart))}
          stroke='blue'
          strokeWidth={5}
          opacity={opacity}
        />
      }
        <Circle
          x={this.props.x * this.props.windowScale}
          y={this.props.y * this.props.windowScale}
          radius={this.state.circleRadius * this.props.windowScale}
          fill='blue'
          opacity={opacity}
        />
      </Group>
    )
  }
}

export default OsuCircle