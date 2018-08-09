import React from 'react';
import CursorStatus from './CursorStatus.js';
import TimeKeeper from './TimeKeeper.js';
import TimeSlider from './TimeSlider.js';
import OsuWindow from './OsuWindow.js';

class Viewer extends React.Component {
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

  render() {
    const currCursorStatus = CursorStatus()
    const totalTime = 60
    const divStyle = {
      height: this.state.windowSize + 'px',
      width: this.state.windowSize + 'px'
    };
    return (
      <TimeKeeper
        totalTime = {totalTime}
        cursorStatus = {currCursorStatus}
        render={({currTime,currCursorPos,timeControls}) =>
          <div style={divStyle}>
            <TimeSlider 
              value={currTime}
              onChange={timeControls.setCurrTime}
              totalTime={totalTime}
            />
            <OsuWindow
              currCursorPos={currCursorPos}
            />
          </div>
        }
      />
    );
  }
}

export default Viewer;