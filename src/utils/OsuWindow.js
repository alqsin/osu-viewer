import React from 'react';
import {Stage,Layer,Rect} from 'react-konva';
import Cursor from './Cursor.js'

class OsuWindow extends React.Component {
  state = {
    windowSize: 0,
  }
  updateWindowSize = () => {
    this.setState(() => {
      return {windowSize: Math.min(window.innerWidth,window.innerHeight-14)}
    })
  }
  componentDidMount() {
    window.addEventListener('resize', this.updateWindowSize.bind(this))
    this.updateWindowSize()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowSize.bind(this))
  }

  render(){
    return (
      <Stage width={this.state.windowSize} height={this.state.windowSize}>
        <Layer>
          <Rect width={this.state.windowSize} height={this.state.windowSize} fill='black' opacity={0.3} />
           <Cursor
              currPos={this.props.currCursorPos}
              windowSize={this.state.windowSize}
              radius={this.state.windowSize/40}
            />
        </Layer>
      </Stage>
    );
  }

}

export default OsuWindow