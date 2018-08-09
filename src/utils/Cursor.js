import React from 'react';
import {Circle} from 'react-konva';

class Cursor extends React.Component {
  render() {
    return (
      <Circle 
        x={this.props.currPos.x * this.props.windowScale}
        y={this.props.currPos.y * this.props.windowScale}
        radius={this.props.radius}
        fill='yellow'
      />
    );
  }
}

export default Cursor