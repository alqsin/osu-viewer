import React from 'react';
import CursorStatus from './CursorStatus.js';
import TimeKeeper from './TimeKeeper.js';
import TimeSlider from './TimeSlider.js';
import OsuWindow from './OsuWindow.js';

class Viewer extends React.Component {
  render() {
    const currCursorStatus = new CursorStatus();
    const totalReplayLength = currCursorStatus.getReplayLength() / 1000;
    return (
      <TimeKeeper
        totalTime = {totalReplayLength}
        cursorStatus = {currCursorStatus}
        render={({currTime,currCursorPos,timeControls}) =>
          <div>
            <TimeSlider 
              value={currTime}
              onChange={timeControls.setCurrTime}
              totalTime={totalReplayLength}
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