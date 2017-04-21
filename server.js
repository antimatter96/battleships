var express = require('express');
var nunjucks = require('nunjucks');
var app = express();

var nunjucks = require('nunjucks');
app.set('views', __dirname + '/views');
nunjucks.configure(app.get('views'), {
	autoescape: true,
	noCache: true,
	watch: true,
	express: app
});

app.use('/static', express.static('static'));

var server = require('http').Server(app);
server.listen(8080);

var io = require('socket.io')(server);

io.set("log level", 1);

/*
	Currently storing these in memory;
	Might use a datastore
*/

const { List } = require('immutable');

var UsersInQueue = List();
var Users = new Set();

console.log(List.isList(UsersInQueue));

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
	
	console.log("CLIENT CONNECTED");
	
	socket.on('disconnect', function(data){
		console.log("CLIENT DISCONNECTED");
	});
	
	socket.use(function(packet, next){
		//console.log(packet);
		next();
	});
	
	socket.on('addUser', function (data) {
		console.log(data);
		if( Users.has(data.name) ){
			socket.emit('userAddEvent', { msg: 'Username Taken' } );
		}
		else{
			Users.add(data.name);
			socket.username = data.name;
			//userToSocketId[socket.id] = data.name;
			socketToUser[data.name] = socket.id;
			socket.emit('userAddEvent', { msg: 'OK' , name: data.name} );
		}
	});

	socket.on('updatePlayerSocket', function(data){
		//userToSocketId[socket.id] = data.player;
		socketToUser[data.player] = socket.id;
		socket.username = data.player;
	});

	socket.on('join', function (data) {
		console.log(socket.username);
		var player1 = socket.username;
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
				var player2 = UsersInQueue.first();
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
		//console.log(data);
		if(playerIsIn[data.player]){
			var player = data.player;
			var shipPlacement = data.shipPlacement;
			var res = Games[playerIsIn[player]].playerReady(player,shipPlacement);
			console.log(res);
			socket.emit('readyResponse', res );
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