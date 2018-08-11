import React from 'react';
import { Layer } from 'react-konva';
import OsuCircle from './OsuCircle.js'
import OsuSlider from './OsuSlider.js'
import OsuSpinner from './OsuSpinner.js'

import mapData from './beatmaps/imagematerial.json'

function collectObjects(currMapData) {
  const hitObjCount = currMapData.hitObjects.length;
  var circleArray = [];
  var sliderArray = [];
  var spinnerArray = [];
  for (let i=0;i<hitObjCount;i++) {
    if (currMapData.hitObjects[i].objectName === 'circle') {
      circleArray.push(currMapData.hitObjects[i]);
    } else if (currMapData.hitObjects[i].objectName === 'slider') {
      sliderArray.push(currMapData.hitObjects[i]);
    } else if (currMapData.hitObjects[i].objectName === 'spinner') {
      spinnerArray.push(currMapData.hitObjects[i]);
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

  // componentWillMount() {
  //   this.setState({
  //     // test importing mapData here instead of globally
  //     circles: collectCircles(mapData),
  //     sliders: collectSliders(mapData),
  //     mapSettings: getMapSettings(mapData),
  //   })
  // }

  componentWillMount() {
    // test importing mapData here instead of globally
    this.setState({
      mapSettings: getMapSettings(mapData),
    })
    this.setState(collectObjects(mapData))
  }

  render() {
    return (
      <Layer>
        {this.state.spinners.map(({
          startTime,
          endTime,
        }) => (
          <OsuSpinner
            key={startTime}
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
            key={startTime}
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
        }) => (
          <OsuCircle
            key={startTime}
            x={position[0]}
            y={position[1]}
            hitTime={startTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            circleSize={this.state.mapSettings.circleSize}
            approachRate={this.state.mapSettings.approachRate}
            overallDifficulty={this.state.mapSettings.overallDifficulty}
            newCombo={newCombo}
          />
        ))}
      </Layer>
    )
  }

}

export default MapObjects