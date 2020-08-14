import React from 'react';
import { rowHeaders, colStarts } from './Utils'

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    this.headers = rowHeaders.map((number) => {
      return (
        <span
          key={number.toString()}
          className="board-cell-info btn"
          data-info={number}
        >
        </span>
      )
    });

    this.body = colStarts.map((i) => {
      return (
        <div key={i} className="board-row" >
          <span className="board-cell-info btn" data-info={i + 1}></span>
          {
            colStarts.map((j) => {
              return (
                <span key={j} className="board-cell btn" id={`cell-${i}${j}`}></span>
              )
            })
          }
        </div>
      )
    });

    return (
      <>
        <div id="chooseBoard" className="col-md-5 col-md-offset-1">
          <div className="board-row">
            {this.headers}
          </div>

          {this.body}

        </div>
      </>
    );
  }
}

export default Board;
