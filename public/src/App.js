import React from 'react';
import socketIOClient from "socket.io-client";

import './App.css';
import { validateName, rowHeaders } from './Utils'
import Loader from './loader'
import JoinButton from './join_button'

const STATE_UPDATE = 0.5
const STATE_NAME = 1;
const STATE_JOIN = 2;
const STATE_PLACE = 3;
const STATE_PLAY = 4;

class Square extends React.Component {
  render() {
    return (
      <button className="square"> {this.props.value} </button>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: -1,
      loading: false,
      username: null,
      displayError: null,
      lockName: false,
      lockJoin: false,
    };

    this.gameToken = "";
    this.userToken = "";

    this.userToken = window.localStorage.getItem('userToken');
    this.gameToken = window.localStorage.getItem('gameToken');
    this.gameId = null;

    this.username = null;
  }

  componentDidMount() {
    this.setupSocketIO();
    this.name();
  }

  setupSocketIO() {
    let hostname = window.location.hostname;
    if (hostname === "localhost") {
      hostname = "127.0.0.1:8000";
    }

    this.socket = socketIOClient(hostname);

    this.socket.on("userAdded", this.onUserAdded.bind(this));
    this.socket.on("updateFailed", this.onUpdateFailed.bind(this));
    this.socket.on("updateSuccess", this.onUpdateSuccess.bind(this));
  }

  emit(msg, data) {
    if (!this.socket.connected) {
      setTimeout(() => {
        console.log("Waiting");
        this.emit(msg, data);
      }, 1000)
      return;
    }
    console.log("Emiting", msg, data);
    if (data !== undefined) {
      this.socket.emit(msg, data);
    } else {
      this.socket.emit(msg);
    }
  }

  name() {
    let username = window.localStorage.getItem('username');
    if (username !== null && username !== undefined) {
      this.temp_username = username;
      this.setState({
        loading: true,
        state: STATE_UPDATE,
      });
      this.emit("updateSocket", { "player": username, userToken: this.userToken });
    } else {
      this.setState({
        state: STATE_NAME,
      });
    }
  }

  onUpdateFailed() {
    this.temp_username = null;
    this.userToken = null;

    this.setState({
      loading: false,
      state: STATE_NAME,
    });

    window.localStorage.removeItem("userToken");
    window.localStorage.removeItem("username");
  }

  onUpdateSuccess() {
    this.setState({
      username: this.temp_username,
      loading: false,
      state: STATE_JOIN,
    }, () => {
      this.temp_username = null;
    });
  }

  handleNameSubmit() {
    let valid = validateName(this.temp_username);
    if (valid instanceof Error) {
      this.setState({
        displayError: valid.message
      });
    } else {
      this.setState({
        lockName: true,
        loading: true,
        displayError: null
      });
      this.emit('addUser', { name: this.temp_username });
    }
  }

  onUserNameChange(value) {
    if (this.state.lockName) {
      return;
    }
    this.temp_username = value;
  }

  onUserAdded(data) {
    this.setState({
      loading: false
    });

    if (data.msg !== 'OK') {
      this.temp_username = null;
      this.setState({
        lockName: false,
        lockJoin: false,
        displayError: data.msg
      });
      return;
    }

    this.temp_username = null;

    this.setState({
      state: STATE_JOIN,
      username: data.name,
      userToken: data.userToken,
      displayError: null,
      loading: false,
    });
    window.localStorage.setItem('username', data.name);
    window.localStorage.setItem('userToken', data.userToken);
  }

  handleJoin() {
    if (this.state.lockJoin) {
      this.setState({
        displayError: "Wait"
      });
      return;
    }
    this.setState({
      lockJoin: true,
      loading: true,
      displayError: null
    });
    this.emit('join', { player: this.state.username });
  }

  onLockJoin(_data) {
    this.setState({
      displayError: "Wait",
      lockName: true,
      loading: true
    });
  }

  onStartGame(data) {
    this.setState({
      displayError: null,
      lockName: false,
      loading: false,
      state: STATE_PLACE
    });

    window.localStorage.setItem('gameToken', data.gameToken);
    this.gameToken = data.gameToken;
    this.gameId = data.gameId;
  }

  renderLoader() {
    return (
      <Loader text={"Loading..."} />
    );
  }

  render() {
    this.main = ""
    if (this.state.state === STATE_UPDATE) {
      
    } else if (this.state.state === STATE_NAME) {
      this.main = (
        <NameSelector
          displayError={this.state.displayError}
          onClick={this.handleNameSubmit.bind(this)}
          username={this.state.username}
          onUserNameChange={this.onUserNameChange.bind(this)}
        />
      )
    } else if (this.state.state === STATE_JOIN) {
      this.main = (
        <JoinButton
          displayError={this.state.displayError}
          onClick={this.handleJoin.bind(this)}
        />
      )
    }

    this.loader = "";
    if (this.state.loading) {
      this.loader = (
        <div> { this.renderLoader() } </div>
      )
    }

    this.dataList = (
      <datalist id="defaultNumbers">
        {
          rowHeaders.slice(1, 11).map((i) => {
            return (<option key={i} value={i} />)
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

      <div className="row">
        <div className="col-md-4 col-md-offset-4 text-center">
          <label className="form-label" htmlFor="inptName">Username</label>
        </div>

        <br />

        <div className="col-md-4 col-md-offset-4 centered">
          <input
            name="inptName"
            className="input-lg form-control"
            type="text"
            onChange={(event) => { this.props.onUserNameChange(event.target.value) }}
          />
        </div>

        <div className="col-md-12 text-center"><br /></div>

        <div className="col-md-4 col-md-offset-4 text-center">
          <button className="btn btn-primary btn-block" onClick={this.props.onClick}>Submit</button>
          {this.displayError}
        </div>
      </div>
    );
  }
}


export default App;
