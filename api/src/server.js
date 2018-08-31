const express = require('express');
const osuApi = require('./osuApi.js');
const dotenv = require('dotenv')
const rateLimitHandler = require('./rateLimitHandler.js')

// attempt to load process.env
const result = dotenv.config();
if (result.error) throw result.error;

const app = express();
const port = 3001;

app.use('/api/songs',express.static('songs'));

app.get('/api/beatmaps', function (req, res) {
  osuApi.getBeatmaps(res);
});

var replayCalls = [];
const replayApiLimit = 10;
const replayApiInterval = 60000;

app.get('/api/replays/:beatmap/:user', function (req, res) {
  setTimeout(
    () => osuApi.getReplay(res, req.params.beatmap, req.params.user),
    rateLimitHandler.getRequiredTimeout(replayApiLimit, replayApiInterval, replayCalls)
  )
});

app.get('/api/scores/:beatmap', function (req, res) {
  osuApi.getScores(res, req.params.beatmap);
});

function startListening() {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

osuApi.initialize(startListening);