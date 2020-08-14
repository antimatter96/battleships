import React from 'react';
import Board from './board';
import { rowHeaders, colStarts, lengthOfType, arrOfI, arrOfJ, ships } from './Utils'


class ShipPLacement extends Board {
  constructor(props) {
    super(props);

    let hor = { A: false, B: false, C: false, D: false, E: false };
    let placedBefore = { A: false, B: false, C: false, D: false, E: false };
    let locked = { A: false, B: false, C: false, D: false, E: false };
    let shipErrors = { A: null, B: null, C: null, D: null, E: null }

    this.state = {
      lockReady: false,
      boardValid: false,
      placedBefore: placedBefore,
      hor: hor,
      locked: locked,
      displayError: null,
      shipErrors: shipErrors,
    };
  }

  boardIdValid() {
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

  addShipClass(type, i, j, horizontal) {

  }

  checkOverlap(valI, valJ, ship, horizontal) {
    let j = arrOfJ.indexOf(valJ);
    let i = arrOfI.indexOf(valI);
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
        let intersection = new Set([...this.state.pointsOfShip[shipType]].filter(x => tempPoints.has(x)));
        if (intersection.size > 0) {
          return false;
        }
      }
    }

    return true;
  }

  onClickFunction(e) {
    let ship = e.target.dataset["ship"];
    if (this.state.locked[ship]) {
      // classInverter(ship, true);
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }
    // choicesChanged(ship);
    console.log(e.target);
  }

  btnRot(e) {
    let ship = e.target.dataset["ship"];
    if (this.state.locked[ship]) {
      // classInverter(ship, true);
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }
    console.log(e.target);
    let hor = this.state.hor;
    hor[ship] = !hor[ship]

    this.setState({ hor: hor });

    let dir = hor[ship] ? "Horizontal" : "Vertical";
    //$('#btnRotIndic' + ship).text("Currently " + dir);
    //choicesChanged(ship);
  }


  btnDrop(e) {
    let ship = e.target.dataset["ship"];
    if (this.state.locked[ship]) {
      // classInverter(ship, true);
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Already Locked";
      this.setState({ shipErrors: shipErrors });
      return;
    }

    if (this.state.placedBefore[ship]) {
      this.classList.remove('btn-primary');
      this.classList.add('btn-danger');

      let locked = this.state.locked;
      locked[ship] = true;
      this.setState({ locked: locked });

    } else {
      // classInverter(ship, true);
      let shipErrors = this.state.shipErrors;
      shipErrors[ship] = "Please Place before locking";
      this.setState({ shipErrors: shipErrors });
    }
  }

  static checkBounds(valI, valJ, ship, horizontal) {
    if (horizontal) {
      if (arrOfJ.indexOf(valJ) + lengthOfType[ship] > 10) {
        return false;
      }
    } else {
      if (arrOfI.indexOf(valI) + lengthOfType[ship] > 10) {
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
            <input id={`${ship.st}i`} className="form-control inptXY" data-ship={`${ship.st}`} type="number" min="1" max="10" step="1" placeholder="0" onChange={this.onClickFunction.bind(this)} />
          </span>
          <span className="col-md-1 boardInpt">
            <input id={`${ship.st}j`} className="form-control inptXY" data-ship={`${ship.st}`} minLength="1" maxLength="1" placeholder="A" list="defaultNumbers" onChange={this.onClickFunction.bind(this)} />
          </span>
          <span className="col-md-2 boardBtn">
            <button id={`btnRot${ship.st}`} className="btn btn-info btnRot" data-ship={`${ship.st}`} onClick={this.btnRot.bind(this)}>Rotate</button>
          </span>
          <span className="col-md-4 boardBtn">
            <button id={`btnRotIndic${ship.st}`} className="btn btn-block btn-default" disabled>Currently Vertical</button>
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
      )
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
        <Board />
        <div id="placementControls" className="col-md-6 container">
          <div className="row">
            <div className="col-md-12">
              <h6>Place Starting Point and End Point</h6>
            </div>
          </div>
          {this.main}
        </div>
        <div className="col-md-4 col-md-offset-4 text-center">
          <button id="btnReady" className="btn btn-primary btn-block">Ready</button>
          {this.displayError}
        </div>
      </div>
    )
  }
}

export default ShipPLacement;
