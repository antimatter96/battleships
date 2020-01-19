const http = require('http');

const GameController = require('./gameController');
const Server = require("./server");

/**
 * 
*/

const app = Server.getExpressApp();

const server = http.Server(app);
server.listen(process.env.PORT || 8080);

const _gc = new GameController(server);
//console.log(gc);
