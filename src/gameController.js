const { List } = require('immutable');
const Game = require('./game');

const SocketIO = require('socket.io');

class GameServer {
  constructor(server) {
    this.io = SocketIO(server);

    this.UsersInQueue = List();
    this.Users = new Set();
    this.socketOfUser = [];

    this.playerIsIn = [];
    this.Games = [];

    this.io.on('connect', this.connect.bind(this));
  }

  connect(socket) {
    //console.log(socket);
    console.log("_____client connected_____");

    socket.on('disconnect',   this.disconnect.bind(this, socket));
    socket.on('addUser',      this.addUser.bind(this, socket));
    socket.on('updateSocket', this.updateSocket.bind(this, socket));
    socket.on('join',         this.join.bind(this, socket));

    socket.on('boardMade',    this.boardMade.bind(this, socket));
    socket.on('makeMove',         this.move.bind(this, socket));
  }

  disconnect(socket, data) {
    console.log("_____client disconnected_____");
  }

  addUser(socket, data) {
    if (this.Users.has(data.name)) {
      socket.emit('userAdded', {
        msg: 'Username taken'
      })
      return
    }

    this.Users.add(data.name);
    socket.username = data.name;
    this.socketOfUser[data.name] = socket.id;
    socket.emit('userAdded', {
      msg: 'OK', name: data.name
    });

  }

  updateSocket(socket, data) {
    this.socketOfUser[data.player] = socket.id;
    socket.username = data.player;
  }

  join(socket, data) {
    console.log(data);
    let player1 = socket.username;
    if (player1 != data.player) {
      socket.username = data.player;
      this.socketOfUser[data.player] = socket.id;
      player1 = data.player;
    }

    if (this.UsersInQueue.includes(player1)) {
      socket.emit('lockJoin');
      return
    }
    if (this.UsersInQueue.size <= 0) {
      this.UsersInQueue = this.UsersInQueue.push(player1);
      return
    }

    let player2 = this.UsersInQueue.first();
    if (player2 === player1) {
      // Da actual faq
      return
    }

    this.UsersInQueue = this.UsersInQueue.shift();

    let newGame = new Game(player1, player2);
    this.Games[newGame.id] = newGame;
    this.playerIsIn[player1] = newGame.id;
    this.playerIsIn[player2] = newGame.id;

    socket.emit('startGame', {
      'otherPlayer': player2
    });
    socket.to(this.socketOfUser[player2]).emit('startGame', {
      'otherPlayer': player1
    });

  }


  boardMade(socket, data) {
    if (data == null || data == undefined) {
      return
    }
    let player = data.player;
    if (player == null || player == undefined) {
      return
    }
    let gameId = this.playerIsIn[player];
    if (gameId == null || gameId == undefined) {
      return;
    }

    let game = this.Games[this.playerIsIn[player]];
    if (game == null || game == undefined) {
      return;
    }

    let shipPlacement = data.shipPlacement;
    if (shipPlacement == null || shipPlacement == undefined) {
      console.log("missing shipPlacement");
      return;
    }

    let res = game.playerReady(player, shipPlacement);

    for (let message of res.thisPlayer ){
      socket.emit(message.message, message.data)
    }

    if (res.otherPlayer) {
      let otherPlayer = game.otherPlayer(player);
      for (let message of res.otherPlayer ){
        socket.to(this.socketOfUser[otherPlayer]).emit(message.message, message.data)
      }
    }

  }

  move(socket, data) {
    if (data == null || data == undefined) {
      return
    }
    let player = data.player;
    if (player == null || player == undefined) {
      return
    }
    let gameId = this.playerIsIn[player];
    if (gameId == null || gameId == undefined) {
      return;
    }

    let game = this.Games[this.playerIsIn[player]];
    if (game == null || game == undefined) {
      return;
    }

    let move = data.move
    if (move == null || move == undefined) {
      return;
    }

    let res = game.makeMove(player, move);

    for (let message of res.thisPlayer ){
      socket.emit(message.message, message.data)
    }

    if (res.otherPlayer) {
      let otherPlayer = game.otherPlayer(player);
      for (let message of res.otherPlayer ){
        socket.to(this.socketOfUser[otherPlayer]).emit(message.message, message.data)
      }
    }

  }

  rejectIfGameMissing(socket, data, callback) {
    callback(socket, data);
  }
}

module.exports = GameServer;
