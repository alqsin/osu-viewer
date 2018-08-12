import React from 'react';
import {Stage,Layer,Rect} from 'react-konva';
import Cursor from './Cursor.js'
import MapObjects from './MapObjects.js'

class OsuWindow extends React.Component {
  render(){
    return (
      <Stage width={this.props.windowScale * 512} height={this.props.windowScale * 384}>
        <Layer>
          <Rect width={this.props.windowScale * 512} height={this.props.windowScale * 384} fill='black' opacity={0.3} />
        </Layer>
        <MapObjects 
          currTime={this.props.currTime}
          windowScale={this.props.windowScale}
        />
        <Layer>
          <Cursor
            currPos={this.props.currCursorPos}
            windowScale={this.props.windowScale}
            radius={this.props.windowScale * 10}
          />
        </Layer>
      </Stage>
    )
  }

}

export default OsuWindow