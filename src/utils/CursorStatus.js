import React from 'react';
import replayData from './replays/imagematerial.json'

const binarySearchLower = (d, t, s, e, len) => {
  const m = Math.floor((s + e)/2);
  if (t >= d[m].totalTime && t <= d[Math.min(m+1,len-1)].totalTime) return d[m];
  if (e - 1 === s) return d[s];
  if (t > d[m].totalTime) return binarySearchLower(d,t,m,e,len);
  if (t < d[m].totalTime) return binarySearchLower(d,t,s,m,len);
  return null;
}

function calculatePos(currTime,currReplayData) {
  const replayDataLength = replayData.length;

  let currPoint = binarySearchLower(currReplayData,currTime,0,replayDataLength-1,replayDataLength)

  if (currPoint == null) return {x: 256, y: 192};
  
  return currPoint
}

class CursorStatus extends React.Component {
  state = {
    replayAnalyzed: false,
  }

  getReplayLength = () => {
    return replayData[replayData.length - 1].totalTime;
  }

  posAt = currTime => {
    const currPos = calculatePos(currTime,replayData);
    return {x: currPos.x, y: currPos.y}
  }
  render () { return null }
}

export default CursorStatus