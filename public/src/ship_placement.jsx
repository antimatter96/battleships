import React from 'react';
import Board from './board';
import { rowHeaders, colStarts, lengthOfType, arrOfI, arrOfJ, ships } from './Utils'


class ShipPLacement extends Board {
  constructor(props) {
    super(props);

    let hor = { A: false, B: false, C: false, D: false, E: false };
    let placedBefore = { A: false, B: false, C: false, D: false, E: false };
    let locked = { A: false, B: false, C: false, D: false, E: false };

    this.state = {
      lockReady: false,
      boardValid: false,
      placedBefore: placedBefore,
      hor: hor,
      locked: locked,
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
            <input id={`${ship.st}i`} className="form-control inptXY" data-ship={`${ship.st}`} type="number" min="1" max="10" step="1" placeholder="0" />
          </span>
          <span className="col-md-1 boardInpt">
            <input id={`${ship.st}j`} className="form-control inptXY" data-ship={`${ship.st}`} minLength="1" maxLength="1" placeholder="A" list="defaultNumbers" />
          </span>
          <span className="col-md-2 boardBtn">
            <button id={`btnRot${ship.st}`} className="btn btn-info btnRot" data-ship={`${ship.st}`}>Rotate</button>
          </span>
          <span className="col-md-4 boardBtn">
            <button id={`btnRotIndic${ship.st}`} className="btn btn-block btn-default" disabled>Currently Vertical</button>
          </span>
          <span className="col-md-2 col-md-offset-1 boardBtn">
            <button className="btn btn-primary btn-block btnDrop" data-ship={`${ship.st}`}>Drop</button>
          </span>
          <span className="col-md-12 boardBtn">
            <label id={`errorPlaceShip${ship.st}`} className="label label-default">.</label>
          </span>
        </div>
      )
    });

    this.displayError = "";
    if (this.props.displayError) {
      this.displayError = (
        <label id="errorReady">{this.props.displayError}</label>
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
