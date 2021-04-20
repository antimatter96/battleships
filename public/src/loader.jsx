import React from 'react';

const colorArr = [
  "#F44336", "#E91E63", "#9C27B0", "#673AB7",
  "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
  "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
  "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
];

const colorArrLength = colorArr.length;

class Loader extends React.Component {
  constructor() {
    super();
    this.state = {
      c1: colorArr[0],
      c2: colorArr[0],
    };
  }

  rand() {
    return parseInt(Math.random() * colorArrLength);
  }

  changeColors() {
    this.setState({
      c1: colorArr[this.rand()],
      c2: colorArr[this.rand()],
    });
  }

  componentDidMount() {
    this.intervalID = setInterval(this.changeColors.bind(this), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render() {
    return (
      <nav id="globalLoading" className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="spinner">
            <div id="_dot1" className="dot1" style={{ "backgroundColor": this.state.c1 }}></div>
            <div id="_dot2" className="dot2" style={{ "backgroundColor": this.state.c2 }}></div>
          </div>
          <div className="globalLoading-text">{this.props.text}</div>
        </div>
      </nav>
    );
  }
}

export default Loader;
