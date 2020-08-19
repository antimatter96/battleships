import React from 'react';

class JoinButton extends React.Component {
  render() {
    this.displayError = "";
    if (this.props.displayError) {
      this.displayError = (
        <label>{this.props.displayError}</label>
      );
    }

    return (
      <div className="row">
        <div className="col-md-4 col-md-offset-4 text-center">
          <button className="btn btn-primary btn-block" onClick={this.props.onClick}>Join Game</button>
          {this.displayError}
        </div>
      </div>
    );
  }
}

export default JoinButton
