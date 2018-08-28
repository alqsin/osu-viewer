import React from 'react';
import {Text} from 'react-konva';

class OsuHitText extends React.Component {
  // props should be x, y, objectScore, windowScale, (optional) fontScale
  render() {
    if (this.props.objectScore === 0) {
      return (
        <Text
          x={this.props.x * this.props.windowScale}
          y={this.props.y * this.props.windowScale}
          text='X'
          fontSize={35 * this.props.windowScale}
          fill='red'
          width={40 * this.props.windowScale}
          height={40 * this.props.windowScale}
          offsetX={20 * this.props.windowScale}
          offsetY={20 * this.props.windowScale}
          align='center'
        />
      )
    }
    return (
      <Text
        x={this.props.x * this.props.windowScale}
        y={this.props.y * this.props.windowScale}
        text={this.props.objectScore}
        fontSize={20 * this.props.windowScale * this.props.fontScale}
        fill='black'
        width={50 * this.props.windowScale * this.props.fontScale}
        height={20 * this.props.windowScale * this.props.fontScale}
        offsetX={25 * this.props.windowScale * this.props.fontScale}
        offsetY={10 * this.props.windowScale * this.props.fontScale}
        align='center'
      />
    )
  }
}

OsuHitText.defaultProps = {
  fontScale: 1,
}

export default OsuHitText