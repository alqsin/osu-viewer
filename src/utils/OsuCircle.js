import React from 'react';
import {Circle, Group} from 'react-konva';
import HitObjectCalc from './HitObjectCalc.js'
import OsuHitText from './OsuHitText.js'

class OsuCircle extends React.Component {
  // props are x, y, startTime, currTime, windowScale, circleSize, approachRate, overallDifficulty, objectScore, objectHitAt
  state = {
    // this hopefully won't break b/c setState is called after mount
    fadeInStart: 0,
    fadeInEnd: 0,
    noteEnd: 0,
    circleRadius: 0,
    hitDisplayTime: 350,
  }
  shouldComponentUpdate() {
    return this.props.currTime >= this.state.fadeInStart && this.props.currTime <= this.props.objectHitAt + this.state.hitDisplayTime;
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate),
      fadeInEnd: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate) + HitObjectCalc.getFadeInTime(this.props.approachRate),
      noteEnd: this.props.startTime + HitObjectCalc.getHitWindow(this.props.overallDifficulty),
      circleRadius: HitObjectCalc.getCircleRadius(this.props.circleSize),
      }
    )
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.props.objectHitAt + this.state.hitDisplayTime || this.props.currTime <= 0) return null;
    const opacity = HitObjectCalc.getOpacity(this.props.currTime,this.state.fadeInStart,this.state.fadeInEnd);
    return (
      <Group>
        {this.props.currTime < this.props.startTime &&
          <Circle
            x={this.props.x * this.props.windowScale}
            y={this.props.y * this.props.windowScale}
            radius={this.state.circleRadius * this.props.windowScale * (1 + 3*(this.props.startTime - this.props.currTime) / (this.props.startTime - this.state.fadeInStart))}
            stroke='blue'
            strokeWidth={5}
            opacity={opacity}
          />
        }
        {this.props.currTime < this.props.objectHitAt &&
          <Circle
            x={this.props.x * this.props.windowScale}
            y={this.props.y * this.props.windowScale}
            radius={this.state.circleRadius * this.props.windowScale}
            fill='blue'
            opacity={opacity}
          />
        }
        {this.props.currTime > this.props.objectHitAt &&
          <OsuHitText
            x={this.props.x}
            y={this.props.y}
            objectScore={this.props.objectScore}
            windowScale={this.props.windowScale}
          />
        }
      </Group>
    )
  }
}

export default OsuCircle