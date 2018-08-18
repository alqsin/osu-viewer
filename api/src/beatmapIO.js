const fs = require('fs');
var parser = require('osu-parser');

const beatmapFolder = './beatmaps/';

module.exports = {
  readBeatmapNames (cb) {
    fs.readdir(beatmapFolder, (err, files) => {
      if (err) {
        console.log('Error fetching beatmaps.')
      }
      cb (files);
    });
  },

  beatmapIsAvailable (beatmapName) {
    try {
      fs.accessSync(beatmapFolder + beatmapName, fs.constants.R_OK);
      return true;
    } catch (err) {
      return false;
    }
  },

  readBeatmapData (beatmapName, cb) {
    parser.parseFile(beatmapFolder + beatmapName, function (err, beatmap) {
      if (err) {
        console.log('Error reading beatmap ' + beatmapName);
        return null;
      }
      cb (beatmap);
    });
  }
  
}