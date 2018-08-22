const fs = require('fs');
var parser = require('osu-parser');

const beatmapFolder = './beatmaps/';
const translationFile = 'beatmapTranslation.txt';

function readBeatmapsSync() {
  const beatmaps = fs.readdirSync(beatmapFolder);
  return beatmaps;
}

function translateBeatmapIds(beatmapIdList, cb) {
  var result = [];

  fs.readFile(translationFile, (err,data) => {
    if (err) {
      console.error(err);
      return null;
    }
    const translator = JSON.parse(data);
    for (let i=0;i<beatmapIdList.length;i++) {
      result.push({id: beatmapIdList[i], name: translator[beatmapIdList[i]]});
    }
    cb(result);
  })
}

module.exports = {
  readBeatmaps (cb) {
    fs.readdir(beatmapFolder, (err, files) => {
      if (err) {
        console.error('Error fetching beatmaps.')
      }
      translateBeatmapIds(files, cb);
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
        console.error('Error reading beatmap ' + beatmapName);
        return null;
      }
      cb (beatmap);
    });
  },

  initializeTranslator(apiGetBeatmapName, cb) {
    const beatmaps = readBeatmapsSync();
    var translator;
    try {
      translator = JSON.parse(fs.readFileSync(translationFile));
    }
    catch (err) {
      console.error(err);
      console.error('Error reading translation file, initializing from scratch.')
      translator = {};
    }
    var beatmapsToCheck = beatmaps.length;
    for (let i=0;i<beatmaps.length;i++) {
      if (!(beatmaps[i] in translator)) {
        apiGetBeatmapName(beatmaps[i], (beatmapName) => {
          if (beatmapName != null) {
            translator[beatmaps[i]] = beatmapName;
          }
          if (--beatmapsToCheck === 0) {
            fs.writeFileSync(translationFile, JSON.stringify(translator));
            cb();
          }
  
        });
      }
      else {
        if (--beatmapsToCheck === 0) {
          fs.writeFileSync(translationFile, JSON.stringify(translator));
          cb();
        }
      }
    }
  }
  
}