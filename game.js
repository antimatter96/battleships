var uuid = require('uuid/v4');

function Game(player1,player2) {
	this.id = uuid();
	this.p1 = player1;
	this.p2 = player2;
	this.p1BoardDone = false;
	this.p2BoardDone = false;
	this.turnOf = this.p1;
	
	this.playerOneBoard = [null,null,null,null,null,null,null,null,null];
	this.playerTwoBoard = [null,null,null,null,null,null,null,null,null];
	this.playerOneBoardForTwo = [null,null,null,null,null,null,null,null,null];
	this.playerTwoBoardForOne = [null,null,null,null,null,null,null,null,null];
	
	for(var i = 0; i<9; i++){
		this.playerOneBoard = new Array(0,0,0,0,0,0,0,0,0);
		this.playerOneBoardForTwo = new Array(0,0,0,0,0,0,0,0,0); 
		this.playerTwoBoard = new Array(0,0,0,0,0,0,0,0,0); 
		this.playerTwoBoardForOne = new Array(0,0,0,0,0,0,0,0,0); 
	}

	this.playerOneShipA = new Set();
	this.playerOneShipB = new Set();
	this.playerOneShipC = new Set();
	this.playerOneShipD = new Set();
	this.playerOneShipE = new Set();
	
	this.playerTwoShipA = new Set();
	this.playerTwoShipB = new Set();
	this.playerTwoShipC = new Set();
	this.playerTwoShipD = new Set();
	this.playerTwoShipE = new Set();
	
	/*
	5ships
	
	shipA = 2
	shipB = 3
	shipC = 3
	shipD = 4
	shipE = 5
	
	*/
	
};

Game.prototype.playerReady = function(player,shipPlacement) {
	if(this.p1 === player){
		if(this.p1BoardDone){
			return { status:"Error", msg:"Already Choosen" };
		}
		else{
			this.p1BoardDone = true;
			return { status:"OK", msg:"Done" };
		}
		
		
	}
	else if(this.p2 === player){
		if(this.p2BoardDone){
			return { status:"Error", msg:"Already Choosen" };
		}
		else{
			this.p2BoardDone = true;
			return { status:"OK", msg:"Done" };
		}
		
		
	}
};

Game.prototype.init = function(player1,player2){
	this.p1 = player1;
	this.p2 = player2;
}

Game.prototype.makeMove = function(data){
	var moveMaked = data.move;
	var by = data.move;
}

Game.prototype.bothReady = function() {
	return p1BoardDone && p2BoardDone;
};

module.exports = Game;