import React from 'react';
import {Group, Text} from 'react-konva';

const binarySearchLower = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t >= d[m][0] && t <= d[m+1][0]) return d[m];
  if (e - 1 === s) return d[s];
  if (t > d[m][0]) return binarySearchLower(d,t,m,e);
  return binarySearchLower(d,t,s,m);
}

class OsuScore extends React.Component {
  // need props scoreAndCombo, currTime, windowScale
  render() {
    const currScoreAndCombo = binarySearchLower(this.props.scoreAndCombo, this.props.currTime, 0, this.props.scoreAndCombo.length-1);
    return (
      <Group>
        <Text
          x={-64 * this.props.windowScale}
          y={-48 * this.props.windowScale}
          text={'Score: ' + Math.floor(currScoreAndCombo[1])}
          fontSize={18 * this.props.windowScale}
        />
        <Text
          x={-64 * this.props.windowScale}
          y={-28 * this.props.windowScale}
          text={'Combo: ' + currScoreAndCombo[2]}
          fontSize={18 * this.props.windowScale}
        />
      </Group>
    )
  }
}

export default OsuScore;