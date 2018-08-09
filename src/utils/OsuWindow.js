import React from 'react';
import {Stage,Layer,Rect} from 'react-konva';
import Cursor from './Cursor.js'

class OsuWindow extends React.Component {
  state = {
    windowScale: 0,
  }
  updatewindowScale = () => {
    this.setState(() => {
      if (window.innerHeight * 512 >= window.innerWidth * 384) {
        return ({ windowScale: window.innerWidth / 512})
      }
      if (window.innerHeight * 512 < window.innerWidth * 384) {
        return ({ windowScale: window.innerHeight / 384})
      }
    })
  }
  componentDidMount() {
    window.addEventListener('resize', this.updatewindowScale.bind(this))
    this.updatewindowScale()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updatewindowScale.bind(this))
  }

  render(){
    return (
      <Stage width={this.state.windowScale * 512} height={this.state.windowScale * 384}>
        <Layer>
          <Rect width={this.state.windowScale * 512} height={this.state.windowScale * 384} fill='black' opacity={0.3} />
           <Cursor
              currPos={this.props.currCursorPos}
              windowScale={this.state.windowScale}
              radius={this.state.windowScale * 10}
            />
        </Layer>
      </Stage>
    );
  }

}

export default OsuWindow