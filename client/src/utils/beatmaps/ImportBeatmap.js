var fs = require('fs');
var parser = require('osu-parser');

parser.parseFile('./imagematerial.osu', function (err, beatmap) {
  fs.writeFile('./imagematerial.json',JSON.stringify(beatmap,null,4), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Created imagematerial.json')
  })
});