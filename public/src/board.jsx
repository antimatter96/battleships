import React from 'react';
import { rowHeaders, colStarts, lengthOfType, arrOfI, arrOfJ } from './Utils'
import Cell from './cell'

const infoSet = new Set(["board-cell-info"]);
const btnSet = new Set(["board-cell"]);

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

    let playerBoard = new Array(10);
    for (let i = 0; i < 10; i++) {
      playerBoard[i] = (new Array(10)).fill(0);
    }

    this.state = {
      pointsOfShip: pointsOfShip,
      playerBoard: playerBoard,
    };
  }

  render() {
    this.headers = rowHeaders.map((number) => {
      return (
        <Cell
          key={ number.toString() }
          dataInfo={ number }
          classes={ [...infoSet] }
        />
      )
    });

    this.body = colStarts.map((i) => {
      return (
        <div key={ i } className="board-row" >
          <Cell classes={ [...infoSet] } dataInfo={ i + 1 }/>
          {
            colStarts.map((j) => {
              return (
                <Cell
                  key={ j }

                  i={ i }
                  j={ j }
                  classes={ [...btnSet] }
                />
              )
            })
          }
        </div>
      )
    });

    return (
      <div className="col-md-5 col-md-offset-1">
        <div className="board-row">
          { this.headers }
        </div>
        { this.body }
      </div>
    );
  }

}

export default Board;
