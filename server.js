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
server.listen(process.env.PORT || 8080);

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

var socketOfUser = [];

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
			socket.emit('userAdded', { msg: 'Username Taken' } );
		}
		else{
			Users.add(data.name);
			socket.username = data.name;
			socketOfUser[data.name] = socket.id;
			socket.emit('userAdded', { msg: 'OK' , name: data.name } );
		}
	});

	socket.on('updateSocket', function(data){
		socketOfUser[data.player] = socket.id;
		socket.username = data.player;
	});

	socket.on('join', function (data) {
		let player1 = socket.username;
		if(player1 != data.player){
			socket.username = data.player;
			socketOfUser[data.player] = socket.id;
			player1 = data.player;
		}
		if(UsersInQueue.includes(player1)){
			socket.emit('lockJoin');
		}
		else{
			if(UsersInQueue.size > 0){
				let player2 = UsersInQueue.first();
				if(player2 === player1){
					
				}
				else{
					UsersInQueue = UsersInQueue.shift();
					socket.emit('startGame', { otherPlayer: player2 });
					socket.to(socketOfUser[player2]).emit('startGame', { otherPlayer: player1 });
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

	socket.on('boardMade' , function(data){
		if(playerIsIn[data.player]){
			let player = data.player;
			let shipPlacement = data.shipPlacement;
			let game = Games[playerIsIn[player]];
			let res = game.playerReady(player,shipPlacement);
			if(game.bothReady()){
				socket.emit('wait', res );
				socket.emit('go', {start:true} );
				let otherPlayer = game.otherPlayer(player);
				game.startGame(player);
				socket.to(socketOfUser[otherPlayer]).emit('go', { start: false } );
			}
			else{
				socket.emit('wait', res );
			}
		}
	});
	
	socket.on('makeMove' , function(data){
		if(playerIsIn[data.player]){
			let player = data.player;
			let game = Games[playerIsIn[player]];
			let res = game.makeMove(player,data.move);
			if(res.status == "OK"){
				socket.emit('yourMove', res.forShooter );
				let otherPlayer = game.otherPlayer(player);
				socket.to(socketOfUser[otherPlayer]).emit('oppMove', res.forTarget );
				
				//GAME END CHECK
				
			}
			else if(res.status == "Rep"){
				socket.emit('yourMove', res.forShooter );
			}
			else{
				socket.emit('moveError', res );
			}
		}
	});

});