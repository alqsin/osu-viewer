//import React from 'react';
//import osuReplayParser from 'osureplayparser';

//const replayPath = "./bigblack.osr"

function calculatePos(currTime,period) {
  // gives the 1D position (decimal) of a point traveling at a constant speed with period period
  const absoluteTime = currTime % (period * 2);
  if (absoluteTime > period) {
    return (period * 2 - absoluteTime)/period;
  }
  return absoluteTime / period;
}

export default function CursorStatus(){
  const posAt = currTime => {
    const s = {x: calculatePos(currTime,3000), y: calculatePos(currTime,5000)}
    return s
  }

  return {
    posAt,
  }
}