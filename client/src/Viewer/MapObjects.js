import React from 'react';
import { Group } from 'react-konva';
import OsuCircle from './Objects/OsuCircle.js'
import OsuSlider from './Objects/OsuSlider.js'
import OsuSpinner from './Objects/OsuSpinner.js'

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

class MapObjects extends React.Component {
  state = {
    circles: null,
    sliders: null,
    spinners: null,
    mapSettings: null,
    scoreAndCombo: null,
    objectsLoaded: false,
  }

  componentWillMount() {
    // get circles sliders and spinners after assigning object hits/scores
    this.setState(collectObjects(this.props.mapData.hitObjects));
    this.setState({objectsLoaded: true});
  }

  render() {
    if (!this.state.objectsLoaded) return null;
    let i = 0;
    return (
      <Group>
        {this.state.spinners.map(({
          startTime,
          endTime,
          objectScore,
          spinCompletionTime,
        }) => (
          <OsuSpinner
            key={++i}
            startTime={startTime}
            endTime={endTime}
            currTime={this.props.currTime}
            windowScale={this.props.windowScale}
            objectScore={objectScore}
            spinCompletionTime={spinCompletionTime}
            overallDifficulty={this.props.mapData.OverallDifficulty}
          />
        ))}
        {this.state.sliders.map(({
          curveType,
          startTime,
          endTime,
          repeatCount,
          newCombo,
          linearizedPoints,
          ticks,
          objectScore,
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
            circleSize={this.props.mapData.CircleSize}
            approachRate={this.props.mapData.ApproachRate}
            overallDifficulty={this.props.mapData.OverallDifficulty}
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
            circleSize={this.props.mapData.CircleSize}
            approachRate={this.props.mapData.ApproachRate}
            overallDifficulty={this.props.mapData.OverallDifficulty}
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