const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.get('/replay/:replayId', function (req, res) {
  res.send({ "replayId": req.params.replayId });
});

app.listen(port, () => console.log(`Listening on port ${port}`));