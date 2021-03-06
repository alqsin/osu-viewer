osu-viewer
=====
In-progress. Allows osu! replays to be viewed in a web browser.  
See a demo of the most recent working version [here.](http://alexl.in/osu-viewer)  

Setup
-----
`npm install` in `client/` and `api/` folders should get dependencies.  
You'll need a `.env` file in `api/src/` with `OSU_API_KEY` for osu! API access.  
beatmaps (.osu files) should be placed in `api/src/beatmaps/` and named based on their beatmap ID, e.g. `252238`.  
songs (.mp3 files) should be placed in `api/src/songs/` and named accordingly, e.g. `252238.mp3`.  

Usage
-----
`node server.js` from `api/src/` to start API server.  
`npm start` in `client/` to run client on localhost.  
Note that Express server is proxied to port 3001, so you'll need to configure a proxy if you build via `npm run build`  

Built with
-----
React, with canvas elements drawn via `react-konva`  
Express for communication with [osu! api](https://github.com/ppy/osu-api/wiki)  
`osu-parser` to simplify beatmap parsing  

Notable bugs
-----
The osu! api doesn't have a `mods` parameter for replay fetching, so sometimes HardRock replays are fetched and rendered  

License
-----
MIT

Inspired by
-----
[pubg.sh](https://pubg.sh/)
