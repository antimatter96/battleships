var socket_io = require("socket.io");
const {
	List
} = require("immutable");

var jwt = require("jsonwebtoken");

var UsersInQueue = List();
var Users = new Set();

var socketOfUser = [];

var Games = [];

var Game = require("./models/game");

var playerIsIn = [];

function socketDisconnect(_data) {
	let socket = this;
	console.log("_____client disconnected_____");
}

function addUser(data) {
	let socket = this;
	console.log(data);
	if (Users.has(data.name)) {
		socket.emit("userAdded", {
			msg: "Username Taken"
		});
	} else {
		Users.add(data.name);
		socket.username = data.name;
		socketOfUser[data.name] = socket.id;
		socket.emit("userAdded", {
			msg: "OK",
			name: data.name,
			token: jwt.sign(data.name, privateKey, { algorithm: 'RS256' })
		});
	}
}

function join(data) {
	let socket = this;
	let player1 = socket.username;
	if (player1 != data.player) {
		socket.username = data.player;
		socketOfUser[data.player] = socket.id;
		player1 = data.player;
	}
	if (UsersInQueue.includes(player1)) {
		socket.emit("lockJoin");
	} else {
		if (UsersInQueue.size > 0) {
			let player2 = UsersInQueue.first();
			if (player2 === player1) {} else {
				UsersInQueue = UsersInQueue.shift();
				socket.emit("startGame", {
					otherPlayer: player2
				});
				socket.to(socketOfUser[player2]).emit("startGame", {
					otherPlayer: player1
				});
				var newGame = new Game(player1, player2);
				Games[newGame.id] = newGame;
				playerIsIn[player1] = newGame.id;
				playerIsIn[player2] = newGame.id;
			}
		} else {
			UsersInQueue = UsersInQueue.push(player1);
		}
	}
}

function makeMove(data) {
	let socket = this;
	if (playerIsIn[data.player]) {
		let player = data.player;
		let game = Games[playerIsIn[player]];
		let res = game.makeMove(player, data.move);
		if (res.status == "OK") {
			socket.emit("yourMove", res.forShooter);
			let otherPlayer = game.otherPlayer(player);
			socket.to(socketOfUser[otherPlayer]).emit("oppMove", res.forTarget);

			//GAME END CHECK

		} else if (res.status == "Rep") {
			socket.emit("yourMove", res.forShooter);
		} else {
			socket.emit("moveError", res);
		}
	}
}

function boardMade(data) {
	let socket = this;
	if (playerIsIn[data.player]) {
		let player = data.player;
		let shipPlacement = data.shipPlacement;
		let game = Games[playerIsIn[player]];
		let res = game.playerReady(player, shipPlacement);
		if (game.bothReady()) {
			socket.emit("wait", res);
			socket.emit("go", {
				start: true
			});
			let otherPlayer = game.otherPlayer(player);
			game.startGame(player);
			socket.to(socketOfUser[otherPlayer]).emit("go", {
				start: false
			});
		} else {
			socket.emit("wait", res);
		}
	}
}

function updateSocket(data) {
	let socket = this;
	//console.log(data);
	if(UsersDB.verifyJWT(data.username, data.token)) {
		socketOfUser[data.username] = socket.id;
		socket.username = data.username;
		socket.emit("socketUpdated");
	} else {
		socket.emit("socketUpdateRejected");
	}
}

var UsersDB;
function init(server, _UsersDB) {
	UsersDB = _UsersDB;

	var io = socket_io(server);
	io.on("connection", (socket) => {
		console.log(`_____client connected_____ ${socket.id}`);
		socket.on("disconnect", socketDisconnect.bind(socket));
		socket.on("addUser", addUser.bind(socket));
		socket.on("updateSocket", updateSocket.bind(socket));
		socket.on("join", join.bind(socket));
		socket.on("boardMade", boardMade.bind(socket));
		socket.on("makeMove", makeMove.bind(socket));
	});
}
module.exports = {
	init: init
};