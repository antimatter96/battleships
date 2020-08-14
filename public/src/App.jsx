import React from 'react';
import socketIOClient from "socket.io-client";

import './css/App.css';
import { validateName, rowHeaders } from './Utils'
import Loader from './loader'
import JoinButton from './join_button'
import NameSelector from './name_selector'
import ShipPLacement from './ship_placement'

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
      userToken: null,
      gameToken: null,
      gameId: null,

      displayError: null,

      lockName: false,
      lockJoin: false,
    };

    this.temp_userToken = window.localStorage.getItem('userToken');
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
    this.socket.on("startGame", this.onStartGame.bind(this));
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
    if ( typeof username === "string" ) {
      this.temp_username = username;
      this.setState({
        loading: true,
        state: STATE_UPDATE,
      });
      this.emit("updateSocket", { "player": username, userToken: this.temp_userToken });
    } else {
      this.setState({
        loading: false,
        state: STATE_NAME,
        displayError: null,
      });
    }
  }

  onUpdateFailed() {
    this.temp_username = null;
    this.temp_userToken = null;

    window.localStorage.removeItem("userToken");
    window.localStorage.removeItem("username");

    this.setState({
      loading: false,
      state: STATE_NAME,
      displayError: null,
    });
  }

  onUpdateSuccess() {
    this.setState({
      username: this.temp_username,
      userToken: this.temp_userToken,
      loading: false,
      state: STATE_JOIN,
    }, () => {
      this.temp_username = null;
      this.temp_userToken = null;
    });
  }

  handleNameSubmit() {
    if (this.state.lockName) {
      this.setState({
        displayError: "Please Wait"
      });
      return;
    }
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
      lockJoin: false,
      lockName: false,
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
      state: STATE_PLACE,
      gameId: data.gameId,
      gameToken: data.gameToken,
    });

    window.localStorage.setItem('gameToken', data.gameToken);
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
    } else if (this.state.state === STATE_PLACE) {
    this.main = (
      <ShipPLacement/>
    )
  }

    this.loader = "";
    if (this.state.loading) {
      this.loader = (
        <div>
          <Loader text={"Loading..."}/>
        </div>
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



export default App;
