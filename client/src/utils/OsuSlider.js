import React from 'react';
import {Line, Rect, Group} from 'react-konva';
import OsuApproachCircle from './OsuApproachCircle.js';
import HitObjectCalc from './HitObjectCalc.js';
import OsuHitText from './OsuHitText.js';
import OsuFollowCircle from './OsuFollowCircle.js';

function scalePoints(points,windowScale){
  var newPoints = [];
  for (let i=0;i<points.length;i++){
    newPoints.push(points[i] * windowScale);
  }
  return newPoints;
}

class OsuSlider extends React.Component {
  // props are linearizedPoints, ticks, curveType, repeatCount, newCombo, startTime, endTime, currTime, windowScale, circleSize, approachRate, overallDifficulty,
  // objectScore, msVelocity
  state = {
    fadeInStart: 0,
    fadeInEnd: 0,
    sliderWidth: 0,
    linearizedPoints: null,
    hitDisplayTime: 350,
  }
  shouldComponentUpdate() {
    return this.props.currTime >= this.state.fadeInStart && this.props.currTime <= this.props.endTime + this.state.hitDisplayTime;
  }
  componentDidMount() {
    this.setState({
      fadeInStart: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate),
      fadeInEnd: this.props.startTime - HitObjectCalc.getPreTime(this.props.approachRate) + HitObjectCalc.getFadeInTime(this.props.approachRate),
      sliderWidth: HitObjectCalc.getCircleRadius(this.props.circleSize) * 2,
    })
  }
  render() {
    if (this.props.currTime < this.state.fadeInStart || this.props.currTime > this.props.endTime + this.state.hitDisplayTime || this.props.currTime <= 0) return null;
    const opacity = HitObjectCalc.getOpacity(this.props.currTime,this.state.fadeInStart,this.state.fadeInEnd);
    let sliderColor = 'green';
    let i=0;
    return (
      <Group>
        <OsuApproachCircle
          x={this.props.linearizedPoints[0]}
          y={this.props.linearizedPoints[1]}
          currTime={this.props.currTime}
          hitTime={this.props.startTime}
          fadeInStart={this.state.fadeInStart}
          baseCircleRadius={this.state.sliderWidth / 2}
          windowScale={this.props.windowScale}
          opacity={opacity}
        />
        {this.props.currTime < this.props.endTime &&
          <Line
            points={scalePoints(this.props.linearizedPoints,this.props.windowScale)}
            strokeWidth={this.state.sliderWidth * this.props.windowScale}
            stroke={sliderColor}
            lineCap='round'
            opacity={opacity}
          />
        }
        {this.props.currTime < this.props.endTime && this.props.currTime > this.props.startTime &&
          <OsuFollowCircle
            timeSinceStart={this.props.currTime - this.props.startTime}
            linearizedPoints={this.props.linearizedPoints}
            msVelocity={this.props.msVelocity}
            opacity={opacity}
            radius={this.state.sliderWidth / 2 * 1.6}  // TODO: fix this
            windowScale={this.props.windowScale}
          />
        }
        {this.props.currTime < this.props.endTime &&
          this.props.ticks.map(x =>
            <Rect
              key={++i}
              x={x[0] * this.props.windowScale}
              y={x[1] * this.props.windowScale}
              width={5 * this.props.windowScale}
              height={5 * this.props.windowScale}
              offsetX={2.5 * this.props.windowScale}
              offsetY={2.5 * this.props.windowScale}
              fill='black'
              opacity={0.6}
            />
          )
        }
        {this.props.currTime >= this.props.endTime &&
          <OsuHitText
            x={this.props.linearizedPoints[this.props.linearizedPoints.length-2]}
            y={this.props.linearizedPoints[this.props.linearizedPoints.length-1]}
            objectScore={this.props.objectScore}
            windowScale={this.props.windowScale}
          />
        }
      </Group>
    )
  }
}

export default OsuSlider