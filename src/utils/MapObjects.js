import React from 'react';
import { Group } from 'react-konva';
import OsuCircle from './OsuCircle.js'

import mapData from './beatmaps/imagematerial.json'

function collectCircles(currMapData) {
  const hitObjCount = currMapData.hitObjects.length;
  var circleArray = [];
  for (let i=0;i<hitObjCount;i++) {
    if (currMapData.hitObjects[i].objectName === 'circle') {
      circleArray.push(currMapData.hitObjects[i]);
    }
  }
  return circleArray;
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
    mapSettings: null,
  }

  componentWillMount() {
    this.setState({
      circles: collectCircles(mapData),
      mapSettings: getMapSettings(mapData),
    })
  }

  render() {
    return (
      <Group>
        {this.state.circles.map(({
          position,
          startTime,
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
          />
        ))}
      </Group>
    )
  }

}

export default MapObjects