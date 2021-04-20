import React from 'react';
import Board from './board';
import { rowHeaders, colStarts, lengthOfType, arrOfI, arrOfJ, ships, setIntersection } from './Utils';

class ShipPLacement extends Board {
  constructor(props) {
    super(props);

    let hor = { A: false, B: false, C: false, D: false, E: false };
    let placedBefore = { A: false, B: false, C: false, D: false, E: false };
    let locked = { A: false, B: false, C: false, D: false, E: false };
    let shipErrors = { A: null, B: null, C: null, D: null, E: null };

    let pointsOfShip = {
      A: new Set(),
      B: new Set(),
      C: new Set(),
      D: new Set(),
      E: new Set(),
    };

    let playerBoardClasses = new Array(10);
    for (let i = 0; i < 10; i++) {
      playerBoardClasses[i] = (new Array(10)).fill(0);
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        playerBoardClasses[i][j] = new Set();
      }
    }

    let playerBoard = new Array(10);
    for (let i = 0; i < 10; i++) {
      playerBoard[i] = (new Array(10)).fill(0);
    }

    this.state = {
      lockReady: false,
      boardValid: false,
      placedBefore: placedBefore,
      hor: hor,
      locked: locked,
      displayError: null,
      shipErrors: shipErrors,
      pointsOfShip: pointsOfShip,
      playerBoardClasses: playerBoardClasses,
      playerBoard: playerBoard,

      _tempXShipA: null,
      _tempYShipA: null,
      _tempXShipB: null,
      _tempYShipB: null,
      _tempXShipC: null,
      _tempYShipC: null,
      _tempXShipD: null,
      _tempYShipD: null,
      _tempXShipE: null,
      _tempYShipE: null,
    };

    //this.inputRefs = [];
  }

  boardIsValid() {
    for (let shipType in this.state.pointsOfShip) {
      if (!Object.prototype.hasOwnProperty.call(this.state.pointsOfShip, shipType)) {
        continue;
      }
      if (this.state.pointsOfShip[shipType].size !== lengthOfType[shipType]) {
        return false;
      }
      if (!this.state.placedBefore[shipType]) {
        return false;
      }
    }
    return true;
  }

  checkOverlap(valI, valJ, ship, horizontal) {
    let j = arrOfJ.indexOf(valJ.toString());
    let i = arrOfI.indexOf(valI.toString());
    let tempPoints = new Set();

    if (horizontal) {
      for (let y = j; y < j + lengthOfType[ship]; y++) {
        tempPoints.add(JSON.stringify({ 'x': i, 'y': y }));
      }
    } else {
      for (let x = i; x < i + lengthOfType[ship]; x++) {
        tempPoints.add(JSON.stringify({ 'x': x, 'y': j }));
      }
    }

    for (let shipType in this.state.pointsOfShip) {
      if (!Object.prototype.hasOwnProperty.call(this.state.pointsOfShip, shipType)) {
        continue;
      }
      if (shipType != ship) {
        let intersection = setIntersection(this.state.pointsOfShip[shipType], tempPoints);
        if (intersection.size > 0) {
          return true;
        }
      }
    }

    return false;
  }

  onChangeFunction(e) {
    let ship = e.target.dataset["ship"];
    let shipErrors = this.state.shipErrors;

    if (this.state.locked[ship]) {
      shipErrors[ship] = "Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }

    if (e.target.value.trim() === "") {
      shipErrors[ship] = null;
      this.setState({ shipErrors: shipErrors });
      return;
    }

    let callback = () => { this.choicesChanged(ship); };

    let coordinate = e.target.dataset["coordinate"];
    let variable = `_temp${coordinate}Ship${ship}`;
    if (coordinate == 'X') {
      let val = parseInt(e.target.value);
      if (val > 9 || val < 0) {
        shipErrors[ship] = "Invalid Entries";
        this.setState({ shipErrors: shipErrors });
        return;
      }
      this.setState({
        [variable]: val,
      }, callback);
    } else {
      let val = e.target.value.toUpperCase();
      if (val.length != "1" || !val.match(/[A-J]/)) {
        shipErrors[ship] = "Invalid Entries";
        this.setState({ shipErrors: shipErrors });
        return;
      }
      this.setState({
        [variable]: val,
      }, callback);
    }
  }

  choicesChanged(ship) {
    let shipErrors = this.state.shipErrors;

    shipErrors[ship] = null;

    let valI = this.state[`_tempXShip${ship}`];
    let valJ = this.state[`_tempYShip${ship}`];

    let possibleBounds = true;
    let possibleOverlap = true;

    if (valI && valJ) {
      if (arrOfI.indexOf(valI.toString()) > -1 && arrOfJ.indexOf(valJ) > -1) {
        possibleBounds = ShipPLacement.checkBounds(valI, valJ, ship, this.state.hor[ship]);
        if (possibleBounds) {
          possibleOverlap = this.checkOverlap(valI, valJ, ship, this.state.hor[ship]);
          if (!possibleOverlap) {
            let placedBefore = this.state.placedBefore;

            let callback = () => {
              placedBefore[ship] = true;
              this.setState({ placedBefore: placedBefore });

              this.addPointsToShip(ship, arrOfI.indexOf(valI.toString()), arrOfJ.indexOf(valJ), this.state.hor[ship]);
              this.addShipClass(ship, arrOfI.indexOf(valI.toString()), arrOfJ.indexOf(valJ), this.state.hor[ship]);
            };

            if (placedBefore[ship]) {
              this.removeShip(ship, callback);
            } else {
              callback();
            }

            return;
          } else {
            shipErrors[ship] = "Overlapping ships";
            this.setState({ shipErrors: shipErrors });
            return;
          }
        } else {
          shipErrors[ship] = "Out of bounds";
          this.setState({ shipErrors: shipErrors });
          return;
        }
      } else {
        shipErrors[ship] = "Invalid entries";
        this.setState({ shipErrors: shipErrors });
        return;
      }
    }
  }

  removeShip(type, cb) {
    console.log("removeShip", type);
    let playerBoard = this.state.playerBoard;
    let pointsOfShip = this.state.pointsOfShip;
    let playerBoardClasses = this.state.playerBoardClasses;

    let points = pointsOfShip[type];

    let it = points.keys();

    while (!it.done) {
      let point = it.next().value;
      console.log(point);
      //point = point.value;
      if (point) {
        let pointJSON = JSON.parse(point);
        let x = pointJSON.x;
        let y = pointJSON.y;

        console.log(playerBoardClasses[x][y]);
        playerBoardClasses[x][y].delete(`ship${type}`);
        playerBoard[x][y] = 0;
      } else {
        break;
      }
    }

    pointsOfShip[type] = new Set();

    this.setState({
      pointsOfShip: pointsOfShip,
      playerBoardClasses: playerBoardClasses,
      playerBoard: playerBoard,
    }, cb);
  }

  addPointsToShip(type, i, j, horizontal) {
    let playerBoard = this.state.playerBoard;

    let pointsOfShip = this.state.pointsOfShip;
    let points = pointsOfShip[type];

    points.clear();
    if (horizontal) {
      for (let y = j; y < j + lengthOfType[type]; y++) {
        playerBoard[i][y] = 1;
        points.add(JSON.stringify({ 'x': i, 'y': y }));
      }
    } else {
      for (let x = i; x < i + lengthOfType[type]; x++) {
        playerBoard[x][j] = 1;
        points.add(JSON.stringify({ 'x': x, 'y': j }));
      }
    }

    pointsOfShip[type] = points;
    this.setState({
      pointsOfShip: pointsOfShip,
      playerBoard: playerBoard,
    });
  }

  addShipClass(type, i, j, horizontal) {
    // console.log(type, i, j);
    let playerBoardClasses = this.state.playerBoardClasses;
    // console.log(playerBoardClasses);
    if (horizontal) {
      for (let y = j; y < j + lengthOfType[type]; y++) {
        playerBoardClasses[i][y].add(`ship${type}`);
      }
    } else {
      for (let x = i; x < i + lengthOfType[type]; x++) {
        // console.log(x, j);
        playerBoardClasses[x][j].add(`ship${type}`);
      }
    }

    this.setState({
      playerBoardClasses: playerBoardClasses,
    });
  }

  btnRot(e) {
    let ship = e.target.dataset["ship"];
    if (this.state.locked[ship]) {
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }

    let hor = this.state.hor;
    hor[ship] = !hor[ship];

    let callback = () => { this.choicesChanged(ship); };

    this.setState({
      hor: hor,
    }, callback);
  }

  btnDrop(e) {
    let ship = e.target.dataset["ship"];
    if (this.state.locked[ship]) {
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Already Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }

    if (this.state.placedBefore[ship]) {
      e.target.classList.remove('btn-primary');
      e.target.classList.add('btn-danger');

      let locked = this.state.locked;
      locked[ship] = true;
      this.setState({ locked: locked });
    } else {
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Please Place before locking";
      this.setState({ shipErrors: shipErrors });
    }
  }

  ready() {
    if (this.state.lockReady) {
      this.setState({
        displayError: "Wait",
      });
      return;
    }

    let boardValid = this.boardIsValid();
    if (!boardValid) {
      this.setState({
        displayError: "Invalid Board",
      });
      return;
    }

    let locked = this.state.locked;

    for (let shipType in locked) {
      if (!Object.prototype.hasOwnProperty.call(locked, shipType)) {
        continue;
      }
      locked[shipType] = true;
    }

    this.setState({
      displayError: null,
      locked: locked,
      lockReady: true,
    });

    let toSend = this.makeToSend();
    this.props.onChosen(toSend, {
      playerBoard: this.state.playerBoard,
      playerBoardClasses: this.state.playerBoardClasses,
    });
    //console.log(toSend);
  }

  makeToSend() {
    let arrToSend = {};
    for (let shipType in this.state.pointsOfShip) {
      if (!Object.prototype.hasOwnProperty.call(this.state.pointsOfShip, shipType)) {
        continue;
      }
      arrToSend[shipType] = {};
      let points = this.state.pointsOfShip[shipType];
      let z = points.keys();
      let i = 0;
      while (!z.done) {
        let point = z.next();
        point = point.value;
        if (!point) {
          break;
        }
        point = JSON.parse(point);
        arrToSend[shipType][i] = point;
        i++;
      }
    }
    return arrToSend;
  }

  static checkBounds(valI, valJ, ship, horizontal) {
    if (horizontal) {
      if (arrOfJ.indexOf(valJ.toString()) + lengthOfType[ship] > 10) {
        return false;
      }
    } else {
      if (arrOfI.indexOf(valI.toString()) + lengthOfType[ship] > 10) {
        return false;
      }
    }
    return true;
  }

  render() {
    this.main = ships.map((ship, i) => {
      return (
        <div className="row" key={i}>
          <label>Place {`${ship.name}`}</label>
          <br />
          <span className="col-md-1 boardInpt">
            <input id={`${ship.st}i`} className="form-control inptXY" data-ship={`${ship.st}`} data-coordinate={`X`} type="number" min="1" max="10" step="1" placeholder="0" onChange={this.onChangeFunction.bind(this)} />
          </span>
          <span className="col-md-1 boardInpt">
            <input id={`${ship.st}j`} className="form-control inptXY" data-ship={`${ship.st}`} data-coordinate={`Y`} minLength="1" maxLength="1" placeholder="A" list="defaultNumbers" onChange={this.onChangeFunction.bind(this)} />
          </span>
          <span className="col-md-2 boardBtn">
            <button id={`btnRot${ship.st}`} className="btn btn-info btnRot" data-ship={`${ship.st}`} onClick={this.btnRot.bind(this)}>Rotate</button>
          </span>
          <span className="col-md-4 boardBtn">
            <button id={`btnRotIndic${ship.st}`} className="btn btn-block btn-default" disabled>Currently {this.state.hor[ship.st] ? "Horizontal" : "Vertical"}</button>
          </span>
          <span className="col-md-2 col-md-offset-1 boardBtn">
            <button className="btn btn-primary btn-block btnDrop" data-ship={`${ship.st}`} onClick={this.btnDrop.bind(this)}>Drop</button>
          </span>
          <span className="col-md-12 boardBtn">
            {
              this.state.shipErrors[ship.st] ? <label className="label label-danger">{this.state.shipErrors[ship.st]}</label> : ""
            }
          </span>
        </div>
      );
    });

    this.displayError = "";
    if (this.state.displayError) {
      this.displayError = (
        <label id="errorReady">{this.state.displayError}</label>
      );
    }

    return (
      <div id="choosePlacement" className="row">
        <div className="col-md-6 col-md-offset-3 text-center">
          <h3>Place your ships</h3>
        </div>
        <Board
          playerBoardClasses={this.state.playerBoardClasses}
          playerBoard={this.state.playerBoard}
        />
        <div id="placementControls" className="col-md-6 container">
          <div className="row">
            <div className="col-md-12">
              <h6>Place Starting Point and End Point</h6>
            </div>
          </div>
          {this.main}
        </div>
        <div className="col-md-4 col-md-offset-4 text-center">
          <button id="btnReady" className="btn btn-primary btn-block" onClick={this.ready.bind(this)}>Ready</button>
          {this.displayError}
        </div>
      </div>
    );
  }
}

export default ShipPLacement;
