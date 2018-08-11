import React from 'react';
import {Circle, Group, Text} from 'react-konva';

class OsuSpinner extends React.Component {
  // props are startTime, endTime, currTime, windowScale
  render () {
    if (this.props.currTime < this.props.startTime || this.props.currTime > this.props.endTime) return null;
    return (
      <Group>
        <Circle
          x={256 * this.props.windowScale}
          y={192 * this.props.windowScale}
          radius={160 * this.props.windowScale}
          fill='orange'
          opacity={0.6}
        />
        <Text
          x={156 * this.props.windowScale}
          y={64 * this.props.windowScale}
          text="SPIN!!!"
          fontSize={24 * this.props.windowScale}
          width={200 * this.props.windowScale}
          align='center'
        />
      </Group>
    )
  }
}

export default OsuSpinner