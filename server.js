var express = require('express');
var app = express();

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/static/favicon.ico'));
app.use('/static', express.static('static'));
app.set('views', __dirname + '/views');

var nunjucks = require('nunjucks');
nunjucks.configure(app.get('views'), {
	autoescape: true,
	noCache: true,
	watch: true,
	express: app
});

var server = require('http').Server(app);
server.listen(8080);

var io = require('socket.io')(server);

/*
=====================================

	Currently storing these in memory;
	Might use a datastore
	
======================================
*/

const { List } = require('immutable');

var UsersInQueue = List();
var Users = new Set();

var userToSocketId = [];
var socketToUser = [];

var Games = [];
var Game = require('./game');
var playerIsIn = [];

app.use(function(req, res, next){
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
	res.setHeader("X-powered-by", "none");
	next();
});

app.get('/', function (req, res) {
	res.render('index.njk');
});

io.on('connection', function (socket) {
	
	console.log("_____client connected_____");
	
	socket.on('disconnect', function(data){
		console.log("_____client disconnected_____");
	});
	
	socket.on('addUser', function (data) {
		console.log(data);
		if( Users.has(data.name) ){
			socket.emit('userAddEvent', { msg: 'Username Taken' } );
		}
		else{
			Users.add(data.name);
			socket.username = data.name;
			socketToUser[data.name] = socket.id;
			socket.emit('userAddEvent', { msg: 'OK' , name: data.name } );
		}
	});

	socket.on('updatePlayerSocket', function(data){
		socketToUser[data.player] = socket.id;
		socket.username = data.player;
	});

	socket.on('join', function (data) {
		let player1 = socket.username;
		if(player1 != data.player){
			socket.username = data.player;
			socketToUser[data.player] = socket.id;
			player1 = data.player;
		}
		if(UsersInQueue.includes(player1)){
			socket.emit('lockJoin');
		}
		else{
			if(UsersInQueue.size > 0){
				let player2 = UsersInQueue.first();
				if(player2 === player1){
					//timeOutStorage[player1] = setInterval(function(){findAPlayerFor(player1)}, 500);
				}
				else{
					UsersInQueue = UsersInQueue.shift();
					/*
					if(timeOutStorage[player2]){
						clearInterval(timeOutStorage[player2]);
					}
					*/
					socket.emit('startGame', { otherPlayer: player2 });
					socket.to(socketToUser[player2]).emit('startGame', { otherPlayer: player1 });
					var newGame = new Game(player1,player2);
					Games[newGame.id] = newGame;
					playerIsIn[player1] = newGame.id;
					playerIsIn[player2] = newGame.id;
				}
			}
			else{
				UsersInQueue = UsersInQueue.push(player1);
			}
		}		
	});

	socket.on('addToFree', function (data) {
		
	});

	socket.on('boardMade' , function(data){
		if(playerIsIn[data.player]){
			let player = data.player;
			let shipPlacement = data.shipPlacement;
			let game = Games[playerIsIn[player]];
			let res = game.playerReady(player,shipPlacement);
			if(game.bothReady()){
				socket.emit('readyResponse', res );
				socket.emit('go', {start:true} );
				let otherPlayer = game.otherPlayer(player);
				game.startGame(player);
				socket.to(socketToUser[otherPlayer]).emit('go', { start: false } );
			}
			else{
				socket.emit('readyResponse', res );
			}
		}
	});
	
	socket.on('makeMove' , function(data){
		if(playerIsIn[data.player]){
			let player = data.player;
			let game = Games[playerIsIn[player]];
			let res = game.makeMove(player,data.move);
			if(res.status == "OK"){
				socket.emit('moveMadeByYou', res.forShooter );
				let otherPlayer = game.otherPlayer(player);
				socket.to(socketToUser[otherPlayer]).emit('moveMadeByOther', res.forTarget );
			}
			else if(res.status == "Rep"){
				socket.emit('moveMadeByYou', res.forShooter );
			}
			else{
				socket.emit('makeMoveError', res );
			}
		}
	});
	
	/*
	function findAPlayerFor(player1){
		if(UsersInQueue.size > 1){
			var player2 = UsersInQueue[1];
			if(player2 === player1){
				console.log("Finding for" + player1 + "COLLISION");
			}
			else{
				UsersInQueue = UsersInQueue.delete(1);
				clearInterval(timeOutStorage[player1]);
				socket.to(socketToUser[player2]).emit('startGame', { otherPlayer: player1 })
				socket.to(socketToUser[player1]).emit('startGame', { otherPlayer: player2 })
			}
		}
		else{
			console.log("Finding for" + player1 + "Few Players");
		}
	}

	var timeOutStorage = [];
	*/

});


//var s1 = setInterval(function(){console.log(UsersInQueue);},10000);
//var s2 = setInterval(function(){console.log(Games);},10000);
//var s3 = setInterval(function(){console.log(playerIsIn);},10000);