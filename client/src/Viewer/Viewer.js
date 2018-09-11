import React from 'react';
import CursorStatus from './Calc/CursorStatus.js';
import TimeKeeper from './Time/TimeKeeper.js';
import TimeSlider from './Time/TimeSlider.js';
import OsuWindow from './OsuWindow.js';
import MapScoreCalc from './Calc/MapScoreCalc.js';
import SongPlayer from './Sound/SongPlayer.js';
import VolumeControls from './Sound/VolumeControls.js';
import ModCalc from './Calc/ModCalc.js';

class Viewer extends React.Component {
  state = {
    windowScale: 0,
    replayData: null,
    mapData: null,
    dataLoaded: false,
    cursorStatus: null,
    scoreData: null,
    volume: 10,
    muted: false,
    mods: null,
  }
  callApi = async (beatmapId, username) => {
    const response = await fetch('api/replays/' + beatmapId + '/' + username);
    const body = await response.json();
  
    if (response.status !== 200) throw new Error(body.message);
  
    return body;
  }
  updateMapData = (mapData, cursorStatus, mods) => {
    // if DoubleTime or HalfTime present in mods, adjust timing of entire map
    if (mods.DoubleTime) MapScoreCalc.adjustMapSpeed(mapData, 1.5);
    else if (mods.HalfTime) MapScoreCalc.adjustMapSpeed(mapData, 0.75);

    // if HardRock is present in mods, turn map upside-down
    if (mods.HardRock) MapScoreCalc.invertHitObjects(mapData.hitObjects);

    // add linearized points and ticks directly to sliders
    MapScoreCalc.addLinearizedPoints(mapData);

    // assign object hits in place, collecting resulting time/score/combo points
    const scoreData = MapScoreCalc.assignObjectHits(
      mapData,
      cursorStatus,
      mods,
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
    // do necessary hit object calculations and assign score data to state
    this.callApi(this.props.beatmapId, this.props.player)
      .then(res => {
        const replayData = res.replayData;
        const beatmapData = res.beatmapData;
        const mods = ModCalc.getMods(res.bitwiseMods);
        const cursorStatus = new CursorStatus(replayData);
        const scoreData = this.updateMapData(beatmapData, cursorStatus, mods);
        this.setState({
          dataLoaded: true,
          mapData: beatmapData,
          replayData: replayData,
          cursorStatus: cursorStatus,
          scoreData: scoreData,
          mods: mods,
          totalReplayLength: 1.0 * cursorStatus.getReplayLength() / 1000,
        });
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
    const headerDivStyle = {
      height: 25,
      width: this.state.windowScale * 640,
    }
    return (
      <TimeKeeper
        totalTime = {this.state.totalReplayLength}
        cursorStatus = {this.state.cursorStatus}
        render={({ currTime,currCursorPos,timeControls,autoplay,timeSpeed }) =>
          <div>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <div style={headerDivStyle}>
              <TimeSlider
                currTime={currTime}
                onChange={timeControls.setCurrTime}
                totalTime={this.state.totalReplayLength}
                windowScale={this.state.windowScale}
                autoplay={autoplay}
                toggleAutoplay={timeControls.toggleAutoplay}
              />
              <VolumeControls
                changeVolume={(val) => this.setState({volume: val})}
                toggleMute={() => this.setState({muted: this.state.muted ? false : true})}
                muted={this.state.muted}
                volume={this.state.volume}
                windowScale={this.state.windowScale}
              />
            </div>
            <OsuWindow
              currCursorPos={currCursorPos}
              currTime={currTime}
              windowScale={this.state.windowScale}
              cursorStatus={this.state.cursorStatus}
              scoreData={this.state.scoreData}
              mapData={this.state.mapData}
              mods={this.state.mods}
            />
            <SongPlayer
              currTime={currTime}
              timeControls={timeControls}
              beatmapId={this.props.beatmapId}
              autoplay={autoplay}
              timeSpeed={timeSpeed}
              volume={this.state.muted ? 0 : this.state.volume}
            />
          </div>
        }
      />
    );
  }
}

export default Viewer;