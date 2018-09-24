const my_lzma = require('lzma');
const request = require('request');
const beatmapIO = require('./beatmapIO.js')

function decodeReplayData(replayData64, cb) {
  let replayBuffer;
  try {
    replayBuffer = Buffer.from(replayData64, 'base64');
  } catch (error) {
    console.log(error);
    cb(null);
    return;
  }

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

function doRequest(url, urlParams, cb) {
  const osuUrl = constructHttpUrl(url,urlParams);

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(body);
    }
    else {
      console.log("Request failed with error \"" + JSON.parse(response.body).error + "\"");
      cb(null);
    }
  }

  request.post({url: osuUrl}, callback);
}

function requestReplayData(beatmapId, user, cb) {
  const urlParams = {
    k: process.env.OSU_API_KEY,
    m: '0',
    b: beatmapId,
    u: user,
  }

  doRequest('https://osu.ppy.sh/api/get_replay',urlParams, cb);
}

function requestBeatmapInfo(beatmapId, cb) {
  const urlParams = {
    k: process.env.OSU_API_KEY,
    m: '0',
    b: beatmapId,
  }

  doRequest('https://osu.ppy.sh/api/get_beatmaps',urlParams, cb);
}

function requestBeatmapScores(beatmapId, cb) {
  const urlParams = {
    k: process.env.OSU_API_KEY,
    m: '0',
    b: beatmapId,
  }

  doRequest('https://osu.ppy.sh/api/get_scores',urlParams, cb);
}

function requestBeatmapPlayerScores(beatmapId, user, cb) {
  const urlParams = {
    k: process.env.OSU_API_KEY,
    m: '0',
    b: beatmapId,
    u: user,
  }
  
  doRequest('https://osu.ppy.sh/api/get_scores', urlParams, cb);
}

function determineMods(playerScores) {
  // go through playerScores, and return the mods (bitwise) belonging to
  // the score with the highest PP

  var maxMods = 0;
  var maxPP = 0;

  for (var score of playerScores) {
    if (parseFloat(score.pp) > maxPP) {
      maxMods = parseInt(score.enabled_mods);
      maxPP = parseFloat(score.pp);
    }
  }
  return maxMods;
}

module.exports = {
  getReplay(res, beatmapName, user) {
    // attempts to get replay using beatmapId and user
    // doesn't work if beatmap is not available in beatmaps/

    beatmapIO.readBeatmapData(beatmapName, (beatmap) => {
      // should probably verify that beatmap is valid here
      var beatmapId = null;
      if ('BeatmapID' in beatmap) beatmapId = beatmap.BeatmapID;
      else beatmapId = beatmapName; // default to beatmap name if no BeatmapID; need to clean this later
      requestReplayData(beatmapId, user, (replayResponse) => {
        decodeReplayData(JSON.parse(replayResponse).content, (replayData) => {
          if (replayData == null) {
            res.send(null);
            return;
          }
          requestBeatmapPlayerScores(beatmapId, user, (playerScores => {
            bitwiseMods = determineMods(JSON.parse(playerScores));
            res.send({bitwiseMods: bitwiseMods, replayData: replayData, beatmapData: beatmap})
          }))
        });
      });
    });

  },

  getBeatmaps(res) {
    beatmapIO.readBeatmaps((files) => {
      res.send(files);
    });
  },

  getScores(res, beatmapId) {
    requestBeatmapScores(beatmapId, (scores) => {
      res.send(scores);
    })
  },

  initialize(cb) {
    function requestBeatmapName(beatmapId, cb) {
      requestBeatmapInfo(beatmapId, (res) => {
        const resParsed = JSON.parse(res);
        const beatmapName = '' + resParsed[0].artist + ' - ' + resParsed[0].title + ' [' + resParsed[0].version + ']';
        cb(beatmapName);
      })
    }
    beatmapIO.initializeTranslator(requestBeatmapName, cb);
  }
}