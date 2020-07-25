const http = require('http');

const GameController = require('./gameController');
const Server = require("./server");

/**
 * 
*/

const config = require("../config");
const app = Server.getExpressApp(config);

const server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on("error", function(err) {
  console.log(err);
});
const gameController = new GameController(server, config.keys);
gameController.Start();
