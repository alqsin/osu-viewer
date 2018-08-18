import React from 'react';
import {Circle, Group, Text} from 'react-konva';
import OsuHitText from './OsuHitText.js'

class OsuSpinner extends React.Component {
  state = {
    hitDisplayTime: 350,
  }
  // props are startTime, endTime, currTime, windowScale, objectScore
  render () {
    if (this.props.currTime < this.props.startTime || this.props.currTime > this.props.endTime + this.state.hitDisplayTime) return null;
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