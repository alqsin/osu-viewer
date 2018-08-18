import React from 'react';
import { Group } from 'react-konva';
import OsuCircle from './OsuCircle.js'
import OsuSlider from './OsuSlider.js'
import OsuSpinner from './OsuSpinner.js'
import CalculateMapScore from './CalculateMapScore.js'
import CurveCalc from './CurveCalc.js'
import OsuScore from './OsuScore.js'

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
    currMapData.hitObjects[i].ticks = CurveCalc.getSliderTicks(currMapData.hitObjects[i], currMapData.SliderMultiplier, timingPoint.velocity);

    // beatLength of slider needs to be known to show follow circle
    currMapData.hitObjects[i].beatLength = timingPoint.beatLength;

    // recalculate the duration properly
    currMapData.hitObjects[i].duration = currMapData.hitObjects[i].pixelLength * timingPoint.beatLength / (100.0 * currMapData.SliderMultiplier)
  } 
}

class MapObjects extends React.Component {
  state = {
    circles: null,
    sliders: null,
    spinners: null,
    mapSettings: null,
    scoreAndCombo: null,
  }

  componentWillMount() {
    // test importing mapData here instead of globally
    const mapSettings = getMapSettings(mapData);
    this.setState({
      mapSettings: mapSettings,
    })

    // try to add linearized slider points in place
    // this also calculates slider ticks
    addLinearizedPoints(mapData)

    // assign object hits in place, collecting resulting time/score/combo points
    const scoreAndCombo = CalculateMapScore.assignObjectHits(
      mapData.hitObjects,
      this.props.cursorStatus,
      mapSettings.circleSize,
      mapSettings.overallDifficulty,
      mapData.timingPoints,
    );

    // save time/score/combo points into state
    this.setState({scoreAndCombo: scoreAndCombo});
    
    // get circles sliders and spinners after assigning object hits/scores
    this.setState(collectObjects(mapData.hitObjects));
  }

  render() {
    let i = 0;
    return (
      <Group>
        <OsuScore
          key={++i}
          scoreAndCombo={this.state.scoreAndCombo}
          currTime={this.props.currTime}
          windowScale={this.props.windowScale}
        />
        {this.state.spinners.map(({
          startTime,
          endTime,
          objectScore,
        }) => (
          <OsuSpinner
            key={++i}
            startTime={startTime}
            endTime={endTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            objectScore={objectScore}
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
          objectScore,
          objectHitAt,
          beatPixelLength,
          beatLength,
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
            objectScore={objectScore}
            msVelocity={beatPixelLength / beatLength}
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