var uuid = require("uuid/v4");

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

		this.playerOneShip = {
			"A": new Set(),
			"B": new Set(),
			"C": new Set(),
			"D": new Set(),
			"E": new Set()
		};
		this.playerTwoShip = {
			"A": new Set(),
			"B": new Set(),
			"C": new Set(),
			"D": new Set(),
			"E": new Set()
		};

		/*
		5ships
		
		shipA = 5
		shipB = 4
		shipC = 3
		shipD = 3
		shipE = 2
		
		*/

		this.lengthOfType = {
			"A": 5,
			"B": 4,
			"C": 3,
			"D": 3,
			"E": 2
		};
		this.arrOfI = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
		this.arrOfJ = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	}

	playerReady(player, shipPlacement) {
		var playerShip;
		var playerBoard;
		var playerBoardDone;

		if (this.p1 === player) {
			playerShip = this.playerOneShip;
			playerBoard = this.playerOneBoard;
			playerBoardDone = this.p1BoardDone;
		} else {
			playerShip = this.playerTwoShip;
			playerBoard = this.playerTwoBoard;
			playerBoardDone = this.p2BoardDone;
		}

		if (playerBoardDone) {
			return {
				status: "Error",
				msg: "Already Choosen"
			};
		}

		for (let shipType in shipPlacement) {
			let length = this.lengthOfType[shipType];
			for (let i = 0; i < length; i++) {
				let point = shipPlacement[shipType][i];
				playerShip[shipType].add(JSON.stringify(point));
				playerBoard[point.x][point.y] = 1;
				//this.playerOneBoardForTwo[point.x][point.y] = 0;
			}
		}

		playerBoardDone = true;

		return {
			status: "OK",
			msg: "Done"
		};

	}

	bothReady() {
		return this.p1BoardDone && this.p2BoardDone;
	}

	otherPlayer(player) {
		return player === this.p1 ? this.p2 : this.p1;
	}

	startGame(player) {
		this.turnOf = player;
	}

	makeMove(player, move) {
		if (!this.turnOf === player) {
			return {
				status: "Error",
				msg: "Not your turn"
			};
		}

		let x = move.x;
		let y = move.y;
		let point = {
			x: x,
			y: y
		};

		var otherPlayerBoard;

		var otherPlayerShip;

		if (this.p1 === player) {
			otherPlayerBoard = this.playerTwoBoard;
			otherPlayerShip = this.playerTwoShip;
		} else {
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
				} else if (otherPlayerShip[shipType].size === 0) {
					countZero++;
				}
				if (countZero === 5) {
					console.log("Over");
					extra.gameOver = true;
				}
			}
			this.turnOf = this.otherPlayer(player);
			return {
				status: "OK",
				forShooter: {
					status: "OK",
					result: "Hit",
					extra: extra
				},
				forTarget: {
					status: "OK",
					result: "Hit",
					point: move,
					extra: extra
				}
			};
		} else if (otherPlayerBoard[x][y] === 0) {
			otherPlayerBoard[x][y] = -1;
			this.turnOf = this.otherPlayer(player);
			return {
				status: "OK",
				forShooter: {
					status: "OK",
					result: "Miss"
				},
				forTarget: {
					status: "OK",
					result: "Miss",
					point: move
				}
			};
		} else {
			return {
				status: "Rep",
				forShooter: {
					status: "OK",
					result: "Repeat"
				}
			};
		}
	}
}

module.exports = Game;