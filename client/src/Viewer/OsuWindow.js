import React from 'react';
import {Stage,Layer,Rect} from 'react-konva';
import Cursor from './Objects/Cursor.js';
import MapObjects from './MapObjects.js';
import OsuScore from './Text/OsuScore.js';

class OsuWindow extends React.Component {
  render(){
    return (
      <Stage width={this.props.windowScale * 640} height={this.props.windowScale * 480}>
        <Layer>
          <Rect width={this.props.windowScale * 640} height={this.props.windowScale * 480} fill='black' opacity={0.3} />
        </Layer>
        <Layer offsetX={-1 * this.props.windowScale * 64} offsetY={-1 * this.props.windowScale * 48}>
          <Rect width={this.props.windowScale * 512} height={this.props.windowScale * 384} fill='black' opacity={0.1} />
          <OsuScore
            scoreData={this.props.scoreData}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
          />
          <MapObjects
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            cursorStatus={this.props.cursorStatus}
            mapData={this.props.mapData}
            mods={this.props.mods}
          />
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