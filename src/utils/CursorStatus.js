import replayData from './replays/imagematerial.json'

const binarySearchLower = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t >= d[m].totalTime && t <= d[m+1].totalTime) return d[m];
  if (e - 1 === s) return d[s];
  if (t > d[m].totalTime) return binarySearchLower(d,t,m,e);
  return binarySearchLower(d,t,s,m);
}

function calculatePos(currTime,currReplayData) {
  const replayDataLength = replayData.length;

  let currPoint = binarySearchLower(currReplayData,currTime,0,replayDataLength-1)

  return currPoint
}

// note that totalTime is summed by the node.js script
class CursorStatus {
  getReplayData = () => {
    return replayData;
  }

  getReplayLength = () => {
    return replayData[replayData.length - 1].totalTime;
  }

  posAt = currTime => {
    const currPos = calculatePos(currTime,replayData);
    if (currPos == null) {
      return {x: null, y: null, keys: null}
    }
    return {x: currPos.x, y: currPos.y, keys: currPos.keyPressedBitwise}
  }

}

export default CursorStatus