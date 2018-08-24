import React from 'react';
import CursorStatus from './CursorStatus.js';
import TimeKeeper from './TimeKeeper.js';
import TimeSlider from './TimeSlider.js';
import OsuWindow from './OsuWindow.js';
import MapScoreCalc from './MapScoreCalc.js';
import SongPlayer from './SongPlayer.js';

class Viewer extends React.Component {
  state = {
    windowScale: 0,
    replayData: null,
    mapData: null,
    dataLoaded: false,
    cursorStatus: null,
    scoreData: null,
  }
  callApi = async (beatmapId, username) => {
    // const response = await fetch('api/252238/cookiezi');
    const response = await fetch('api/replays/' + beatmapId + '/' + username);
    const body = await response.json();
  
    if (response.status !== 200) throw new Error(body.message);
  
    return body;
  }
  updateMapData = (mapData, cursorStatus) => {
    // add linearized points and ticks directly to sliders
    MapScoreCalc.addLinearizedPoints(mapData);

    // assign object hits in place, collecting resulting time/score/combo points
    const scoreData = MapScoreCalc.assignObjectHits(
      mapData.hitObjects,
      cursorStatus,
      mapData.CircleSize,
      mapData.OverallDifficulty,
      mapData.timingPoints,
    );

    // log # of 300s, 100s, 50s, misses
    var objectScores = [0, 0, 0, 0];
    for (let i=0;i<mapData.hitObjects.length;i++){
      if (mapData.hitObjects[i].objectScore === 300) objectScores[0] += 1;
      else if (mapData.hitObjects[i].objectScore === 100) objectScores[1] += 1;
      else if (mapData.hitObjects[i].objectScore === 50) objectScores[2] += 1;
      else if (mapData.hitObjects[i].objectScore === 0) objectScores[3] += 1;
    }
    console.log("300 count: " + objectScores[0]);
    console.log("100 count: " + objectScores[1]);
    console.log("50 count: " + objectScores[2]);
    console.log("miss count: " + objectScores[3]);

    // save time/score/combo points into state
    return scoreData;
  }
  updatewindowScale = () => {
    const requiredBufferY = 25;
    const requiredBufferX = 0;

    this.setState(() => {
      if ((window.innerHeight - requiredBufferY) * 640 >= (window.innerWidth - requiredBufferX) * 480) {
        return ({ windowScale: (window.innerWidth - requiredBufferX) / 640})
      }
      return ({ windowScale: (window.innerHeight - requiredBufferY) / 480})
    })
  }
  componentDidMount() {
    this.callApi(this.props.beatmapId, this.props.player)
      .then(res => {
        const replayData = res.replayData;
        const beatmapData = res.beatmapData;
        const cursorStatus = new CursorStatus(replayData);
        const scoreData = this.updateMapData(beatmapData, cursorStatus);
        this.setState({dataLoaded: true, mapData: beatmapData, replayData: replayData, cursorStatus: cursorStatus, scoreData: scoreData});
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
        render={({currTime,currCursorPos,timeControls,autoplay}) =>
          <div>
            <TimeSlider 
              currTime={currTime}
              onChange={timeControls.setCurrTime}
              totalTime={totalReplayLength}
              windowScale={this.state.windowScale}
              autoplay={autoplay}
              toggleAutoplay={timeControls.toggleAutoplay}
            />
            <OsuWindow
              currCursorPos={currCursorPos}
              currTime={currTime}
              windowScale={this.state.windowScale}
              cursorStatus={this.state.cursorStatus}
              scoreData={this.state.scoreData}
              mapData={this.state.mapData}
            />
            <SongPlayer
              currTime={currTime}
              timeControls={timeControls}
              beatmapId={this.props.beatmapId}
              autoplay={autoplay}
            />
          </div>
        }
      />
    );
  }
}

export default Viewer;