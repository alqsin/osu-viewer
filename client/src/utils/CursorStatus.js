const binarySearchLower = (d, t, s, e) => {
  const m = Math.floor((s + e)/2);
  if (t >= d[m].totalTime && t <= d[m+1].totalTime) return d[m];
  if (e - 1 === s) return d[s];
  if (t > d[m].totalTime) return binarySearchLower(d,t,m,e);
  return binarySearchLower(d,t,s,m);
}

function calculatePos(currTime,replayData) {
  const replayDataLength = replayData.length;

  let currPoint = binarySearchLower(replayData,currTime,0,replayDataLength-1)

  return currPoint
}

function interpretReplayData(replayData) {
  // takes replayData, an array of size 4N containing replay info
  // and returns an array containing labeled data
  var result = [];
  let totalTime = 0;
  for (let i=0; i< replayData.length-2;i++) {
    const currPoint = replayData[i].split('|');
    totalTime += parseInt(currPoint[0], 10);
    result.push(
      {
        totalTime: totalTime,
        x: parseFloat(currPoint[1]),
        y: parseFloat(currPoint[2]),
        keyPressedBitwise: parseInt(currPoint[3], 10),
      }
    )
  }
  return result;
}

class CursorStatus {
  constructor(replayData) {
    // takes lzma-decoded replayData
    this.replayData = interpretReplayData(replayData.split(','));
  }
  getReplayData = () => {
    return this.replayData;
  }

  getReplayLength = () => {
    return this.replayData[this.replayData.length - 1].totalTime;
  }

  posAt = currTime => {
    const currPos = calculatePos(currTime,this.replayData);
    if (currPos == null) {
      return {x: null, y: null, keys: null}
    }
    return {x: currPos.x, y: currPos.y, keys: currPos.keyPressedBitwise}
  }

}

export default CursorStatus