import React from 'react';
import {Circle, Group, Text} from 'react-konva';
import OsuHitText from './OsuHitText.js';
import HitObjectCalc from './../Calc/HitObjectCalc.js';

const binarySearchSpinTime = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t < d[m] && t >= d[m-1]) return m;
  if (e - 1 === s) return e;
  if (t > d[m]) return binarySearchSpinTime(d, t, m, e);
  return binarySearchSpinTime(d, t, s, m);
}

class OsuSpinner extends React.Component {
  // props are startTime, endTime, currTime, windowScale, objectScore, overallDifficulty, spinCompletionTime
  constructor(props) {
    super(props);
    this.objectIsRendered = false;
  }
  state = {
    hitDisplayTime: 350,
    requiredSpins: HitObjectCalc.getRequiredSpins(this.props.overallDifficulty, (this.props.endTime - this.props.startTime) / 1000),
    spinsCompleted: 0,
    totalSpins: this.props.spinCompletionTime.length,
  }
  objectShouldRender = (currTime) => {
    return (currTime >= this.props.startTime && currTime <= this.props.endTime + this.state.hitDisplayTime && currTime > 0);
  }
  shouldComponentUpdate(nextProps) {
    if (!this.objectShouldRender(nextProps.currTime)) {
      if (this.objectIsRendered) {
        return true;
      }
      return false;
    }
    return true;
  }
  componentDidUpdate(prevProps, prevState) {
    // need to do two things on each update: "spin" spinner and check # of spins completed

    // if spins were just updated, don't bother checking again
    if (this.state.spinsCompleted !== prevState.spinsCompleted) {
      return;
    }

    // if current # of spins is correct, return
    if (this.state.spinsCompleted === 0) {
      if (this.props.currTime < this.props.spinCompletionTime[0]) return;
    }
    else if (this.state.spinsCompleted >= this.state.totalSpins) {
      if (this.props.currTime >= this.props.spinCompletionTime[this.state.totalSpins - 1]) return;
    }
    else if (this.props.spinCompletionTime[this.state.spinsCompleted] > this.props.currTime && 
      this.props.spinCompletionTime[this.state.spinsCompleted - 1] <= this.props.currTime) return;

    // otherwise just update spins completed
    if (this.props.currTime < this.props.spinCompletionTime[0]) this.setState({spinsCompleted: 0});
    else if (this.props.currTime > this.props.spinCompletionTime[this.state.totalSpins - 1]) this.setState({spinsCompleted: this.state.totalSpins});
    else this.setState({spinsCompleted: binarySearchSpinTime(this.props.spinCompletionTime, this.props.currTime, 0, this.state.totalSpins - 1)})
  }
  render () {
    if (!this.objectShouldRender(this.props.currTime)) {
      this.objectIsRendered = false;
      return null;
    }
    if (!this.objectIsRendered) this.objectIsRendered = true;

    return (
      <Group>
        {this.props.currTime < this.props.endTime &&
          <Circle
            x={256 * this.props.windowScale}
            y={192 * this.props.windowScale}
            radius={160 * this.props.windowScale}
            fill='orange'
            opacity={0.6}
          />
        }
        {this.props.currTime < this.props.endTime &&
          <Text
            x={156 * this.props.windowScale}
            y={64 * this.props.windowScale}
            text="SPIN!!!"
            fontSize={24 * this.props.windowScale}
            width={200 * this.props.windowScale}
            align='center'
          />
        }
        {this.props.currTime < this.props.endTime && this.state.spinsCompleted > this.state.requiredSpins &&
          <OsuHitText
            x={256}
            y={192}
            objectScore={1000 * (this.state.spinsCompleted - this.state.requiredSpins)}
            windowScale={this.props.windowScale}
            fontScale={2}
          />
        }
        {this.props.currTime >= this.props.endTime &&
          <OsuHitText
            x={256}
            y={192}
            objectScore={this.props.objectScore}
            windowScale={this.props.windowScale}
          />
        }
      </Group>
    )
  }
}

export default OsuSpinner