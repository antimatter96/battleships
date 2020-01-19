let playerBoard = new Array(10);
for (let i = 0; i < 10; i++) {
  playerBoard[i] = (new Array(10)).fill(0);
}

let shipPlacement = {};
let playerShip = {};

shipPlacement["A"] = {
  "0": { "x": 0, "y": 0 },
  "1": { "x": 1, "y": 0 },
  "2": { "x": 2, "y": 0 },
  "3": { "x": 3, "y": 0 },
  "4": { "x": 4, "y": 0 },
}
playerBoard[0][0] = 1;
playerBoard[1][0] = 1;
playerBoard[2][0] = 1;
playerBoard[3][0] = 1;
playerBoard[4][0] = 1;
playerShip["A"] = new Set();
playerShip["A"].add('{"x":0,"y":0}');
playerShip["A"].add('{"x":1,"y":0}');
playerShip["A"].add('{"x":2,"y":0}');
playerShip["A"].add('{"x":3,"y":0}');
playerShip["A"].add('{"x":4,"y":0}');


shipPlacement["B"] = {
  "0": { "x": 0, "y": 1 },
  "1": { "x": 1, "y": 1 },
  "2": { "x": 2, "y": 1 },
  "3": { "x": 3, "y": 1 },
}
playerBoard[0][1] = 1;
playerBoard[1][1] = 1;
playerBoard[2][1] = 1;
playerBoard[3][1] = 1;
playerShip["B"] = new Set();
playerShip["B"].add('{"x":0,"y":1}');
playerShip["B"].add('{"x":1,"y":1}');
playerShip["B"].add('{"x":2,"y":1}');
playerShip["B"].add('{"x":3,"y":1}');


shipPlacement["C"] = {
  "0": { "x": 0, "y": 2 },
  "1": { "x": 1, "y": 2 },
  "2": { "x": 2, "y": 2 },
}
playerBoard[0][2] = 1;
playerBoard[1][2] = 1;
playerBoard[2][2] = 1;
playerShip["C"] = new Set();
playerShip["C"].add('{"x":0,"y":2}');
playerShip["C"].add('{"x":1,"y":2}');
playerShip["C"].add('{"x":2,"y":2}');


shipPlacement["D"] = {
  "0": { "x": 0, "y": 3 },
  "1": { "x": 1, "y": 3 },
  "2": { "x": 2, "y": 3 },
}
playerBoard[0][3] = 1;
playerBoard[1][3] = 1;
playerBoard[2][3] = 1;
playerShip["D"] = new Set();
playerShip["D"].add('{"x":0,"y":3}');
playerShip["D"].add('{"x":1,"y":3}');
playerShip["D"].add('{"x":2,"y":3}');


shipPlacement["E"] = {
  "0": { "x": 0, "y": 4 },
  "1": { "x": 1, "y": 4 },
}
playerBoard[0][4] = 1;
playerBoard[1][4] = 1;
playerShip["E"] = new Set();
playerShip["E"].add('{"x":0,"y":4}');
playerShip["E"].add('{"x":1,"y":4}');

module.exports = {
  shipPlacement: shipPlacement,
  playerBoard: playerBoard,
  playerShip: playerShip,
}