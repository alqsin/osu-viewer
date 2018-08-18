import React from 'react';
import CursorStatus from './CursorStatus.js';
import TimeKeeper from './TimeKeeper.js';
import TimeSlider from './TimeSlider.js';
import OsuWindow from './OsuWindow.js';

// TODO: separate static rectangle into a different layer

class Viewer extends React.Component {
  state = {
    windowScale: 0,
  }
  updatewindowScale = () => {
    const requiredBufferY = 16;
    const requiredBufferX = 0;

    this.setState(() => {
      if ((window.innerHeight - requiredBufferY) * 640 >= (window.innerWidth - requiredBufferX) * 480) {
        return ({ windowScale: (window.innerWidth - requiredBufferX) / 640})
      }
      return ({ windowScale: (window.innerHeight - requiredBufferY) / 480})
    })
  }
  componentDidMount() {
    window.addEventListener('resize', this.updatewindowScale.bind(this))
    this.updatewindowScale()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updatewindowScale.bind(this))
  }

  render() {
    const currCursorStatus = new CursorStatus();
    const totalReplayLength = 1.0 * currCursorStatus.getReplayLength() / 1000;
    return (
      <TimeKeeper
        totalTime = {totalReplayLength}
        cursorStatus = {currCursorStatus}
        render={({currTime,currCursorPos,timeControls}) =>
          <div>
            <TimeSlider 
              currTime={currTime}
              onChange={timeControls.setCurrTime}
              totalTime={totalReplayLength}
              windowScale={this.state.windowScale}
            />
            <OsuWindow
              currCursorPos={currCursorPos}
              currTime={currTime}
              windowScale={this.state.windowScale}
              cursorStatus={currCursorStatus}
            />
          </div>
        }
      />
    );
  }
}

export default Viewer;