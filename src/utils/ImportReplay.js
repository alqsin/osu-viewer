//node.js

var fs = require("fs");

const osuReplayParser = require('osureplayparser');

const replayPath = "./replays/imagematerial.osr";
const replay = osuReplayParser.parseReplay(replayPath);

replay_data_len = replay.replay_data.length
let total_time = 0;

for (let i=0;i<replay_data_len;i++){
  total_time = total_time + replay.replay_data[i].timeSinceLastAction;
  replay.replay_data[i].totalTime = total_time;
}

fs.writeFile("./replays/imagematerial.json",JSON.stringify(replay.replay_data, null, 4), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Created imagematerial.json.")
});