osu-viewer
=====
Extremely in-progress. Will eventually allow for the viewing of replays in a web browser.  
See a demo of the most recent working version of client [here.](http://alexl.in/osu-viewer-test)  

Runs on
-----
React (for client)  
react-konva (for drawing Canvas elements)  
Boostrapped with create-react-app  
Node.js + Express (for API)  
osu-parser (for beatmap parsing)  

Usage
-----
`npm install` in `client` and `api` folders should get dependencies.  
`node src/server.js` in `api` to start API server.  
`npm start` in `client` to run client on localhost.  

License
-----
MIT

Inspired by
-----
[pubg.sh](https://pubg.sh/)
