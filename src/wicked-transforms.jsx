
import {} from "./index.html.mustache";
import ReactDOM from "react-dom";
import React from "react";
import {} from "normalize.css/normalize.css";
import style from "./wicked-transforms.scss";

const MAX_REGIONS = 4;
const getPositions = function({count, width, height}) {
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [{
      x: 0,
      y: 0,
      width: width,
      height: height,
    }];
  }
  if (count === 2) {
    return [{
      x: 0,
      y: 0,
      width: width / 2,
      height: height,
    } , {
      x: width / 2,
      y: 0,
      width: width / 2,
      height: height,
    }];
  }
  if (count === 3) {
    return [{
      x: 0,
      y: 0,
      width: width / 3,
      height: height,
    }, {
      x: width / 3,
      y: 0,
      width: width / 3,
      height: height,
    }, {
      x: (width / 3) * 2,
      y: 0,
      width: width / 3,
      height: height,
    }];
  }
  if (count === 4) {
    return [{
      x: 0,
      y: 0,
      width: width / 2,
      height: height / 2,
    }, {
      x: width / 2,
      y: 0,
      width: width / 2,
      height: height / 2,
    }, {
      x: 0,
      y: height / 2,
      width: width / 2,
      height: height / 2,
    }, {
      x: width / 2,
      y: height / 2,
      width: width / 2,
      height: height / 2,
    }];
  }
};

let _id = 0;
const uid = function() {
  const ret = `thingy-${_id}`;
  _id += 1;
  return ret;
};

class WickedTransforms extends React.Component {
  constructor() {
    super();
    this.state = {
      regions: [],
      scene: {
        width: 1920,
        height: 1080,
      },
    };
  }

  rand255() {
    return Math.floor(Math.random() * 255);
  }

  randomColor() {
    return `rgb(${this.rand255()}, ${this.rand255()}, ${this.rand255()})`;
  }

  addRegion() {
    if (this.state.regions.length >= MAX_REGIONS) {
      return;
    }
    const regions = this.state.regions.concat([{
      id: uid(),
      backgroundColor: this.randomColor(),
    }]);
    this.setState({regions});
  }

  removeRegion(region) {
    const regions = this.state.regions.filter(r => r !== region);
    this.setState({regions});
  }

  render() {
    return (
      <div className={style.Container}>
        <TVScreen onRemoveRegion={::this.removeRegion} regions={this.state.regions} scene={this.state.scene} />
        <div className={style.Buttons}>
          <button onClick={::this.addRegion} className={style.PlusButton}>+</button>
          <button className={style.MinusButton}>-</button>
        </div>
      </div>
    );
  }
}

class TVScreen extends React.Component {

  removeRegion(region) {
    this.props.onRemoveRegion(region);
  }

  getRegions() {
    const count = this.props.regions.length;
    const width = this.props.scene.width;
    const height = this.props.scene.height;
    const positions = getPositions({count, width, height});
    return this.props.regions.map((region, i) => {
      const position = positions[i];
      return <Region onClick={this.removeRegion.bind(this, region)} key={region.id} scene={this.props.scene} region={region} position={position} />;
    });
  }

  render() {
    return (
      <div className={style.TVScreen}>
        {this.getRegions()}
      </div>
    );
  }
}

class Region extends React.Component {
  pct(float) {
    return `${float * 100}%`;
  }

  getStyle() {
    const backgroundColor = this.props.region.backgroundColor;
    const left = this.pct(this.props.position.x / this.props.scene.width);
    const top = this.pct(this.props.position.y / this.props.scene.height);
    const width = this.pct(this.props.position.width / this.props.scene.width);
    const height = this.pct(this.props.position.height / this.props.scene.height);

    return {backgroundColor, left, top, width, height};
  }

  render() {
    const myStyle = this.getStyle();
    return (
      <div onClick={this.props.onClick} style={myStyle} className={style.Region}>
        {this.props.region.id}
      </div>
    );
  }
}

ReactDOM.render(<WickedTransforms />, document.querySelector("main"));
