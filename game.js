var uuid = require('uuid/v4');

class Game {
	constructor(player1, player2) {
		this.id = uuid();
		this.p1 = player1;
		this.p2 = player2;
		this.p1BoardDone = false;
		this.p2BoardDone = false;
		this.turnOf = this.p1;

		this.playerOneBoard = [null, null, null, null, null, null, null, null, null, null];
		this.playerTwoBoard = [null, null, null, null, null, null, null, null, null, null];
		//this.playerOneBoardForTwo = [null,null,null,null,null,null,null,null,null,null];
		//this.playerTwoBoardForOne = [null,null,null,null,null,null,null,null,null,null];

		for (var i = 0; i < 10; i++) {
			this.playerOneBoard[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			//this.playerOneBoardForTwo[i] = new Array(0,0,0,0,0,0,0,0,0,0,0); 
			this.playerTwoBoard[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			//this.playerTwoBoardForOne[i] = new Array(0,0,0,0,0,0,0,0,0,0,0); 
		}

		this.playerOneShip = { A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set() };
		this.playerTwoShip = { A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set() };
		/*
		5ships
		
		shipA = 5
		shipB = 4
		shipC = 3
		shipD = 3
		shipE = 2
		
		*/

		this.lengthOfType = { A: 5, B: 4, C: 3, D: 3, E: 2 };
		this.arrOfI = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		this.arrOfJ = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
	}

	playerReady(player, shipPlacement) {
		if (this.p1 === player) {
			if (this.p1BoardDone) {
				return { status: "Error", msg: "Already Choosen" };
			}
			else {
				for (let shipType in shipPlacement) {
					let length = this.lengthOfType[shipType];
					for (let i = 0; i < length; i++) {
						let point = shipPlacement[shipType][i];
						this.playerOneShip[shipType].add(JSON.stringify(point));
						this.playerOneBoard[point.x][point.y] = 1;
						//this.playerOneBoardForTwo[point.x][point.y] = 0;
					}
				}
				this.p1BoardDone = true;
				return { status: "OK", msg: "Done" };
			}
		}
		else if (this.p2 === player) {
			if (this.p2BoardDone) {
				return { status: "Error", msg: "Already Choosen" };
			}
			else {
				for (var shipType in shipPlacement) {
					var length = this.lengthOfType[shipType];
					for (var i = 0; i < length; i++) {
						let point = shipPlacement[shipType][i];
						this.playerTwoShip[shipType].add(JSON.stringify(point));
						this.playerTwoBoard[point.x][point.y] = 1;
						//this.playerTwoBoardForOne[point.x][point.y] = 0;
					}
				}
				this.p2BoardDone = true;
				return { status: "OK", msg: "Done" };
			}
		}

		/* TO DO
			REDUCE SIZE BY SAME LOGIC AS IN MAKEMOVE
		*/

	};

	bothReady() {
		return this.p1BoardDone && this.p2BoardDone;
	};

	otherPlayer(player) {
		if (player === this.p1) {
			return this.p2;
		}
		else {
			return this.p1;
		}
	};

	startGame(player) {
		this.turnOf = player;
	};

	makeMove(player, move) {
		if (this.turnOf === player) {
			let x = move.x;
			let y = move.y;
			let point = { x: x, y: y };

			var otherPlayerBoard;

			var otherPlayerShip;

			if (this.p1 === player) {
				otherPlayerBoard = this.playerTwoBoard;
				otherPlayerShip = this.playerTwoShip;
			}
			else {
				otherPlayerBoard = this.playerOneBoard;
				otherPlayerShip = this.playerOneShip;
			}

			if (otherPlayerBoard[x][y] === 1) {
				otherPlayerBoard[x][y] = -1;
				let tempPoint = JSON.stringify(point);
				let countZero = 0;
				let extra = {};
				for (var shipType in otherPlayerShip) {
					if (otherPlayerShip[shipType].has(tempPoint)) {
						otherPlayerShip[shipType].delete(tempPoint);
						extra.partOf = shipType;
						if (otherPlayerShip[shipType].size === 0) {
							extra.shipDown = true;
							countZero++;
						}
					}
					else if (otherPlayerShip[shipType].size === 0) {
						countZero++;
					}
					if (countZero === 5) {
						console.log("Over");
						extra.gameOver = true;
					}
				}
				this.turnOf = this.otherPlayer(player);
				return { status: "OK", forShooter: { status: "OK", result: "Hit", extra: extra }, forTarget: { status: "OK", result: "Hit", point: move, extra: extra } };
			}
			else if (otherPlayerBoard[x][y] === 0) {
				otherPlayerBoard[x][y] = -1;
				this.turnOf = this.otherPlayer(player);
				return { status: "OK", forShooter: { status: "OK", result: "Miss" }, forTarget: { status: "OK", result: "Miss", point: move } };
			}
			else {
				return { status: "Rep", forShooter: { status: "OK", result: "Repeat" } };
			}
		}
		else {
			return { status: "Error", msg: "Not your turn" };
		}
	};

}
module.exports = Game;