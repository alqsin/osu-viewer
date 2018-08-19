import React from 'react';
import CursorStatus from './CursorStatus.js';
import TimeKeeper from './TimeKeeper.js';
import TimeSlider from './TimeSlider.js';
import OsuWindow from './OsuWindow.js';

class Viewer extends React.Component {
  state = {
    windowScale: 0,
    replayData: null,
    beatmapData: null,
    dataLoaded: false,
    cursorStatus: null,
  }
  callApi = async () => {
    const response = await fetch('api/252238/cookiezi');
    const body = await response.json();
  
    if (response.status !== 200) throw new Error(body.message);
  
    return body;
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
    this.callApi()
      .then(res => {
        const replayData = res.replayData;
        const beatmapData = res.beatmapData;
        this.setState({dataLoaded: true, beatmapData: beatmapData, replayData: replayData, cursorStatus: new CursorStatus(replayData)});
      })
      .catch(err => console.log(err));
    
    window.addEventListener('resize', this.updatewindowScale.bind(this))
    this.updatewindowScale()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updatewindowScale.bind(this))
  }

  render() {
    if (!this.state.dataLoaded) {
      return (
        <div>
          Loading replay data...
        </div>
      )
    }
    const totalReplayLength = 1.0 * this.state.cursorStatus.getReplayLength() / 1000;
    return (
      <TimeKeeper
        totalTime = {totalReplayLength}
        cursorStatus = {this.state.cursorStatus}
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
              cursorStatus={this.state.cursorStatus}
            />
          </div>
        }
      />
    );
  }
}

export default Viewer;