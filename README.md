osu-viewer
=====
Extremely in-progress. Will eventually allow for the viewing of replays in a web browser.  
See a demo of the most recent working version of client [here.](http://alexl.in/osu-viewer-test)  

Runs on
-----
React (for client)  
create-react-app  
react-konva (for drawing Canvas elements)  
Node.js + Express (for API)  
osu-parser (for beatmap parsing)  

Usage
-----
`npm install` in `client/` and `api/` folders should get dependencies.  
You'll need a `.env` file in `api/src/` with `OSU_API_KEY` for osu! API access  
`node server.js` from `api/src/` to start API server.  
`npm start` in `client/` to run client on localhost.  

License
-----
MIT

Inspired by
-----
[pubg.sh](https://pubg.sh/)
