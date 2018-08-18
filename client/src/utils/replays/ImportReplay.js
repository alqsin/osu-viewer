//node.js

var fs = require("fs");

const osuReplayParser = require('osureplayparser');

const replayPath = "./imagematerial.osr";
const replay = osuReplayParser.parseReplay(replayPath);

replay_data_len = replay.replay_data.length
let total_time = 0;

for (let i=0;i<replay_data_len;i++){
  total_time = total_time + replay.replay_data[i].timeSinceLastAction;
  replay.replay_data[i].totalTime = total_time;
}

console.log("Removing last two replay frames due to some issue with parser.")
replay.replay_data.splice(replay.replay_data.length - 2,2)

fs.writeFile("./imagematerial.json",JSON.stringify(replay.replay_data, null, 4), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Created imagematerial.json.")
});