const express = require('express');
const osuApi = require('./osuApi.js');
const dotenv = require('dotenv')

// attempt to load process.env
const result = dotenv.config();
if (result.error) throw result.error;

const app = express();
const port = 3001;

app.get('/api/replays/:beatmap/:user', function (req, res) {
  osuApi.getReplay(res, req.params.beatmap, req.params.user);
});

app.get('/api/beatmaps', function (req, res) {
  osuApi.getBeatmaps(res);
});

app.get('/api/scores/:beatmap', function (req, res) {
  osuApi.getScores(res, req.params.beatmap);
});

function startListening() {
  app.listen(port, () => console.log(`Listening on port ${port}`))
}

osuApi.initialize(startListening);