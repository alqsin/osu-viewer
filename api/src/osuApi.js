const my_lzma = require('lzma');
const request = require('request');
const beatmapIO = require('./beatmapIO.js')

function decodeReplayData(replayData64, cb) {
  const replayBuffer = Buffer.from(replayData64, 'base64');

  my_lzma.decompress(replayBuffer, (result, error) => {
    if (error) {
      console.log(error);
      cb(null);
    }
    cb(result);
  })
}

function constructHttpUrl(url, params) {
  // adds params to url
  if (url[url.length-1] != '?') url += '?';
  for (var paramName in params) {
    if (url[url.length-1] != '?') url += '&';
    url += paramName + '=' + params[paramName];
  }
  return url;
}

function requestReplayData(beatmapId, user, cb) {
  const urlParams = {
    k: process.env.OSU_API_KEY,
    m: '0',
    b: beatmapId,
    u: user,
  }

  const osuUrl = constructHttpUrl('https://osu.ppy.sh/api/get_replay',urlParams);

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(response);
      cb(body);
    }
    else {
      console.log("Request failed with error \"" + JSON.parse(response.body).error + "\"");
      cb(null);
    }
  }

  request.post({url: osuUrl}, callback);
}

module.exports = {
  getReplay(res, beatmapName, user) {
    // attempts to get replay using beatmapId and user
    // doesn't work if beatmap is not available in beatmaps/

    beatmapIO.readBeatmapData(beatmapName, (beatmap) => {
      // should probably verify that beatmap is valid here
      const beatmapId = beatmap.BeatmapID;
      requestReplayData(beatmapId, user, (replayResponse) => {
        decodeReplayData(JSON.parse(replayResponse).content, (replayData) => {
          res.send({replayData: replayData, beatmapData: beatmap})
        });
      });
    });

  },

  getBeatmaps(res) {
    beatmapIO.readBeatmapNames((files) => {
      res.send(files);
    });
  }
}