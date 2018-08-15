import React from 'react';
import { Group } from 'react-konva';
import OsuCircle from './OsuCircle.js'
import OsuSlider from './OsuSlider.js'
import OsuSpinner from './OsuSpinner.js'
import CalculateMapScore from './CalculateMapScore.js'
import CurveCalc from './CurveCalc.js'

import mapData from './beatmaps/imagematerial.json'

function collectObjects(hitObjects) {
  // go through hitObjects and collect each type of object into
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
    } else console.log("Unknown type of hitObject: " + hitObjects[i].objectName)

  }
  return {circles: circleArray, sliders: sliderArray, spinners: spinnerArray};
}

function getMapSettings(currMapData) {
  // gets the important map settings from the map data
  var mapSettings = {}
  mapSettings.circleSize = currMapData.CircleSize;
  mapSettings.overallDifficulty = currMapData.OverallDifficulty;
  mapSettings.approachRate = currMapData.ApproachRate;
  return mapSettings;
}

// maybe move this function to CurveCalc since it does a lot of calculations
function addLinearizedPoints(currMapData) {
  // creates linearization for every slider
  for (let i=0;i<currMapData.hitObjects.length;i++){
    // only do this for sliders
    if (currMapData.hitObjects[i].objectName !== 'slider') continue;

    // flatten current object points
    currMapData.hitObjects[i].points = [].concat.apply([], currMapData.hitObjects[i].points)

    // for each type of slider, use a different process
    if (currMapData.hitObjects[i].curveType === "linear") {
      currMapData.hitObjects[i].linearizedPoints = CurveCalc.linearCorrectPathLength(currMapData.hitObjects[i].points, currMapData.hitObjects[i].pixelLength)
    } else if (currMapData.hitObjects[i].curveType === "bezier" || currMapData.hitObjects[i].points.length > 6) {
      currMapData.hitObjects[i].linearizedPoints = CurveCalc.linearizeBezier(currMapData.hitObjects[i].points, currMapData.hitObjects[i].pixelLength)
    } else if (currMapData.hitObjects[i].curveType === "pass-through" && currMapData.hitObjects[i].points.length === 6) {
        currMapData.hitObjects[i].linearizedPoints = CurveCalc.linearizeArc(currMapData.hitObjects[i].points, currMapData.hitObjects[i].pixelLength)
    } else throw new Error("Invalid slider???");

    // also want to add ticks for each slider
    // first get timing point, then add ticks using its properties
    const timingPoint = CurveCalc.getSliderTimingPoint(currMapData.hitObjects[i].startTime,currMapData.timingPoints);
    currMapData.hitObjects[i].ticks = CurveCalc.getSliderTicks(currMapData.hitObjects[i], currMapData.SliderMultiplier, timingPoint.beatLength, timingPoint.velocity);
  } 
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

    // try to add linearized slider points in place
    addLinearizedPoints(mapData)

    // get circles sliders and spinners after assigning object hits/scores
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
      <Group>
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
          linearizedPoints,
          ticks,
        }) => (
          <OsuSlider
            key={++i}
            linearizedPoints={linearizedPoints}
            ticks={ticks}
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
      </Group>
    )
    
  }

}

export default MapObjects