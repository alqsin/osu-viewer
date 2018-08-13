import React from 'react';
import {Text} from 'react-konva';

class OsuHitText extends React.Component {
  // props should be x, y, objectScore, windowScale
  render() {
    if (this.props.objectScore === 0) {
      return (
        <Text
          x={this.props.x * this.props.windowScale}
          y={this.props.y * this.props.windowScale}
          text='X'
          fontSize={30 * this.props.windowScale}
          fill='red'
          width={40 * this.props.windowScale}
          align='center'
        />
      )
    }
    return (
      <Text
        x={this.props.x * this.props.windowScale}
        y={this.props.y * this.props.windowScale}
        text={this.props.objectScore}
        fontSize={16 * this.props.windowScale}
        fill='black'
        width={55 * this.props.windowScale}
        align='center'
      />
    )

  }
}

export default OsuHitText