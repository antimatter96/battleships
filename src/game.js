const uuid = require('uuid/v4');

/*
    5 ships

    shipA = 5
    shipB = 4
    shipC = 3
    shipD = 3
    shipE = 2

*/

class Game {
  constructor(player1, player2) {
    this.id = uuid();
    this.p1 = player1;
    this.p2 = player2;
    this.p1BoardDone = { bool: false };
    this.p2BoardDone = { bool: false };
    this.turnOf = this.p1;

    this.playerOneBoard = [null, null, null, null, null, null, null, null, null, null];
    this.playerTwoBoard = [null, null, null, null, null, null, null, null, null, null];

    for (let i = 0; i < 10; i++) {
      this.playerOneBoard[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      this.playerTwoBoard[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    this.playerOneShip = { A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set() };
    this.playerTwoShip = { A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set() };


    this.lengthOfType = { A: 5, B: 4, C: 3, D: 3, E: 2 };
    this.arrOfI = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    this.arrOfJ = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  }

  playerReady(player, shipPlacement) {
    let playerBoardDone = this.p1BoardDone;
    let playerShip = this.playerOneShip;
    let playerBoard = this.playerOneBoard;

    if (this.p2 === player) {
      playerBoardDone = this.p2BoardDone;
      playerShip = this.playerTwoShip;
      playerBoard = this.playerTwoBoard;
    }

    if (playerBoardDone.bool) {
      return {
        thisPlayer: [
          { message: "wait", data: { status: "Error", msg: "Already Choosen" } }
        ],
      };
    }

    for (let shipType in shipPlacement) {
      let length = this.lengthOfType[shipType];
      for (let i = 0; i < length; i++) {
        let point = shipPlacement[shipType][i];
        playerShip[shipType].add(JSON.stringify(point));
        playerBoard[point.x][point.y] = 1;
      }
    }

    playerBoardDone.bool = true;

    if (this.bothReady()) {
      this.startGame(player);
      return {
        thisPlayer: [
          { message: "wait", data: { status: "OK", msg: "Done" } },
          { message: "go", data: { status: "OK", start: true } }
        ],
        otherPlayer: [
          { message: "go", data: { status: "OK", start: false } }
        ]
      };
    } else {
      return {
        thisPlayer: [
          { message: "wait", data: { status: "OK", msg: "Done" } },
        ]
      };
    }
  }

  bothReady() {
    return this.p1BoardDone.bool && this.p2BoardDone.bool;
  }

  otherPlayer(player) {
    if (player === this.p1) {
      return this.p2;
    } else {
      return this.p1;
    }
  }

  startGame(player) {
    this.turnOf = player;
  }

  makeMove(player, move) {
    if (this.turnOf != player) {
      return {
        thisPlayer: [{ message: 'moveError', data: { status: "Error", msg: "Not your turn" } }]
      };
    }
    let x = move.x;
    let y = move.y;
    let point = { x: x, y: y };

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
        thisPlayer: [{ message: "yourMove", data: { status: "OK", result: "Hit", extra: extra } }],
        otherPlayer: [{ message: "oppMove", data: { status: "OK", result: "Hit", point: move, extra: extra } }]
      };
    } else if (otherPlayerBoard[x][y] === 0) {
      otherPlayerBoard[x][y] = -1;
      this.turnOf = this.otherPlayer(player);
      return {
        thisPlayer: [{ message: "yourMove", data: { status: "OK", result: "Miss" } }],
        otherPlayer: [{ message: "oppMove", data: { status: "OK", result: "Miss", point: move } }]
      };
    } else {
      return {
        thisPlayer: [{ message: "yourMove", data: { status: "OK", result: "Repeat" } }],
      };
    }
  }

}
module.exports = Game;
