import React from 'react';

class NameSelector extends React.Component {
  render() {
    this.displayError = "";
    if (this.props.displayError) {
      this.displayError = (
        <label id="errorName">{ this.props.displayError }</label>
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
          <button className="btn btn-primary btn-block" onClick={ this.props.onClick }>Submit</button>
          { this.displayError }
        </div>
      </div>
    );
  }
}

export default NameSelector;

