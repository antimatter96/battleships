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

	this.playerOneShip = { A:new Set(), B:new Set(), C:new Set(), D:new Set(), E:new Set()};
	this.playerTwoShip = { A:new Set(), B:new Set(), C:new Set(), D:new Set(), E:new Set()};
	
	/*
	5ships
	
	shipA = 5
	shipB = 4
	shipC = 3
	shipD = 3
	shipE = 2
	
	*/
	this.lengthOfType = { A:5 , B:4, C:3, D:3, E:2};
	this.arrOfI = ['1','2','3','4','5','6','7','8','9','10'];
	this.arrOfJ = ['A','B','C','D','E','F','G','H','I','J'];
	
};

Game.prototype.playerReady = function(player,shipPlacement) {
	if(this.p1 === player){
		if(this.p1BoardDone){
			return { status:"Error", msg:"Already Choosen" };
		}
		else{
			console.log(shipPlacement['A']);
			for( var shipType in shipPlacement){
				var length = this.lengthOfType[shipType];
				for(var i=0;i<length;i++){
					console.log(shipPlacement[shipType][i]);
				}
			}
			this.p1BoardDone = true;
			
			return { status:"OK", msg:"Done" };
		}
	}
	else if(this.p2 === player){
		if(this.p2BoardDone){
			return { status:"Error", msg:"Already Choosen" };
		}
		else{
			console.log(shipPlacement['A']);
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