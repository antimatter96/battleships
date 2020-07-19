const http = require('http');

const GameController = require('./gameController');
const Server = require("./server");

/**
 * 
*/

const config = require("../config");
const app = Server.getExpressApp(config);

const server = http.Server(app);
server.listen(process.env.PORT || 8080);

const gameController = new GameController(server, config.privateKey, config.publicKey);
gameController.Start();
