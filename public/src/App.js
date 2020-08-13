import React from 'react';
import socketIOClient from "socket.io-client";

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

class Square extends React.Component {
  render() {
    return (
      <button className="square"> {this.props.value} </button>
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
      state: STATE_NAME,
      loading: false,
      userame: "",
      displayError: "",
      lockName: false,
    };

    this.gameToken = "";
    this.nameToken = "";

    this.userToken = window.localStorage.getItem('userToken');
    this.gameToken = window.localStorage.getItem('gameToken');
    this.gameId = null;

    this.username = 'Not Choosen';

    this.setupSocketIO();
    this.name();
  }

  setupSocketIO() {
    let hostname = window.location.hostname;
    if (hostname === "localhost") {
      hostname = "127.0.0.1:8000";
    }

    this.socket = socketIOClient.connect(hostname);

    let orginal = this.socket.emit.bind(this.socket);
    this.socket.emit = function (msg, data) {
      if (data !== undefined) {
        console.log(data);
        data.userToken = this.userToken;
        data.gameToken = this.gameToken;
        orginal(msg, data);
      } else {
        orginal(msg);
      }
    }
  }

  name() {
    let username = window.localStorage.getItem('username');
    if (username) {
      this.setState({ userame: username });
      this.socket.emit('updateSocket', { player: username });
      this.setState({ state: STATE_JOIN });
    } else {
      this.nameDisplayError = "";
    }
  }

  handleNameSubmit(event) {
    let valid = validateName(this.temp_username);
    if (valid instanceof Error) {
      this.setState({ displayError : valid.message });
    } else {
      this.setState({lockName: true, loading: true});
      console.log(this.state.username, this.temp_username);
      this.socket.emit('addUser', { name: this.temp_username })
    }
  }

  onUserNameChange(value) {
    if (this.state.lockName) {
      return;
    }
    this.temp_username = value;
  }

  renderLoader() {
    return (
      <Loader value={"Loading..."} />
    );
  }

  render() {
    this.main = ""
    if (this.state.state === STATE_NAME) {
      this.main = (
        <NameSelector displayError={this.state.displayError} onClick={this.handleNameSubmit.bind(this)} username={this.state.username} changeFirstName={this.onUserNameChange.bind(this)}/>
      )
    }

    this.loader = "";
    if (this.state.loading) {
      this.loader = (
        <div> {this.renderLoader()} </div>
      )
    }

    this.dataList = (
      <datalist id="defaultNumbers">
        {
          rowHeaders.slice(1, 11).map((i) => {
            return ( <option key={i} value={i} /> )
          })
        }
      </datalist>
    );

    return (
      <>
        {this.main}
        {this.loader}

        {this.dataList}
      </>
    );
  }
}


class NameSelector extends React.Component {
  render() {
    this.displayError = "";
    if (this.props.displayError) {
      this.displayError = (
        <label id="errorName">{this.props.displayError}</label>
      );
    }

    return (
      <>
        <div id="namePrompt" className="row">
          <div className="col-md-4 col-md-offset-4 text-center">
            <label className="form-label" htmlFor="inptName">Username</label>
          </div>

          <br />

          <div className="col-md-4 col-md-offset-4 centered">
            <input id="inptName" className="input-lg form-control" type="text" onChange={(event) => this.props.changeFirstName(event.target.value)} value={this.props.username} />
          </div>

          <div className="col-md-12 text-center">
            <br />
          </div>

          <div className="col-md-4 col-md-offset-4 text-center">
            <button id="btnSubmitName" className="btn btn-primary btn-block" onClick={this.props.onClick}>Submit</button>
            {this.displayError}
          </div>
        </div>
      </>
    );
  }
}

export default App;


function validateName(name) {
  if (name == undefined || name == null) {
    return new Error("Too Short. Minimum 5 characters");
  }
  if (name.length < 5) {
    return new Error("Too Short. Minimum 5 characters");
  }
  if (name.length > 255) {
    return new Error("Too Long. Maximum 255 characters");
  }
  if (/^\w+$/.test(name)) {
    return true;
  }
  return new Error("Please Choose alphabets, numbers or '_'");
}
