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

    socket.on('disconnect', this.disconnect.bind(this, socket));
    socket.on('addUser', this.addUser.bind(this, socket));
    socket.on('updateSocket', this.updateSocket.bind(this, socket));
    socket.on('join', this.join.bind(this, socket));
    socket.on('boardMade', this.boardMade.bind(this, socket));
    socket.on('move', this.move.bind(this, socket));
  }

  disconnect(socket, data) {
    console.log("_____client disconnected_____");
  }

  addUser(socket, data) {
    if (this.Users.has(data.name)) {
      socket.emit('userAdded', {
        msg: 'Username taken'
      })
    } else {
      this.Users.add(data.name);
      socket.username = data.name;
      this.socketOfUser[data.name] = socket.id;
      socket.emit('userAdded', {
        msg: 'OK', name: data.name
      });
    }
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
    } else {
      if (this.UsersInQueue.size > 0) {
        let player2 = this.UsersInQueue.first();
        if (player2 === player1) {

        } else {
          UsersInQueue = this.UsersInQueue.shift();

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
      } else {
        this.UsersInQueue = this.UsersInQueue.push(player1);
      }
    }
  }


  boardMade(socket, data) {
    if (this.playerIsIn[data.player]) {
      let player = data.player;
      let shipPlacement = data.shipPlacement;
      let game = this.Games[this.playerIsIn[player]];
      let res = game.playerReady(player, shipPlacement);
      if (game.bothReady()) {
        let otherPlayer = game.otherPlayer(player);
        game.startGame(player);

        socket.emit('wait', res);
        socket.emit('go', {
          start: true
        });
        socket.to(this.socketOfUser[otherPlayer]).emit('go', {
          start: false
        });

      } else {
        socket.emit('wait', res);
      }
    }
  }

  move(socket, data) {
    if (playerIsIn[data.player]) {
      let player = data.player;
      let game = this.Games[playerIsIn[player]];
      let res = game.makeMove(player, data.move);
      if (res.status == "OK") {
        let otherPlayer = game.otherPlayer(player);

        socket.emit('yourMove', res.forShooter);
        socket.to(this.socketOfUser[otherPlayer]).emit('oppMove', res.forTarget);

        //GAME END CHECK

      } else if (res.status == "Rep") {
        socket.emit('yourMove', res.forShooter);
      } else {
        socket.emit('moveError', res);
      }
    }
  }
}

module.exports = GameServer;
