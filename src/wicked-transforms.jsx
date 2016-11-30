
import {} from "./index.html.mustache";
import ReactDOM from "react-dom";
import React from "react";
import {} from "normalize.css/normalize.css";
import style from "./wicked-transforms.scss";

const MAX_REGIONS = 4;
const TRANSITION_SPEED = 300;

const transitions = [];
const addTransition = function(transition) {
  const {start, startAnim, endAnim, end} = transition;
  if (!start || !end) {
    throw new Error("Missing start and end of transition!");
  }
  if (startAnim === undefined) {
    transition.startAnim = start;
  }
  if (endAnim === undefined) {
    transition.endAnim = end;
  }
  // Each transition gets a transition and a reversed version of itself
  transitions.push(transition);
  const reversed = {
    name: `${transition.name} (reversed)`,
    start: transition.end,
    startAnim: transition.endAnim,
    endAnim: transition.startAnim,
    end: transition.start,
  };
  transitions.push(reversed);
};

/**
 * Convert from our weird array fraction syntax to proper american floats
 */
const normalizeRegion = function(region) {
  const ret = {};
  ["x", "y", "width", "height"].forEach((name) => {
    const param = region[name];
    if (typeof param.length === "number") {
      if (param.length !== 2) {
        throw new Error("Invalid state, array syntax is a fraction, should have two params");
      }
      const [numerator, denominator] = param;
      ret[name] = numerator / denominator;
    }
    else {
      ret[name] = region[name];
    }
  });
  return ret;
};

/**
 * Given a region, yield an object with {top, left, width, height} strings
 */
const getRegionCss = function(region) {
  region = normalizeRegion(region);
  return {
    left: `${region.x}%`,
    top: `${region.y}%`,
    width: `${region.width}%`,
    height: `${region.height}%`,
  };
};

// Boring, if we're going to one person they should just appear
addTransition({
  name: "0 --> 1",
  start: [],
  startAnim: [{
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }],
  end: [{
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }],
  defaultSpeed: "0",
});

// 1 --> 2 split-screen
addTransition({
  name: "1 --> 1x2",
  start: [{
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }],
  startAnim: [{
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }, {
    x: 100,
    y: 0,
    width: 50,
    height: 100,
  }],
  end: [{
    x: 0,
    y: 0,
    width: 50,
    height: 100,
  }, {
    x: 50,
    y: 0,
    width: 50,
    height: 100,
  }],
});

const getPositions = function({count}) {
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [{
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }];
  }
  if (count === 2) {
    return [{
      x: 0,
      y: 0,
      width: 50,
      height: 100,
    } , {
      x: 50,
      y: 0,
      width: 50,
      height: 100,
    }];
  }
  if (count === 3) {
    return [{
      x: 0,
      y: 0,
      width: [100, 3],
      height: 100,
    }, {
      x: [100, 3],
      y: 0,
      width: [100, 3],
      height: 100,
    }, {
      x: [100 * 2, 3],
      y: 0,
      width: [100, 3],
      height: 100,
    }];
  }
  if (count === 4) {
    return [{
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    }, {
      x: 50,
      y: 0,
      width: 50,
      height: 50,
    }, {
      x: 0,
      y: 50,
      width: 50,
      height: 50,
    }, {
      x: 50,
      y: 50,
      width: 50,
      height: 50,
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
    const style = getRegionCss(this.props.position);
    const backgroundColor = this.props.region.backgroundColor;
    const transitionDelay = "0s";
    const transitionDuration = `${TRANSITION_SPEED}ms`;
    const transitionProperty = "all";
    const transitionTimingFunction = "ease";

    return {...style, backgroundColor, transitionDelay, transitionDuration, transitionProperty, transitionTimingFunction};
  }

  render() {
    const myStyle = this.getStyle();
    return (
      <div onClick={this.props.onClick} style={myStyle} className={style.Region}></div>
    );
  }
}

ReactDOM.render(<WickedTransforms />, document.querySelector("main"));
