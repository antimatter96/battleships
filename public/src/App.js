import React from 'react';
import logo from './logo.svg';
import './App.css';

const STATE_NAME = 1;
const STATE_JOIN = 1;
const STATE_PLACE = 1;
const STATE_PLAY = 1;

const rowHeaders = ['/', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const colStarts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    /*
    <div id="chooseBoard" class="col-md-5 col-md-offset-1">
        {% for i in range(0, 10) -%}
        <div class="board-row">
          <span class="board-cell-info btn" data-info="{{ i+1 }}"></span>
          {% for j in range(0, 10) -%}
          <span class="board-cell btn" id="cell-{{ i }}{{ j }}"></span>
          {%- endfor %}
        </div>
        {%- endfor %}
      </div>
    */

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
          <span className="board-cell-info btn" data-info={i+1}></span>
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

class Square extends React.Component {
  render() {
    return (
      <button className="square">
        {this.props.value}
      </button>
    );
  }
}

class Loader extends React.Component {
  render() {
    return (
      <nav id="globalLoading" className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="spinner">
            <div id="_dot1" className="dot1"></div>
            <div id="_dot2" className="dot2"></div>
          </div>
          <div className="globalLoading-text">{this.props.value}</div>
        </div>
      </nav>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  renderLoader(text) {
    return (
      <Loader value={text} />
    );
  }

  render() {
    this.loader = "";
    if (this.props.value === "loading") {
      this.loader = (
        <div>
          {this.renderLoader("text")}
        </div>
      )
    }

    this.dataList = (
      <datalist id="defaultNumbers">
      {
        rowHeaders.slice(1, 11).map((i) => {
          return (
            <option key={i} value={i}/>
          )
        })
      }
    </datalist>
    );



    return (
      <>
        {this.loader}
        <Board/>



        {this.dataList}
      </>
    );
  }
}

export default App;
