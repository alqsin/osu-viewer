import React from 'react';
import {Circle} from 'react-konva';

class Cursor extends React.Component {
  render() {
    return (
      <Circle 
        x={this.props.currPos.x * this.props.windowSize}
        y={this.props.currPos.y * this.props.windowSize}
        radius={this.props.radius}
        fill='yellow'
      />
    );
  }
}

export default Cursor