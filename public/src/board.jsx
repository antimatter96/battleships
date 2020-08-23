import React from 'react';
import { rowHeaders, colStarts, joinSets } from './Utils';
import Cell from './cell';

const infoSet = new Set(["board-cell-info"]);
const btnSet = new Set(["board-cell"]);
const hitSetBlank = new Set(["board-cell"]);

const boardCellShipA = new Set(["shipA"]);
const boardCellShipB = new Set(["shipB"]);
const boardCellShipC = new Set(["shipC"]);
const boardCellShipD = new Set(["shipD"]);
const boardCellShipE = new Set(["shipE"]);

const missSet = new Set(["board-cell"]);

let lengthOfType = { A: 5, B: 4, C: 3, D: 3, E: 2 };

class Board extends React.Component {
  constructor(props) {
    super(props);

    let pointsOfShip = {
      A: new Set(),
      B: new Set(),
      C: new Set(),
      D: new Set(),
      E: new Set(),
    };

    let playerBoard;
    if (props.playerBoard) {
      playerBoard = props.playerBoard;
    } else {
      playerBoard = new Array(10);
      for (let i = 0; i < 10; i++) {
        playerBoard[i] = (new Array(10)).fill(0);
      }
    }

    let playerBoardClasses;
    if (props.playerBoardClasses) {
      playerBoardClasses = props.playerBoardClasses;
    } else {
      playerBoardClasses = new Array(10);

      for (let i = 0; i < 10; i++) {
        playerBoardClasses[i] = (new Array(10)).fill(0);
      }

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          playerBoardClasses[i][j] = new Set();
        }
      }
    }

    this.state = {
      pointsOfShip: pointsOfShip,
      playerBoard: playerBoard,
      playerBoardClasses: playerBoardClasses,
    };
  }

  getClassName(i, j) {
    let status = this.state.playerBoard[i][j];
    let toAdd = this.props.playerBoardClasses[i][j];

    let toRet = [];

    switch (status) {
      case 1:
        toRet = joinSets(btnSet, toAdd);
        break;
      default:
        toRet = [...btnSet];
        break;
    }

    return [...toRet];
  }

  render() {
    this.headers = rowHeaders.map((number) => {
      return (
        <Cell
          key={number.toString()}
          dataInfo={number}
          classes={[...infoSet]}
        />
      );
    });

    this.body = colStarts.map((i) => {
      return (
        <div key={i} className="board-row" >
          <Cell classes={[...infoSet]} dataInfo={i + 1} />
          {
            colStarts.map((j) => {
              return (
                <Cell
                  key={`${i},${j}`}
                  i={i}
                  j={j}
                  classes={this.getClassName(i, j)}
                />
              );
            })
          }
        </div>
      );
    });

    return (
      <div className="col-md-5 col-md-offset-1">
        <div className="board-row">
          {this.headers}
        </div>
        {this.body}
      </div>
    );
  }

}

export default Board;
