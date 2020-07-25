const { List } = require('immutable');
const Game = require('./game');

const SocketIO = require('socket.io');
const r = require('rethinkdb');

class GameServer {
  constructor(server) {
    if (!server || typeof (server.listeners) !== "function") {
      throw new Error("Server not present");
    }
    this.io = SocketIO(server);

    /*
    =====================================
      Currently storing these in memory;
      Might use a datastore
    ======================================
    */

    this.UsersInQueue = List();
    this.Users = new Set();
    this.socketOfUser = [];

    this.playerIsIn = [];

    r.connect({
      db: 'battleships'
    }, this.rethinkDBConnectionCallback.bind(this));
  }

  Start() {
    this.io.on('connect', this.connect.bind(this));
  }

  connect(socket) {
    console.log("_____client connected_____");

    socket.on('disconnect', this.disconnect.bind(this, socket));
    socket.on('addUser', this.addUser.bind(this, socket));
    socket.on('updateSocket', this.updateSocket.bind(this, socket));
    socket.on('join', this.join.bind(this, socket));

    socket.on('boardMade', this.rejectIfGameMissing.bind(this, this.boardMade.bind(this), socket));
    socket.on('makeMove', this.rejectIfGameMissing.bind(this, this.move.bind(this), socket));
  }

  disconnect(_socket, _data) {
    console.log("_____client disconnected_____");
  }

  addUser(socket, data) {
    console.dir(data, { depth: null, colors: true });
    //add gaurd
    if (this.Users.has(data.name)) {
      socket.emit('userAdded', {
        msg: 'Username taken'
      });
      return;
    }

    this.Users.add(data.name);
    socket.username = data.name;
    this.socketOfUser[data.name] = socket.id;
    socket.emit('userAdded', {
      msg: 'OK', name: data.name
    });

  }

  updateSocket(socket, data) {
    console.dir(data, { depth: null, colors: true });
    this.socketOfUser[data.player] = socket.id;
    socket.username = data.player;
  }

  async join(socket, data) {
    console.dir("Joining", data.player);
    let player1 = socket.username;
    if (player1 !== data.player) {
      this.updateSocket(socket, data);
      player1 = data.player;
    }

    if (this.UsersInQueue.includes(player1)) {
      socket.emit('lockJoin');
      return;
    }

    if (this.UsersInQueue.size <= 0) {
      this.UsersInQueue = this.UsersInQueue.push(player1);
      return;
    }

    let player2 = this.UsersInQueue.first();
    if (player2 === player1) {
      // Da actual faq
      return;
    }

    this.UsersInQueue = this.UsersInQueue.shift();

    let newGame = new Game(player1, player2);

    await r.table("games").insert({
      id: newGame.id,
      player1: player1,
      player2: player2,
      content: JSON.stringify(newGame),
    }).run(this.db);

    this.playerIsIn[player1] = newGame.id;
    this.playerIsIn[player2] = newGame.id;

    socket.emit('startGame', {
      'otherPlayer': player2
    });
    socket.to(this.socketOfUser[player2]).emit('startGame', {
      'otherPlayer': player1
    });

  }

  async boardMade(socket, player, game, data) {
    let shipPlacement = data.shipPlacement;
    if (shipPlacement == undefined) {
      console.log("missing shipPlacement");
      return;
    }

    let res = game.playerReady(player, shipPlacement);
    console.log(res);
    let status = await r.table("games").filter({id: game.id}).update({content: JSON.stringify(game)}).run(this.db);
    console.log("Replaced", status["replaced"]);
    let otherPlayer = game.otherPlayer(player);
    this.sendStuff(socket, otherPlayer, res);
  }

  async move(socket, player, game, data) {
    console.dir(data, { depth: null, colors: true });
    let move = data.move;
    if (move == undefined) {
      return;
    }

    let res = game.makeMove(player, move);
    console.log(res);
    let status = await r.table("games").filter({id: game.id}).update({content: JSON.stringify(game)}).run(this.db);
    console.log("Replaced", status["replaced"]);
    let otherPlayer = game.otherPlayer(player);
    this.sendStuff(socket, otherPlayer, res);
  }

  sendStuff(currentSocket, otherPlayer, res) {
    for (let message of res.thisPlayer) {
      currentSocket.emit(message.message, message.data);
    }

    if (res.otherPlayer) {
      for (let message of res.otherPlayer) {
        currentSocket.to(this.socketOfUser[otherPlayer]).emit(message.message, message.data);
      }
    }
  }

  async rejectIfGameMissing(callback, socket, data) {
    //console.log("rejectIfGameMissing");
    if (data == null || typeof (data) !== "object" || Object.keys(data).length === 0) {
      //console.log("Error", "missing data");
      return new Error("missing data");
    }

    let player = data.player;
    if (typeof (player) !== "string" || player.trim() === "") {
      //console.log("Error", "missing playerid");
      return new Error("missing playerId");
    }

    let gameId = this.playerIsIn[player];
    if (typeof (gameId) !== "string" || gameId.trim() === "") {
      //console.log("Error", "missing gameId");
      return new Error("missing gameId");
    }

    let games = await r.table("games").filter({ id: gameId }).run(this.db);
    let storedGame = null;
    try {
      storedGame = await games.next();
    } catch (error) {
      if (error.name != "ReqlDriverError") {
        throw new Error("missing game");
      }
    }

    if (storedGame == null) {
      return new Error("missing game");
    }

    let game = Game.gameFromString(storedGame.content);

    if (game == null || typeof (game) !== "object" || Object.keys(game).length === 0) {
      //console.log("Error", "missing game");
      return new Error("missing game");
    }
    //console.log("rejectIfGameMissing: OK");
    callback(socket, player, game, data);
  }

  rethinkDBConnectionCallback(err, conn) {
    if (err) {
      throw new Error("Can not connect to DB");
    }

    this.db = conn;
  }
}

module.exports = GameServer;
