import React from 'react';


class Cell extends React.Component {
  render() {
    return (
      <span
        className={"btn " + (this.props.classes || []).join(' ')}
        id={`cell-${this.props.i}${this.props.j}`}
        data-info={this.props.dataInfo}
      ></span>
    );
  }
}

export default Cell;

