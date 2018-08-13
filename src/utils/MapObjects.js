import React from 'react';
import { Layer } from 'react-konva';
import OsuCircle from './OsuCircle.js'
import OsuSlider from './OsuSlider.js'
import OsuSpinner from './OsuSpinner.js'
import CalculateMapScore from './CalculateMapScore.js'

import mapData from './beatmaps/imagematerial.json'

function collectObjects(hitObjects) {
  const hitObjCount = hitObjects.length;
  var circleArray = [];
  var sliderArray = [];
  var spinnerArray = [];
  for (let i=0;i<hitObjCount;i++) {
    if (hitObjects[i].objectName === 'circle') {
      circleArray.push(hitObjects[i]);
    } else if (hitObjects[i].objectName === 'slider') {
      sliderArray.push(hitObjects[i]);
    } else if (hitObjects[i].objectName === 'spinner') {
      spinnerArray.push(hitObjects[i]);
    }

  }
  return {circles: circleArray, sliders: sliderArray, spinners: spinnerArray};
}

function getMapSettings(currMapData) {
  var mapSettings = {}
  mapSettings.circleSize = currMapData.CircleSize;
  mapSettings.overallDifficulty = currMapData.OverallDifficulty;
  mapSettings.approachRate = currMapData.ApproachRate;
  return mapSettings;
}

class MapObjects extends React.Component {
  state = {
    circles: null,
    sliders: null,
    spinners: null,
    mapSettings: null,
  }

  componentWillMount() {
    // test importing mapData here instead of globally
    const mapSettings = getMapSettings(mapData);
    this.setState({
      mapSettings: mapSettings,
    })
    this.setState(collectObjects(CalculateMapScore.assignObjectHits(
      mapData.hitObjects,
      this.props.replayData,
      mapSettings.circleSize,
      mapSettings.overallDifficulty,
    )));
  }

  render() {
    let i = 0;
    return (
      <Layer>
        {this.state.spinners.map(({
          startTime,
          endTime,
        }) => (
          <OsuSpinner
            key={++i}
            startTime={startTime}
            endTime={endTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
          />
        ))}
        {this.state.sliders.map(({
          points,
          curveType,
          startTime,
          endTime,
          repeatCount,
          newCombo,
        }) => (
          <OsuSlider
            key={++i}
            points={[].concat.apply([], points)}
            curveType={curveType}
            startTime={startTime}
            endTime={endTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            circleSize={this.state.mapSettings.circleSize}
            approachRate={this.state.mapSettings.approachRate}
            overallDifficulty={this.state.mapSettings.overallDifficulty}
            newCombo={newCombo}
            repeatCount={repeatCount}
          />
        ))}
        {this.state.circles.map(({
          position,
          startTime,
          newCombo,
          objectScore,
          objectHitAt,
        }) => (
          <OsuCircle
            key={++i}
            x={position[0]}
            y={position[1]}
            startTime={startTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            circleSize={this.state.mapSettings.circleSize}
            approachRate={this.state.mapSettings.approachRate}
            overallDifficulty={this.state.mapSettings.overallDifficulty}
            newCombo={newCombo}
            objectScore={objectScore}
            objectHitAt={objectHitAt}
          />
        ))}
      </Layer>
    )
    
  }

}

export default MapObjects